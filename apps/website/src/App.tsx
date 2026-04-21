import { useEffect, useState, type FormEvent } from "react";
import { createTodoAppController, createTodoAppViewModel, type TodoAppState } from "todo-app";
import {
  createBrowserSessionStorageAdapter,
  createSupabaseAuthRepository,
  createSupabaseTodoRepository,
  createTodoSupabaseClient,
} from "todo-data";

import { getWebsiteSupabaseEnv } from "./env.ts";
import {
  AuthPage,
  CreateTeamPage,
  DashboardPage,
  JoinTeamPage,
  TeamListPage,
  TopLevelNavigation,
  WorkspacePage,
  type WebsiteWorkspace,
} from "./pages.tsx";
import { getWebsiteRouteHref, parseWebsiteRoute, type WebsiteRoute } from "./routes.ts";

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
      sessionStorage: storage,
    });

    return {
      controller: createTodoAppController({
        authRepository: createSupabaseAuthRepository(client),
        todoRepository: createSupabaseTodoRepository(client),
      }),
      envError: null,
    };
  } catch (error) {
    return {
      controller: null,
      envError: toErrorMessage(error),
    };
  }
}

function getPageTitle(route: WebsiteRoute, teamName?: string): string {
  switch (route.name) {
    case "dashboard":
      return "Dashboard";
    case "personal-workspace":
      return "My workspace";
    case "team-list":
      return "Teams";
    case "team-detail":
      return teamName ? teamName : "Team detail";
    case "join-team":
      return "Join team";
    case "create-team":
      return "Create team";
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

export function App() {
  const [joinFeedback, setJoinFeedback] = useState<{
    kind: "error" | "notice";
    message: string;
  } | null>(null);
  const [bootstrap] = useState(createWebsiteBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
  const [route, setRoute] = useState<WebsiteRoute>(() =>
    parseWebsiteRoute(window.location.pathname),
  );
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [draftTeamName, setDraftTeamName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [teamInviteCode, setTeamInviteCode] = useState("");
  const [teamInviteLink, setTeamInviteLink] = useState<string | null>(null);
  const [teamInviteExpiresAt, setTeamInviteExpiresAt] = useState<string | null>(null);
  const [teamInviteMessage, setTeamInviteMessage] = useState<string | null>(null);
  const [joinInviteCode, setJoinInviteCode] = useState("");

  useEffect(() => {
    if (!bootstrap.controller) {
      return;
    }

    const unsubscribe = bootstrap.controller.subscribe(setState);

    void bootstrap.controller.initialize().catch(() => {});

    return unsubscribe;
  }, [bootstrap.controller]);

  useEffect(() => {
    function handlePopState() {
      setRoute(parseWebsiteRoute(window.location.pathname));
      setRouteNotice(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");

    setJoinInviteCode(invite ?? "");
    setJoinFeedback(null);
  }, [route.name]);

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
      ? (teamWorkspaces.find((workspace) => workspace.teamId === route.teamId) ?? null)
      : null;

  function navigate(nextRoute: WebsiteRoute, options?: { replace?: boolean }) {
    const href = getWebsiteRouteHref(nextRoute);

    if (href !== window.location.pathname) {
      if (options?.replace) {
        window.history.replaceState(null, "", href);
      } else {
        window.history.pushState(null, "", href);
      }
    }

    setRoute(nextRoute);
    setRouteNotice(null);
  }

  function handleJoinInviteCodeChange(value: string) {
    setJoinInviteCode(value);

    if (joinFeedback) {
      setJoinFeedback(null);
    }
  }

  useEffect(() => {
    if (!controller || !viewModel.isAuthenticated) {
      return;
    }

    if (route.name === "personal-workspace") {
      if (personalWorkspace && viewModel.activeWorkspace?.id !== personalWorkspace.id) {
        void controller.selectWorkspace(personalWorkspace.id).catch(() => {});
      }

      return;
    }

    if (route.name !== "team-detail") {
      return;
    }

    if (!routedTeamWorkspace) {
      if (!viewModel.isLoading) {
        navigate({ name: "team-list" }, { replace: true });
        setRouteNotice("That team is not available in your current memberships.");
      }

      return;
    }

    if (viewModel.activeWorkspace?.id !== routedTeamWorkspace.id) {
      void controller.selectWorkspace(routedTeamWorkspace.id).catch(() => {});
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
        setJoinInviteCode("");
        navigate({ name: "team-detail", teamId: workspace.teamId ?? workspace.id });
        setRouteNotice(
          `You can now work in ${workspace.name}. My workspace stays available from the top navigation.`,
        );
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

  function renderSignedInPage() {
    if (!controller) {
      return null;
    }

    if (viewModel.screen === "error") {
      return (
        <section className="empty-state empty-state--error">
          <p className="empty-state__eyebrow">Sync needs attention</p>
          <h3>We could not load the latest todos.</h3>
          <p>Try refreshing after checking your network or Supabase configuration.</p>
        </section>
      );
    }

    switch (route.name) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigate={navigate}
            personalWorkspace={personalWorkspace}
            teamCount={teamWorkspaces.length}
          />
        );
      case "personal-workspace":
        return (
          <WorkspacePage
            canManageTodos={viewModel.canManageTodos}
            draftTitle={draftTitle}
            draftDueDate={draftDueDate}
            editingTodoId={editingTodoId}
            editingTitle={editingTitle}
            editingDueDate={editingDueDate}
            emptyStateCopy={getEmptyStateCopy(personalWorkspace)}
            onCancelEditing={cancelEditing}
            onCreateSubmit={(event) => void handleCreateSubmit(event)}
            onCreateTeamInvite={() => {}}
            onCopyTeamInviteCode={() => {}}
            onCopyTeamInviteLink={() => {}}
            onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
            onDraftTitleChange={setDraftTitle}
            onDraftDueDateChange={setDraftDueDate}
            onEditTitleChange={setEditingTitle}
            onEditDueDateChange={setEditingDueDate}
            onNavigate={navigate}
            onSaveEdit={(event) => void handleSaveEdit(event)}
            onStartEdit={beginEditing}
            onToggleComplete={(todo) =>
              void (
                todo.completed
                  ? controller.uncompleteTodo(todo.id)
                  : controller.completeTodo(todo.id)
              ).catch(() => {})
            }
            teamInviteCode=""
            teamInviteExpiresAt={null}
            teamInviteLink={null}
            teamInviteMessage={null}
            todoTitleError={viewModel.todoTitleError}
            todos={viewModel.todos}
            workspace={personalWorkspace}
          />
        );
      case "team-list":
        return <TeamListPage onNavigate={navigate} teams={teamWorkspaces} />;
      case "team-detail":
        return (
          <WorkspacePage
            canManageTodos={viewModel.canManageTodos}
            draftTitle={draftTitle}
            draftDueDate={draftDueDate}
            editingTodoId={editingTodoId}
            editingTitle={editingTitle}
            editingDueDate={editingDueDate}
            emptyStateCopy={getEmptyStateCopy(routedTeamWorkspace)}
            onCancelEditing={cancelEditing}
            onCreateSubmit={(event) => void handleCreateSubmit(event)}
            onCreateTeamInvite={() => void handleCreateTeamInvite()}
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
            onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
            onDraftTitleChange={setDraftTitle}
            onDraftDueDateChange={setDraftDueDate}
            onEditTitleChange={setEditingTitle}
            onEditDueDateChange={setEditingDueDate}
            onNavigate={navigate}
            onSaveEdit={(event) => void handleSaveEdit(event)}
            onStartEdit={beginEditing}
            onToggleComplete={(todo) =>
              void (
                todo.completed
                  ? controller.uncompleteTodo(todo.id)
                  : controller.completeTodo(todo.id)
              ).catch(() => {})
            }
            teamInviteCode={teamInviteCode}
            teamInviteExpiresAt={teamInviteExpiresAt}
            teamInviteLink={teamInviteLink}
            teamInviteMessage={teamInviteMessage}
            todoTitleError={viewModel.todoTitleError}
            todos={viewModel.todos}
            workspace={routedTeamWorkspace}
          />
        );
      case "join-team":
        return (
          <JoinTeamPage
            feedback={joinFeedback}
            inviteCode={joinInviteCode}
            isSubmitting={pendingUi}
            onDismissFeedback={() => setJoinFeedback(null)}
            onInviteCodeChange={handleJoinInviteCodeChange}
            onNavigate={navigate}
            onSubmit={(event) => void handleJoinTeamSubmit(event)}
            source={
              joinInviteCode.length > 0 && new URLSearchParams(window.location.search).has("invite")
                ? "link"
                : "manual"
            }
          />
        );
      case "create-team":
        return (
          <CreateTeamPage
            canManageTodos={viewModel.canManageTodos}
            draftTeamName={draftTeamName}
            onDraftTeamNameChange={setDraftTeamName}
            onNavigate={navigate}
            onSubmit={(event) => void handleCreateTeamSubmit(event)}
          />
        );
    }
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
            <h1>{getPageTitle(route, routedTeamWorkspace?.name)}</h1>
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

          {viewModel.isAuthenticated ? renderSignedInPage() : null}
        </div>
      </section>
    </main>
  );
}
