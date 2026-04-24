import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate as useRouterNavigate, useNavigationType } from "react-router-dom";
import {
  createTodoAppController,
  createTodoAppViewModel,
  type TodoAppController,
  type TodoAppState,
} from "todo-app";
import {
  createBrowserSessionStorageAdapter,
  createSupabaseAuthRepository,
  createSupabaseTodoRepository,
  createTodoSupabaseClient,
} from "todo-data";
import {
  WorkspaceShellSignedInCreateTeamPage,
  WorkspaceShellSignedInDashboardPage,
  WorkspaceShellSignedInJoinTeamPage,
  WorkspaceShellSignedInTeamListPage,
  WorkspaceShellSignedInWorkspacePage,
  getWorkspaceShellResource,
  workspaceShellPageIds,
} from "workspace-shell";

import { getDesktopSupabaseEnv } from "../config/env.ts";
import {
  extractInviteCode,
  type DesktopJoinFeedback,
  getCreateInviteSuccessOutcome,
  getJoinInviteFailureFeedback,
  getJoinInviteSuccessOutcome,
} from "../lib/invite-flow.ts";
import { resolveDesktopRouteEffect } from "../lib/route-effects.ts";
import {
  deriveDesktopTaskView,
  type DesktopDateView,
  type DesktopTaskFilter,
} from "../lib/task-view.ts";
import { DesktopTopLevelNavigation } from "../components/top-level-navigation.tsx";
import { DesktopActionLink } from "../pages/action-link.tsx";
import { DesktopSignedInRoutes } from "../routing/desktop-signed-in-routes.tsx";
import {
  getDesktopRouteHref,
  getDesktopRouteTitle,
  getDesktopTeamSection,
  getDesktopWorkspaceSection,
  parseDesktopRoute,
  type DesktopRoute,
} from "../routing/routes.ts";

type DesktopTodoItem = TodoAppState["todos"][number];
type DesktopWorkspace = NonNullable<ReturnType<typeof createTodoAppViewModel>["activeWorkspace"]>;

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

interface DesktopBootstrap {
  controller: TodoAppController | null;
  envError: string | null;
  workspaceShellLocale: string;
}

type JoinFeedback = DesktopJoinFeedback;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong.";
}

