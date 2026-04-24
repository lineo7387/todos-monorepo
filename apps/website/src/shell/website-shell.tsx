import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate as useRouterNavigate, useNavigationType } from "react-router-dom";
import { createTodoAppController, createTodoAppViewModel, type TodoAppState } from "todo-app";
import {
  createBrowserSessionStorageAdapter,
  createSupabaseAuthRepository,
  createSupabaseTodoRepository,
  createTodoSupabaseClient,
} from "todo-data";
import {
  deriveWorkspaceTaskView,
  getJoinTeamSuccessOutcome,
  getWorkspaceRouteTitle,
  resolveWorkspaceRouteEffect,
} from "workspace-shell";

import { TopLevelNavigation } from "../components/top-level-navigation.tsx";
import { getWebsiteSupabaseEnv } from "../config/env.ts";
import { AuthPage } from "../pages/auth-page.tsx";
import type { WebsiteWorkspace, WorkspaceDateView, WorkspaceTaskFilter } from "../pages/types.ts";
import { getWebsiteRouteHref, parseWebsiteRoute, type WebsiteRoute } from "../routing/routes.ts";
import { WebsiteSignedInRoutes } from "../routing/signed-in-routes.tsx";

const FALLBACK_STATE: TodoAppState = {
  status: "signed-out",
  session: null,
  workspaces: [],
  activeWorkspaceId: null,
  todos: [],
  pendingMutations: 0,
  lastError: null,
  lastErrorKind: null,
  signInFieldErrors: {
    email: null,
    password: null,
  },
  todoTitleError: null,
  lastMutation: null,
};

interface WebsiteBootstrap {
  controller: ReturnType<typeof createTodoAppController> | null;
  envError: string | null;
  workspaceShellLocale: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong.";
}

function createWebsiteBootstrap(): WebsiteBootstrap {
  try {
    const env = getWebsiteSupabaseEnv();
    const storage = createBrowserSessionStorageAdapter(window.localStorage);
    const client = createTodoSupabaseClient({
      env,
      runtime: "web",
      requestTimeoutMs: env.requestTimeoutMs,
      sessionStorage: storage,
    });

    return {
      controller: createTodoAppController({
        authRepository: createSupabaseAuthRepository(client),
        todoRepository: createSupabaseTodoRepository(client),
      }),
      envError: null,
      workspaceShellLocale: env.workspaceShellLocale,
    };
  } catch (error) {
    return {
      controller: null,
      envError: toErrorMessage(error),
      workspaceShellLocale: "en",
    };
  }
}

function getEmptyStateCopy(workspace: WebsiteWorkspace | null) {
  if (!workspace) {
    return {
      title: "Choose a workspace to begin.",
      body: "Once a workspace is available, new tasks and refresh actions will target that scope.",
    };
  }

  if (workspace.kind === "team") {
    return {
      title: `Start the shared list for ${workspace.name}.`,
      body: "New team tasks will persist in Supabase and become visible to every member.",
    };
  }

  return {
    title: "Create your first synced todo.",
    body: "New personal tasks will appear here and persist for this account across app restarts.",
  };
}

function getCurrentDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSelectedDateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function WebsiteAppShell() {
  const [joinFeedback, setJoinFeedback] = useState<{
    kind: "error" | "notice";
    message: string;
  } | null>(null);
  const [bootstrap] = useState(createWebsiteBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [draftTeamName, setDraftTeamName] = useState("");
  const [dateView, setDateView] = useState<WorkspaceDateView>("all");
  const [selectedDate, setSelectedDate] = useState(getCurrentDateValue);
  const [taskFilter, setTaskFilter] = useState<WorkspaceTaskFilter>("all");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [teamInviteCode, setTeamInviteCode] = useState("");
  const [teamInviteLink, setTeamInviteLink] = useState<string | null>(null);
  const [teamInviteExpiresAt, setTeamInviteExpiresAt] = useState<string | null>(null);
  const [teamInviteMessage, setTeamInviteMessage] = useState<string | null>(null);
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const navigationType = useNavigationType();
  const route = useMemo(() => parseWebsiteRoute(location.pathname), [location.pathname]);

  useEffect(() => {
    if (!bootstrap.controller) {
      return;
    }

    const unsubscribe = bootstrap.controller.subscribe(setState);

    void bootstrap.controller.initialize().catch(() => {});

    return unsubscribe;
  }, [bootstrap.controller]);

  useEffect(() => {
    if (navigationType === "POP") {
      setRouteNotice(null);
    }
  }, [location.key, navigationType]);

  useEffect(() => {
    setTeamInviteCode("");
    setTeamInviteLink(null);
    setTeamInviteExpiresAt(null);
    setTeamInviteMessage(null);
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    if (route.name !== "join-team") {
      setJoinFeedback(null);
      return;
    }

    const params = new URLSearchParams(location.search);
    const invite = params.get("invite");

    setJoinInviteCode(invite ?? "");
    setJoinFeedback(null);
  }, [location.search, route.name]);

  useEffect(() => {
    if (route.name === "personal-workspace" || route.name === "team-detail") {
      setTaskFilter("all");
      setDateView("all");
      setSelectedDate(getCurrentDateValue());
    }
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  const viewModel = createTodoAppViewModel(state);
  const controller = bootstrap.controller;
  const pendingUi = viewModel.isLoading || state.pendingMutations > 0;
  const personalWorkspace =
    viewModel.workspaces.find((workspace) => workspace.kind === "personal") ?? null;
  const teamWorkspaces = viewModel.workspaces.filter(
    (workspace): workspace is WebsiteWorkspace => workspace.kind === "team",
  );
  const routedTeamWorkspace =
    route.name === "team-detail"
      ? (teamWorkspaces.find((workspace) => (workspace.teamId ?? workspace.id) === route.teamId) ??
        null)
      : null;
  const pageWorkspace =
    route.name === "personal-workspace" ? personalWorkspace : routedTeamWorkspace;
  const todayDateValue = getCurrentDateValue();
  const { taskCounts, dateViewCounts, filteredTodos, selectedDateTodos } = deriveWorkspaceTaskView({
    dateView,
    selectedDate,
    taskFilter,
    todayDateValue,
    todos: viewModel.todos,
  });

  function navigate(nextRoute: WebsiteRoute, options?: { replace?: boolean }) {
    const href = getWebsiteRouteHref(nextRoute);
    void routerNavigate(href, { replace: options?.replace });
    setRouteNotice(null);
  }

  function handleJoinInviteCodeChange(value: string) {
    setJoinInviteCode(value);

    if (joinFeedback) {
      setJoinFeedback(null);
    }
  }

  useEffect(() => {
    if (!controller) {
      return;
    }

    const effect = resolveWorkspaceRouteEffect({
      activeWorkspaceId: viewModel.activeWorkspace?.id ?? null,
      isAuthenticated: viewModel.isAuthenticated,
      isLoading: viewModel.isLoading,
      locale: bootstrap.workspaceShellLocale,
      personalWorkspaceId: personalWorkspace?.id ?? null,
      route,
      routedTeamWorkspaceId: routedTeamWorkspace?.id ?? null,
    });

    if (effect.redirectRoute) {
      navigate(effect.redirectRoute, { replace: true });
      setRouteNotice(effect.routeNotice);
      return;
    }

    if (effect.selectWorkspaceId) {
      void controller.selectWorkspace(effect.selectWorkspaceId).catch(() => {});
    }
  }, [
    controller,
    personalWorkspace,
    route,
    routedTeamWorkspace,
    viewModel.activeWorkspace?.id,
    viewModel.isAuthenticated,
    viewModel.isLoading,
  ]);

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller) {
      return;
    }

    const action =
      authMode === "sign-up"
        ? controller.signUpWithPassword.bind(controller)
        : controller.signInWithPassword.bind(controller);

    await action({ email, password })
      .then(() => {
        setPassword("");
      })
      .catch(() => {});
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller) {
      return;
    }

    await controller
      .createTodo({
        title: draftTitle,
        dueDate: draftDueDate,
      })
      .then(() => {
        setDraftTitle("");
        setDraftDueDate("");
      })
      .catch(() => {});
  }

  async function handleCreateTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller) {
      return;
    }

    await controller
      .createTeam({
        name: draftTeamName,
      })
      .then((workspace) => {
        setDraftTeamName("");
        navigate({ name: "team-detail", teamId: workspace.teamId ?? workspace.id });
      })
      .catch(() => {});
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller || !editingTodoId) {
      return;
    }

    await controller
      .updateTodo(editingTodoId, {
        title: editingTitle,
        dueDate: editingDueDate,
      })
      .then(() => {
        setEditingTodoId(null);
        setEditingTitle("");
        setEditingDueDate("");
      })
      .catch(() => {});
  }

  function beginEditing(todo: TodoAppState["todos"][number]) {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
    setEditingDueDate(todo.dueDate ?? "");
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditingTitle("");
    setEditingDueDate("");
  }

  async function copyToClipboard(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setTeamInviteMessage(successMessage);
    } catch {
      setTeamInviteMessage("Copy failed. You can still select the value and copy it manually.");
    }
  }

  async function handleCreateTeamInvite() {
    if (!controller || !routedTeamWorkspace?.teamId) {
      return;
    }

    await controller
      .createTeamInvite(routedTeamWorkspace.teamId)
      .then((invite) => {
        const joinUrl = new URL(getWebsiteRouteHref({ name: "join-team" }), window.location.origin);

        joinUrl.searchParams.set("invite", invite.token);
        setTeamInviteCode(invite.token);
        setTeamInviteLink(joinUrl.toString());
        setTeamInviteExpiresAt(invite.expiresAt);
        setTeamInviteMessage("Invite ready to share.");
      })
      .catch(() => {});
  }

  async function handleJoinTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller) {
      return;
    }

    setJoinFeedback(null);

    await controller
      .redeemTeamInvite(joinInviteCode)
      .then((workspace) => {
        const outcome = getJoinTeamSuccessOutcome(workspace, {
          locale: bootstrap.workspaceShellLocale,
        });
        setJoinInviteCode("");
        navigate(outcome.route);
        setRouteNotice(outcome.routeNotice);
      })
      .catch((error: unknown) => {
        const latestState = controller.getState();
        const message =
          latestState.lastError ??
          (error instanceof Error && error.message.length > 0
            ? error.message
            : "We couldn't accept that invite. Check the code and try again.");

        setJoinFeedback({
          kind: latestState.lastErrorKind === "notice" ? "notice" : "error",
          message,
        });
      });
  }

  if (bootstrap.envError) {
    return (
      <main className="app-frame">
        <section className="setup-panel">
          <p className="setup-panel__eyebrow">Web client setup</p>
          <h1>Connect Supabase to continue.</h1>
          <p className="setup-panel__body">{bootstrap.envError}</p>
          <p className="setup-panel__body">
            Copy <code>.env.example</code> to <code>.env.local</code>, then set
            <code> VITE_SUPABASE_URL </code>and<code> VITE_SUPABASE_ANON_KEY</code>.
          </p>
        </section>
      </main>
    );
  }

  if (!controller) {
    return null;
  }

  return (
    <main className="app-frame">
      <section className="workspace-panel workspace-panel--page">
        <header className="workspace-header workspace-header--page">
          <div className="workspace-header__title">
            <p className="workspace-header__eyebrow">Web client</p>
            <h1>
              {getWorkspaceRouteTitle(
                route,
                routedTeamWorkspace?.name,
                bootstrap.workspaceShellLocale,
              )}
            </h1>
          </div>

          {viewModel.isAuthenticated ? (
            <div className="workspace-header__session">
              {state.session?.email ? (
                <span className="account-badge" title={state.session.email}>
                  {state.session.email}
                </span>
              ) : null}
              <div className="workspace-header__actions">
                <button
                  disabled={pendingUi}
                  onClick={() => void controller.refresh().catch(() => {})}
                  type="button"
                >
                  Refresh
                </button>
                <button
                  disabled={pendingUi}
                  onClick={() => void controller.signOut().catch(() => {})}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <div className="page-stack">
          {viewModel.isAuthenticated ? (
            <TopLevelNavigation
              currentRoute={route}
              locale={bootstrap.workspaceShellLocale}
              onNavigate={navigate}
              personalWorkspace={personalWorkspace}
              teams={teamWorkspaces}
            />
          ) : null}

          {viewModel.loadingMessage ? (
            <p className="info-banner">{viewModel.loadingMessage}</p>
          ) : null}
          {viewModel.pendingMessage ? (
            <p className="info-banner info-banner--pending">{viewModel.pendingMessage}</p>
          ) : null}
          {routeNotice ? <p className="info-banner">{routeNotice}</p> : null}

          {viewModel.errorMessage &&
          !(route.name === "join-team" && state.lastMutation === "redeem-team-invite") ? (
            <div
              className={`feedback-banner ${
                viewModel.errorKind === "validation"
                  ? "is-validation"
                  : viewModel.errorKind === "notice"
                    ? "is-notice"
                    : "is-error"
              }`}
            >
              <p>{viewModel.errorMessage}</p>
              <button onClick={() => controller.clearError()} type="button">
                Dismiss
              </button>
            </div>
          ) : null}

          {viewModel.screen === "auth" ||
          (viewModel.screen === "loading" && !viewModel.isAuthenticated) ? (
            <AuthPage
              authMode={authMode}
              email={email}
              fieldErrors={viewModel.signInFieldErrors}
              isLoading={viewModel.isLoading}
              onAuthModeChange={setAuthMode}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={(event) => void handleSignInSubmit(event)}
              password={password}
            />
          ) : null}

          {viewModel.isAuthenticated ? (
            <WebsiteSignedInRoutes
              canManageTodos={viewModel.canManageTodos}
              dateView={dateView}
              dateViewCounts={dateViewCounts}
              draftDueDate={draftDueDate}
              draftTeamName={draftTeamName}
              draftTitle={draftTitle}
              editingDueDate={editingDueDate}
              editingTitle={editingTitle}
              editingTodoId={editingTodoId}
              emptyStateCopy={getEmptyStateCopy(pageWorkspace)}
              filteredTodos={filteredTodos}
              hasAnyTodos={viewModel.todos.length > 0}
              joinFeedback={joinFeedback}
              joinInviteCode={joinInviteCode}
              locale={bootstrap.workspaceShellLocale}
              onCancelEditing={cancelEditing}
              onCreateSubmit={(event) => void handleCreateSubmit(event)}
              onCreateTeamInvite={() => void handleCreateTeamInvite()}
              onCreateTeamSubmit={(event) => void handleCreateTeamSubmit(event)}
              onDateViewChange={setDateView}
              onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
              onDismissJoinFeedback={() => setJoinFeedback(null)}
              onDraftDueDateChange={setDraftDueDate}
              onDraftTeamNameChange={setDraftTeamName}
              onDraftTitleChange={setDraftTitle}
              onEditDueDateChange={setEditingDueDate}
              onEditTitleChange={setEditingTitle}
              onInviteCodeChange={handleJoinInviteCodeChange}
              onJoinTeamSubmit={(event) => void handleJoinTeamSubmit(event)}
              onNavigate={navigate}
              onCopyTeamInviteCode={() =>
                void (teamInviteCode
                  ? copyToClipboard(teamInviteCode, "Invite code copied.")
                  : Promise.resolve())
              }
              onCopyTeamInviteLink={() =>
                void (teamInviteLink
                  ? copyToClipboard(teamInviteLink, "Invite link copied.")
                  : Promise.resolve())
              }
              onSaveEdit={(event) => void handleSaveEdit(event)}
              onSelectedDateChange={setSelectedDate}
              onStartEdit={beginEditing}
              onTaskFilterChange={setTaskFilter}
              onToggleComplete={(todo) =>
                void (
                  todo.completed
                    ? controller.uncompleteTodo(todo.id)
                    : controller.completeTodo(todo.id)
                ).catch(() => {})
              }
              personalWorkspace={personalWorkspace}
              route={route}
              routedTeamWorkspace={routedTeamWorkspace}
              selectedDate={selectedDate}
              selectedDateLabel={formatSelectedDateLabel(selectedDate)}
              selectedDateTodos={selectedDateTodos}
              source={
                joinInviteCode.length > 0 && new URLSearchParams(location.search).has("invite")
                  ? "link"
                  : "manual"
              }
              taskCounts={taskCounts}
              taskFilter={taskFilter}
              teamInviteCode={teamInviteCode}
              teamInviteExpiresAt={teamInviteExpiresAt}
              teamInviteLink={teamInviteLink}
              teamInviteMessage={teamInviteMessage}
              teamWorkspaces={teamWorkspaces}
              todoTitleError={viewModel.todoTitleError}
              isSubmitting={pendingUi}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