function createDesktopBootstrap(): DesktopBootstrap {
  try {
    const env = getDesktopSupabaseEnv();
    const storage = createBrowserSessionStorageAdapter(window.localStorage);
    const client = createTodoSupabaseClient({
      env,
      runtime: "desktop",
      detectSessionInUrl: false,
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

function formatSelectedDateLabel(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getComposerPlaceholder(
  workspace: DesktopWorkspace | null,
  locale?: string | null,
): string {
  const resource = getWorkspaceShellResource(locale);

  if (!workspace) {
    return resource.pages.workspace.composerNoWorkspace;
  }

  return workspace.kind === "team"
    ? resource.pages.workspace.composerTeam
    : resource.pages.workspace.composerPersonal;
}

function getCurrentDateValue(): string {
  return new Date().toLocaleDateString("en-CA");
}

function getEmptyStateCopy(workspace: DesktopWorkspace | null, locale?: string | null) {
  const resource = getWorkspaceShellResource(locale);

  if (!workspace) {
    return {
      title: resource.pages.workspace.emptyNoWorkspaceTitle,
      body: resource.pages.workspace.emptyNoWorkspaceBody,
    };
  }

  if (workspace.kind === "team") {
    return {
      title: resource.pages.workspace.emptyTeamTitle.replace("{{workspaceName}}", workspace.name),
      body: resource.pages.workspace.emptyTeamBody,
    };
  }

  return {
    title: resource.pages.workspace.emptyPersonalTitle,
    body: resource.pages.workspace.emptyPersonalBody,
  };
}

export function DesktopAppShell() {
  const [bootstrap] = useState(createDesktopBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDueDate, setDraftDueDate] = useState("");
  const [draftTeamName, setDraftTeamName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [taskFilter, setTaskFilter] = useState<DesktopTaskFilter>("all");
  const [dateView, setDateView] = useState<DesktopDateView>("all");
  const [selectedDate, setSelectedDate] = useState(getCurrentDateValue);
  const [teamInviteCode, setTeamInviteCode] = useState("");
  const [teamInviteExpiresAt, setTeamInviteExpiresAt] = useState("");
  const [teamInviteMessage, setTeamInviteMessage] = useState<string | null>(null);
  const [joinInviteInput, setJoinInviteInput] = useState("");
  const [joinFeedback, setJoinFeedback] = useState<JoinFeedback | null>(null);
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const navigationType = useNavigationType();
  const route = parseDesktopRoute(location.pathname);

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

  const viewModel = createTodoAppViewModel(state);
  const controller = bootstrap.controller;
  const shellResource = getWorkspaceShellResource(bootstrap.workspaceShellLocale);
  const pendingUi = viewModel.isLoading || state.pendingMutations > 0;
  const activeWorkspace = viewModel.activeWorkspace;
  const personalWorkspace =
    viewModel.workspaces.find((workspace) => workspace.kind === "personal") ?? null;
  const teamWorkspaces = viewModel.workspaces.filter(
    (workspace): workspace is DesktopWorkspace => workspace.kind === "team",
  );
  const routedTeamWorkspace =
    route.name === "team-detail"
      ? (teamWorkspaces.find((workspace) => (workspace.teamId ?? workspace.id) === route.teamId) ??
        null)
      : null;
  const pageWorkspace =
    route.name === "personal-workspace"
      ? personalWorkspace
      : route.name === "team-detail"
        ? routedTeamWorkspace
        : activeWorkspace;
  const emptyStateCopy = getEmptyStateCopy(pageWorkspace, bootstrap.workspaceShellLocale);
  const todayDateValue = getCurrentDateValue();
  const { filteredTodos, taskCounts, dateViewCounts, selectedDateTodos } = deriveDesktopTaskView(
    viewModel.todos,
    taskFilter,
    dateView,
    todayDateValue,
    selectedDate,
  );
  const personalWorkspaceSection = getDesktopWorkspaceSection(route);
  const teamDetailSection = getDesktopTeamSection(route);

  useEffect(() => {
    setTeamInviteCode("");
    setTeamInviteExpiresAt("");
    setTeamInviteMessage(null);
  }, [route.name, route.name === "team-detail" ? route.teamId : activeWorkspace?.id]);

  useEffect(() => {
    setJoinFeedback(null);
  }, [route.name, route.name === "team-detail" ? route.teamId : activeWorkspace?.id]);

  useEffect(() => {
    if (route.name === "personal-workspace" || route.name === "team-detail") {
      setTaskFilter("all");
    }
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    if (route.name === "personal-workspace" || route.name === "team-detail") {
      setDateView("all");
    }
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    if (route.name === "personal-workspace" || route.name === "team-detail") {
      setSelectedDate(getCurrentDateValue());
    }
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    if (!controller) {
      return;
    }

    const effect = resolveDesktopRouteEffect({
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
    personalWorkspace?.id,
    route,
    routedTeamWorkspace?.id,
    viewModel.activeWorkspace?.id,
    viewModel.isAuthenticated,
    viewModel.isLoading,
  ]);

  function navigate(nextRoute: DesktopRoute, options?: { replace?: boolean }) {
    void routerNavigate(getDesktopRouteHref(nextRoute), { replace: options?.replace });
    setRouteNotice(null);
  }

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!controller) {
      return;
    }

    const action =
      authMode === "sign-up"
        ? controller.signUpWithPassword.bind(controller)
        : controller.signInWithPassword.bind(controller);

    await action({
      email,
      password,
    })
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
        navigate({
          name: "team-detail",
          teamId: workspace.teamId ?? workspace.id,
          section: "tasks",
        });
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

  function beginEditing(todo: DesktopTodoItem) {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
    setEditingDueDate(todo.dueDate ?? "");
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditingTitle("");
    setEditingDueDate("");
  }

  async function handleCreateTeamInvite() {
    if (!controller || !routedTeamWorkspace?.teamId) {
      return;
    }

    setTeamInviteMessage(null);

    await controller
      .createTeamInvite(routedTeamWorkspace.teamId)
      .then((invite) => {
        const outcome = getCreateInviteSuccessOutcome(invite, bootstrap.workspaceShellLocale);

        setTeamInviteCode(outcome.code);
        setTeamInviteExpiresAt(outcome.expiresAt);
        setTeamInviteMessage(outcome.message);
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
      .redeemTeamInvite(extractInviteCode(joinInviteInput))
      .then(async (workspace) => {
        const outcome = getJoinInviteSuccessOutcome({
          activeWorkspaceId: controller.getState().activeWorkspaceId,
          locale: bootstrap.workspaceShellLocale,
          workspace,
        });

        if (outcome.selectWorkspaceId) {
          await controller.selectWorkspace(outcome.selectWorkspaceId).catch(() => {});
        }

        setJoinInviteInput("");
        setJoinFeedback(null);
        navigate(outcome.route);
        setRouteNotice(outcome.routeNotice);
      })
      .catch((error: unknown) => {
        const latestState = controller.getState();
        setJoinFeedback(
          getJoinInviteFailureFeedback({
            error,
            lastError: latestState.lastError,
            lastErrorKind: latestState.lastErrorKind,
            locale: bootstrap.workspaceShellLocale,
          }),
        );
      });
  }

  if (bootstrap.envError) {
    return (
      <main className="app-shell">
        <section className="setup-panel">
          <p className="setup-panel__eyebrow">Desktop client setup</p>
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

  const showHeroPanel =
    viewModel.screen === "auth" || (viewModel.screen === "loading" && !viewModel.isAuthenticated);

  return (
    <main className={`app-shell ${viewModel.isAuthenticated ? "app-shell--signed-in" : ""}`}>
      {showHeroPanel ? (
        <section className="hero-panel">
          <p className="hero-panel__eyebrow">Cross-platform todos</p>
          <h1>Shared workspace flows inside the Electron desktop shell.</h1>
          <p className="hero-panel__body">
            This renderer is wired to the shared auth, sync, optimistic update, and workspace state
            flow from the monorepo packages.
          </p>

          <div className="hero-panel__highlights" role="list">
            <div role="listitem">
              <strong>Desktop parity</strong>
              <span>
                Sign-in, workspace switching, create team, and todo CRUD behave like the web and
                mobile clients.
              </span>
            </div>
            <div role="listitem">
              <strong>Supabase-backed</strong>
              <span>
                Auth, persisted todos, and workspace membership all reuse the same shared adapters.
              </span>
            </div>
            <div role="listitem">
              <strong>Minimal shell</strong>
              <span>
                Electron hosts the renderer while `todo-app` and `todo-data` continue to own core
                product behavior.
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section
        className={`workspace-panel ${viewModel.isAuthenticated ? "workspace-panel--page" : ""}`}
      >
        <header
          className={`workspace-header ${viewModel.isAuthenticated ? "workspace-header--page" : ""}`}
        >
          <div className="workspace-header__title">
            <p className="workspace-header__eyebrow">Desktop client</p>
            <h1>
              {viewModel.isAuthenticated
                ? getDesktopRouteTitle(
                    route,
                    routedTeamWorkspace?.name,
                    bootstrap.workspaceShellLocale,
                  )
                : "Todo workspace"}
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

        {viewModel.loadingMessage ? (
          <p className="info-banner">{viewModel.loadingMessage}</p>
        ) : null}
        {viewModel.pendingMessage ? (
          <p className="info-banner info-banner--pending">{viewModel.pendingMessage}</p>
        ) : null}

        {viewModel.errorMessage ? (
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
          <section className="auth-panel">
            <div>
              <p className="auth-panel__eyebrow">Sign in</p>
              <h3>
                {authMode === "sign-up"
                  ? "Create a desktop account for synced todos."
                  : "Authenticate before accessing your workspaces."}
              </h3>
              <p className="auth-panel__body">
                {authMode === "sign-up"
                  ? "Create a Supabase-backed account with email and password. If email confirmation is enabled, confirm first and then sign in."
                  : "Use a Supabase account configured for this project. Session restore will keep you signed in when the desktop shell restarts."}
              </p>
            </div>

            <div className="auth-mode-toggle">
              <button
                className={authMode === "sign-in" ? "is-active" : ""}
                onClick={() => setAuthMode("sign-in")}
                type="button"
              >
                Sign in
              </button>
              <button
                className={authMode === "sign-up" ? "is-active" : ""}
                onClick={() => setAuthMode("sign-up")}
                type="button"
              >
                Create account
              </button>
            </div>

            <form className="auth-form" onSubmit={(event) => void handleSignInSubmit(event)}>
              <label>
                <span>Email</span>
                <input
                  autoComplete="email"
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  placeholder="user@example.com"
                  type="email"
                  value={email}
                />
                {viewModel.signInFieldErrors.email ? (
                  <small className="field-error">{viewModel.signInFieldErrors.email}</small>
                ) : null}
              </label>

              <label>
                <span>Password</span>
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                />
                {viewModel.signInFieldErrors.password ? (
                  <small className="field-error">{viewModel.signInFieldErrors.password}</small>
                ) : null}
              </label>

              <button disabled={viewModel.isLoading} type="submit">
                {viewModel.isLoading
                  ? authMode === "sign-up"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "sign-up"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>
          </section>
        ) : null}

        {viewModel.isAuthenticated ? (
          <div className="page-stack">
            <DesktopTopLevelNavigation
              currentRoute={route}
              locale={bootstrap.workspaceShellLocale}
              onNavigate={navigate}
              personalWorkspace={personalWorkspace}
              teams={teamWorkspaces.map((workspace) => ({
                id: workspace.id,
                name: workspace.name,
                route: {
                  name: "team-detail",
                  teamId: workspace.teamId ?? workspace.id,
                  section: "tasks",
                },
              }))}
            />

            {routeNotice ? <p className="info-banner">{routeNotice}</p> : null}

            <DesktopSignedInRoutes
              pages={{
                [workspaceShellPageIds.createTeam]: (
                  <WorkspaceShellSignedInCreateTeamPage
                    canManageTodos={viewModel.canManageTodos}
                    draftTeamName={draftTeamName}
                    locale={bootstrap.workspaceShellLocale}
                    onDraftTeamNameChange={setDraftTeamName}
                    onSubmit={(event) => void handleCreateTeamSubmit(event)}
                    renderNavigationAction={({ className, label, route }) => (
                      <DesktopActionLink
                        className={className}
                        onNavigate={navigate}
                        route={route as DesktopRoute}
                      >
                        {label}
                      </DesktopActionLink>
                    )}
                  />
                ),
                [workspaceShellPageIds.dashboard]: (
                  <WorkspaceShellSignedInDashboardPage
                    locale={bootstrap.workspaceShellLocale}
                    personalWorkspaceName={personalWorkspace?.name ?? null}
                    renderRouteAction={({ children, className, key, route }) => (
                      <button
                        className={className}
                        key={key}
                        onClick={() => navigate(route as DesktopRoute)}
                        type="button"
                      >
                        {children}
                      </button>
                    )}
                    routes={{
                      createTeam: { name: "create-team" } satisfies DesktopRoute,
                      joinTeam: { name: "join-team" } satisfies DesktopRoute,
                      personalWorkspace: {
                        name: "personal-workspace",
                        section: "tasks",
                      } satisfies DesktopRoute,
                      teamList: { name: "team-list" } satisfies DesktopRoute,
                    }}
                    teamCount={teamWorkspaces.length}
                  />
                ),
                [workspaceShellPageIds.joinTeam]: (
                  <WorkspaceShellSignedInJoinTeamPage
                    feedback={joinFeedback}
                    inputValue={joinInviteInput}
                    isSubmitting={pendingUi}
                    locale={bootstrap.workspaceShellLocale}
                    onDismissFeedback={() => setJoinFeedback(null)}
                    onInputChange={setJoinInviteInput}
                    onSubmit={(event) => void handleJoinTeamSubmit(event)}
                    renderNavigationAction={({ className, label, route }) => (
                      <DesktopActionLink
                        className={className}
                        onNavigate={navigate}
                        route={route as DesktopRoute}
                      >
                        {label}
                      </DesktopActionLink>
                    )}
                  />
                ),
                [workspaceShellPageIds.personalWorkspace]: (
                  <WorkspaceShellSignedInWorkspacePage
                    canManageTodos={viewModel.canManageTodos}
                    composerPlaceholder={getComposerPlaceholder(
                      pageWorkspace,
                      bootstrap.workspaceShellLocale,
                    )}
                    dateView={dateView}
                    dateViewCounts={dateViewCounts}
                    draftDueDate={draftDueDate}
                    draftTitle={draftTitle}
                    editingDueDate={editingDueDate}
                    editingTitle={editingTitle}
                    editingTodoId={editingTodoId}
                    emptyStateCopy={emptyStateCopy}
                    hasAnyTodos={viewModel.todos.length > 0}
                    layout="sectioned"
                    locale={bootstrap.workspaceShellLocale}
                    onCancelEditing={cancelEditing}
                    onCreateSubmit={(event) => void handleCreateSubmit(event)}
                    onDateViewChange={setDateView}
                    onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
                    onDraftDueDateChange={setDraftDueDate}
                    onDraftTitleChange={setDraftTitle}
                    onEditDueDateChange={setEditingDueDate}
                    onEditTitleChange={setEditingTitle}
                    onSaveEdit={(event) => void handleSaveEdit(event)}
                    onSectionNavigate={navigate}
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
                    renderNavigationAction={({ className, label, route }) => (
                      <DesktopActionLink
                        className={className}
                        onNavigate={navigate}
                        route={route as DesktopRoute}
                      >
                        {label}
                      </DesktopActionLink>
                    )}
                    renderSelectedDateAction={(todo) => (
                      <button onClick={() => beginEditing(todo)} type="button">
                        {shellResource.actions.edit}
                      </button>
                    )}
                    routeTitle={getDesktopRouteTitle(
                      route,
                      routedTeamWorkspace?.name,
                      bootstrap.workspaceShellLocale,
                    )}
                    sectionRoutes={[
                      {
                        isActive: personalWorkspaceSection === "tasks",
                        label: shellResource.pages.workspace.sectionLabels.tasks,
                        route: { name: "personal-workspace", section: "tasks" },
                      },
                      {
                        isActive: personalWorkspaceSection === "date",
                        label: shellResource.pages.workspace.sectionLabels.date,
                        route: { name: "personal-workspace", section: "date" },
                      },
                    ]}
                    section={personalWorkspaceSection}
                    selectedDate={selectedDate}
                    selectedDateLabel={formatSelectedDateLabel(selectedDate)}
                    selectedDateTodos={selectedDateTodos}
                    taskCounts={taskCounts}
                    taskFilter={taskFilter}
                    todoTitleError={viewModel.todoTitleError}
                    todos={filteredTodos}
                    workspace={pageWorkspace}
                  />
                ),
                [workspaceShellPageIds.teamDetail]: (
                  <WorkspaceShellSignedInWorkspacePage
                    canManageTodos={viewModel.canManageTodos}
                    composerPlaceholder={getComposerPlaceholder(
                      pageWorkspace,
                      bootstrap.workspaceShellLocale,
                    )}
                    dateView={dateView}
                    dateViewCounts={dateViewCounts}
                    draftDueDate={draftDueDate}
                    draftTitle={draftTitle}
                    editingDueDate={editingDueDate}
                    editingTitle={editingTitle}
                    editingTodoId={editingTodoId}
                    emptyStateCopy={emptyStateCopy}
                    hasAnyTodos={viewModel.todos.length > 0}
                    layout="sectioned"
                    locale={bootstrap.workspaceShellLocale}
                    onCancelEditing={cancelEditing}
                    onCreateSubmit={(event) => void handleCreateSubmit(event)}
                    onDateViewChange={setDateView}
                    onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
                    onDraftDueDateChange={setDraftDueDate}
                    onDraftTitleChange={setDraftTitle}
                    onEditDueDateChange={setEditingDueDate}
                    onEditTitleChange={setEditingTitle}
                    onSaveEdit={(event) => void handleSaveEdit(event)}
                    onSectionNavigate={navigate}
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
                    renderNavigationAction={({ className, label, route }) => (
                      <DesktopActionLink
                        className={className}
                        onNavigate={navigate}
                        route={route as DesktopRoute}
                      >
                        {label}
                      </DesktopActionLink>
                    )}
                    renderSelectedDateAction={(todo) => (
                      <button onClick={() => beginEditing(todo)} type="button">
                        {shellResource.actions.edit}
                      </button>
                    )}
                    routeTitle={getDesktopRouteTitle(
                      route,
                      routedTeamWorkspace?.name,
                      bootstrap.workspaceShellLocale,
                    )}
                    sectionRoutes={
                      route.name === "team-detail" && pageWorkspace?.kind === "team"
                        ? [
                            {
                              isActive: teamDetailSection === "tasks",
                              label: shellResource.pages.workspace.sectionLabels.tasks,
                              route: {
                                name: "team-detail",
                                teamId: route.teamId,
                                section: "tasks",
                              },
                            },
                            {
                              isActive: teamDetailSection === "date",
                              label: shellResource.pages.workspace.sectionLabels.date,
                              route: {
                                name: "team-detail",
                                teamId: route.teamId,
                                section: "date",
                              },
                            },
                            {
                              isActive: teamDetailSection === "invite",
                              label: shellResource.pages.workspace.sectionLabels.invite,
                              route: {
                                name: "team-detail",
                                teamId: route.teamId,
                                section: "invite",
                              },
                            },
                          ]
                        : []
                    }
                    section={teamDetailSection}
                    selectedDate={selectedDate}
                    selectedDateLabel={formatSelectedDateLabel(selectedDate)}
                    selectedDateTodos={selectedDateTodos}
                    taskCounts={taskCounts}
                    taskFilter={taskFilter}
                    teamInvite={
                      pageWorkspace?.kind === "team"
                        ? {
                            code: teamInviteCode,
                            expiresAt: teamInviteExpiresAt || null,
                            link: null,
                            message: teamInviteMessage,
                            onCreateInvite: () => void handleCreateTeamInvite(),
                          }
                        : null
                    }
                    todoTitleError={viewModel.todoTitleError}
                    todos={filteredTodos}
                    workspace={pageWorkspace}
                  />
                ),
                [workspaceShellPageIds.teamList]: (
                  <WorkspaceShellSignedInTeamListPage
                    locale={bootstrap.workspaceShellLocale}
                    renderNavigationAction={({ className, label, route }) => (
                      <DesktopActionLink
                        className={className}
                        onNavigate={navigate}
                        route={route as DesktopRoute}
                      >
                        {label}
                      </DesktopActionLink>
                    )}
                    renderRouteAction={({ children, className, key, route }) => (
                      <button
                        className={className}
                        key={key}
                        onClick={() => navigate(route as DesktopRoute)}
                        type="button"
                      >
                        {children}
                      </button>
                    )}
                    teams={teamWorkspaces.map((workspace) => ({
                      id: workspace.id,
                      name: workspace.name,
                      route: {
                        name: "team-detail",
                        teamId: workspace.teamId ?? workspace.id,
                        section: "tasks",
                      },
                    }))}
                  />
                ),
              }}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
