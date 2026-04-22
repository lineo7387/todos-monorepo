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

import { getDesktopSupabaseEnv } from "../config/env.ts";
import {
  extractInviteCode,
  type DesktopJoinFeedback,
  getCreateInviteSuccessOutcome,
  getJoinInviteFailureFeedback,
  getJoinInviteSuccessOutcome,
} from "../lib/invite-flow.ts";
import { deriveDesktopDashboard } from "../lib/desktop-dashboard.ts";
import { resolveDesktopRouteEffect } from "../lib/route-effects.ts";
import {
  deriveDesktopTaskView,
  type DesktopDateView,
  type DesktopTaskFilter,
} from "../lib/task-view.ts";
import { DesktopTopLevelNavigation } from "../components/top-level-navigation.tsx";
import { DesktopCreateTeamPage } from "../pages/create-team-page.tsx";
import { DesktopDashboardPage } from "../pages/dashboard-page.tsx";
import { DesktopJoinTeamPage } from "../pages/join-team-page.tsx";
import { DesktopTeamListPage } from "../pages/team-list-page.tsx";
import { DesktopWorkspacePage } from "../pages/workspace-page.tsx";
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
    };
  } catch (error) {
    return {
      controller: null,
      envError: toErrorMessage(error),
    };
  }
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatSelectedDateLabel(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatInviteExpiry(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getWorkspaceDescription(workspace: DesktopWorkspace): string {
  return workspace.kind === "team"
    ? "Shared tasks stay in sync for every member of this team workspace."
    : "These tasks belong to your personal workspace and follow your account across desktop, web, and mobile.";
}

function getComposerPlaceholder(workspace: DesktopWorkspace | null): string {
  if (!workspace) {
    return "Select a workspace before adding a task";
  }

  return workspace.kind === "team" ? "Add a task for this team" : "Add a task for yourself";
}

function getDesktopTaskFilterLabel(filter: DesktopTaskFilter): string {
  switch (filter) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    default:
      return "All";
  }
}

function getDesktopDateViewLabel(view: DesktopDateView): string {
  switch (view) {
    case "due-today":
      return "Due today";
    case "upcoming":
      return "Upcoming";
    default:
      return "All tasks";
  }
}

function getCurrentDateValue(): string {
  return new Date().toLocaleDateString("en-CA");
}

function getDesktopPageEyebrow(route: DesktopRoute): string {
  switch (route.name) {
    case "dashboard":
      return "Dashboard";
    case "personal-workspace":
      return "My workspace";
    case "team-list":
      return "Joined teams";
    case "team-detail":
      return "Team detail";
    case "join-team":
      return "Join team";
    case "create-team":
      return "Create team";
  }
}

function getEmptyStateCopy(workspace: DesktopWorkspace | null) {
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

function TodoRow({
  todo,
  disabled,
  onDelete,
  onStartEdit,
  onToggleComplete,
}: {
  todo: DesktopTodoItem;
  disabled: boolean;
  onDelete: (todoId: string) => void;
  onStartEdit: (todo: DesktopTodoItem) => void;
  onToggleComplete: (todo: DesktopTodoItem) => void;
}) {
  const isOptimistic = todo.id.startsWith("optimistic-");

  return (
    <li className={`todo-card ${todo.completed ? "is-complete" : ""}`}>
      <label className="todo-toggle">
        <input
          checked={todo.completed}
          disabled={disabled}
          onChange={() => onToggleComplete(todo)}
          type="checkbox"
        />
        <span className="todo-toggle__control" aria-hidden="true" />
      </label>

      <div className="todo-card__body">
        <div className="todo-card__meta">
          <span className="todo-card__eyebrow">{isOptimistic ? "Syncing" : "Updated"}</span>
          <span>{isOptimistic ? "Waiting for Supabase" : formatUpdatedAt(todo.updatedAt)}</span>
          {todo.dueDate ? <span>Due {formatDueDate(todo.dueDate)}</span> : null}
        </div>
        <p>{todo.title}</p>
      </div>

      <div className="todo-card__actions">
        <button disabled={disabled} onClick={() => onStartEdit(todo)} type="button">
          Edit
        </button>
        <button
          className="danger"
          disabled={disabled}
          onClick={() => onDelete(todo.id)}
          type="button"
        >
          Delete
        </button>
      </div>
    </li>
  );
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
  const emptyStateCopy = getEmptyStateCopy(pageWorkspace);
  const todayDateValue = getCurrentDateValue();
  const { filteredTodos, taskCounts, dateViewCounts, selectedDateTodos } = deriveDesktopTaskView(
    viewModel.todos,
    taskFilter,
    dateView,
    todayDateValue,
    selectedDate,
  );
  const dashboard = deriveDesktopDashboard({
    personalWorkspace,
    teamWorkspaces,
  });
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
        const outcome = getCreateInviteSuccessOutcome(invite);

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
          }),
        );
      });
  }

  function renderTodoList() {
    if (viewModel.showEmptyState) {
      return null;
    }

    if (filteredTodos.length === 0) {
      return null;
    }

    return (
      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <TodoRow
            disabled={!viewModel.canManageTodos}
            key={todo.id}
            onDelete={(todoId) => void controller!.deleteTodo(todoId).catch(() => {})}
            onStartEdit={beginEditing}
            onToggleComplete={(entry) =>
              void (
                entry.completed
                  ? controller!.uncompleteTodo(entry.id)
                  : controller!.completeTodo(entry.id)
              ).catch(() => {})
            }
            todo={todo}
          />
        ))}
      </ul>
    );
  }

  function renderSelectedDatePanel() {
    return (
      <section className="selected-date-panel">
        <div className="selected-date-panel__header">
          <div>
            <p className="page-eyebrow">Selected day inspection</p>
            <h3>{formatSelectedDateLabel(selectedDate)}</h3>
            <p className="selected-date-panel__body">
              {selectedDateTodos.length > 0
                ? "These tasks stay limited to items whose due date matches the selected day."
                : "Choose another day or switch filters to inspect a different dated slice."}
            </p>
          </div>
          <div className="selected-date-panel__summary">
            <span>
              {selectedDateTodos.length > 0
                ? `${selectedDateTodos.length} tasks due on ${formatSelectedDateLabel(selectedDate)}`
                : `No tasks due on ${formatSelectedDateLabel(selectedDate)}`}
            </span>
          </div>
        </div>
        {selectedDateTodos.length > 0 ? (
          <ul className="selected-date-list">
            {selectedDateTodos.map((todo) => (
              <li className="selected-date-list__item" key={`selected-${todo.id}`}>
                <div>
                  <strong>{todo.title}</strong>
                  <span>
                    {todo.completed ? "Completed task" : "Active task"}
                    {todo.dueDate ? `, due ${formatDueDate(todo.dueDate)}` : ""}
                  </span>
                </div>
                <button onClick={() => beginEditing(todo)} type="button">
                  Edit
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  function renderTaskControls() {
    return (
      <section className="task-filter-panel" aria-label="Task filters">
        <div>
          <p className="page-eyebrow">Task filter</p>
          <h3>{getDesktopTaskFilterLabel(taskFilter)} tasks</h3>
          <p>
            Narrow this workspace to all, active, or completed tasks without changing the shared
            product state.
          </p>
        </div>

        <div className="task-filter-group" aria-label="Filter tasks by status" role="tablist">
          {(["all", "active", "completed"] as const).map((filter) => (
            <button
              aria-selected={taskFilter === filter}
              className={`task-filter-chip ${taskFilter === filter ? "is-active" : ""}`}
              disabled={!viewModel.canManageTodos && viewModel.todos.length === 0}
              key={filter}
              onClick={() => setTaskFilter(filter)}
              role="tab"
              type="button"
            >
              <span>{getDesktopTaskFilterLabel(filter)}</span>
              <strong>{taskCounts[filter]}</strong>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderDateControls() {
    return (
      <>
        <section className="task-filter-panel" aria-label="Date views">
          <div>
            <p className="page-eyebrow">Date view</p>
            <h3>{getDesktopDateViewLabel(dateView)}</h3>
            <p>
              Switch between the full workspace list, tasks due today, and upcoming dated tasks.
              Undated tasks stay in the standard list only.
            </p>
          </div>

          <div className="task-filter-group" aria-label="Filter tasks by due date" role="tablist">
            {(["all", "due-today", "upcoming"] as const).map((view) => (
              <button
                aria-selected={dateView === view}
                className={`task-filter-chip ${dateView === view ? "is-active" : ""}`}
                disabled={!viewModel.canManageTodos && viewModel.todos.length === 0}
                key={view}
                onClick={() => setDateView(view)}
                role="tab"
                type="button"
              >
                <span>{getDesktopDateViewLabel(view)}</span>
                <strong>{dateViewCounts[view]}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="selected-date-panel">
          <div className="selected-date-panel__header">
            <div>
              <p className="page-eyebrow">Selected day</p>
              <h3>{formatSelectedDateLabel(selectedDate)}</h3>
              <p className="selected-date-panel__body">
                Inspect the tasks due on one day without switching to a full calendar surface.
              </p>
            </div>

            <label className="selected-date-panel__field composer__field">
              <span>Day to inspect</span>
              <input
                onChange={(event) => setSelectedDate(event.currentTarget.value)}
                type="date"
                value={selectedDate}
              />
            </label>
          </div>

          <div className="selected-date-panel__summary">
            <span>{selectedDateTodos.length} matching tasks</span>
            <span>
              This day respects the current {getDesktopTaskFilterLabel(taskFilter).toLowerCase()}{" "}
              filter.
            </span>
          </div>
        </section>
      </>
    );
  }

  function renderEditingForm() {
    if (!editingTodoId) {
      return null;
    }

    return (
      <form className="editor" onSubmit={(event) => void handleSaveEdit(event)}>
        <label className="composer__field">
          <span>Edit task</span>
          <input
            disabled={!viewModel.canManageTodos}
            onChange={(event) => setEditingTitle(event.currentTarget.value)}
            value={editingTitle}
          />
        </label>

        <label className="composer__field">
          <span>Due date</span>
          <input
            disabled={!viewModel.canManageTodos}
            onChange={(event) => setEditingDueDate(event.currentTarget.value)}
            type="date"
            value={editingDueDate}
          />
        </label>

        <div className="editor__actions">
          <button disabled={!viewModel.canManageTodos} type="submit">
            Save
          </button>
          <button disabled={!viewModel.canManageTodos} onClick={cancelEditing} type="button">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderWorkspaceEmptyState() {
    if (viewModel.screen === "error") {
      return (
        <section className="empty-state empty-state--error">
          <p className="empty-state__eyebrow">Sync needs attention</p>
          <h3>We could not load the latest todos.</h3>
          <p>Try refreshing after checking your network or Supabase configuration.</p>
        </section>
      );
    }

    if (viewModel.showEmptyState) {
      return (
        <section className="empty-state">
          <p className="empty-state__eyebrow">
            {pageWorkspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
          </p>
          <h3>{emptyStateCopy.title}</h3>
          <p>{emptyStateCopy.body}</p>
        </section>
      );
    }

    if (filteredTodos.length === 0) {
      return (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No matching tasks</p>
          <h3>
            No {getDesktopDateViewLabel(dateView).toLowerCase()} for the{" "}
            {getDesktopTaskFilterLabel(taskFilter).toLowerCase()} slice.
          </h3>
          <p>Try a different filter or date view to see more items from this workspace.</p>
        </section>
      );
    }

    return null;
  }

  function renderTeamInvitePanel() {
    if (pageWorkspace?.kind !== "team") {
      return null;
    }

    return (
      <section className="invite-panel">
        <div className="invite-panel__header">
          <div>
            <p className="page-eyebrow">Invite teammates</p>
            <h3>Generate a reusable invite for {pageWorkspace.name}.</h3>
            <p className="invite-panel__body">
              Create a reusable invite for this team workspace without leaving desktop. The shared
              `todo-app` controller still owns invite creation and validation.
            </p>
          </div>
          <button disabled={pendingUi} onClick={() => void handleCreateTeamInvite()} type="button">
            Create invite
          </button>
        </div>

        {teamInviteMessage ? (
          <p className="info-banner info-banner--embed">{teamInviteMessage}</p>
        ) : null}

        {teamInviteCode ? (
          <div className="invite-results">
            <label className="composer__field">
              <span>Invite code</span>
              <div className="inline-copy-field">
                <input readOnly value={teamInviteCode} />
              </div>
            </label>

            <div className="workspace-summary__meta">
              <span className="workspace-badge workspace-badge--team">How to share</span>
              <span className="workspace-switcher__hint">
                Ask teammates to paste this into the join flow in desktop or dashboard.
              </span>
            </div>

            <p className="invite-panel__meta">
              Invite expires {formatInviteExpiry(teamInviteExpiresAt)}.
            </p>
          </div>
        ) : null}
      </section>
    );
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
                ? getDesktopRouteTitle(route, routedTeamWorkspace?.name)
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
              createTeamPage={
                <DesktopCreateTeamPage
                  canManageTodos={viewModel.canManageTodos}
                  draftTeamName={draftTeamName}
                  onDraftTeamNameChange={setDraftTeamName}
                  onNavigate={navigate}
                  onSubmit={(event) => void handleCreateTeamSubmit(event)}
                />
              }
              dashboardPage={
                <DesktopDashboardPage
                  actions={dashboard.actions}
                  onNavigate={navigate}
                  stats={dashboard.stats}
                />
              }
              joinTeamPage={
                <DesktopJoinTeamPage
                  feedback={joinFeedback}
                  inputValue={joinInviteInput}
                  isSubmitting={pendingUi}
                  onDismissFeedback={() => setJoinFeedback(null)}
                  onInputChange={setJoinInviteInput}
                  onNavigate={navigate}
                  onSubmit={(event) => void handleJoinTeamSubmit(event)}
                />
              }
              personalWorkspacePage={
                <DesktopWorkspacePage
                  section={personalWorkspaceSection}
                  sectionRoutes={[
                    {
                      isActive: personalWorkspaceSection === "tasks",
                      label: "Tasks",
                      route: { name: "personal-workspace", section: "tasks" },
                    },
                    {
                      isActive: personalWorkspaceSection === "date",
                      label: "Date",
                      route: { name: "personal-workspace", section: "date" },
                    },
                  ]}
                  canManageTodos={viewModel.canManageTodos}
                  composerPlaceholder={getComposerPlaceholder(pageWorkspace)}
                  dateControls={renderDateControls()}
                  draftDueDate={draftDueDate}
                  draftTitle={draftTitle}
                  editingForm={renderEditingForm()}
                  emptyState={renderWorkspaceEmptyState()}
                  emptyStateCopy={emptyStateCopy}
                  filteredTodoList={renderTodoList()}
                  introBody={
                    pageWorkspace
                      ? getWorkspaceDescription(pageWorkspace)
                      : "No personal or team workspace is available for this account yet."
                  }
                  introEyebrow={getDesktopPageEyebrow(route)}
                  introTitle={getDesktopRouteTitle(route, routedTeamWorkspace?.name)}
                  invitePanel={renderTeamInvitePanel()}
                  onCreateSubmit={(event) => void handleCreateSubmit(event)}
                  onDraftDueDateChange={setDraftDueDate}
                  onDraftTitleChange={setDraftTitle}
                  onNavigate={navigate}
                  selectedDatePanel={renderSelectedDatePanel()}
                  taskControls={renderTaskControls()}
                  todoTitleError={viewModel.todoTitleError}
                  workspace={pageWorkspace}
                />
              }
              teamListPage={
                <DesktopTeamListPage
                  onNavigate={navigate}
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
              }
              teamWorkspacePage={
                <DesktopWorkspacePage
                  section={teamDetailSection}
                  sectionRoutes={
                    route.name === "team-detail" && pageWorkspace?.kind === "team"
                      ? [
                          {
                            isActive: teamDetailSection === "tasks",
                            label: "Tasks",
                            route: { name: "team-detail", teamId: route.teamId, section: "tasks" },
                          },
                          {
                            isActive: teamDetailSection === "date",
                            label: "Date",
                            route: { name: "team-detail", teamId: route.teamId, section: "date" },
                          },
                          {
                            isActive: teamDetailSection === "invite",
                            label: "Invite",
                            route: { name: "team-detail", teamId: route.teamId, section: "invite" },
                          },
                        ]
                      : []
                  }
                  canManageTodos={viewModel.canManageTodos}
                  composerPlaceholder={getComposerPlaceholder(pageWorkspace)}
                  dateControls={renderDateControls()}
                  draftDueDate={draftDueDate}
                  draftTitle={draftTitle}
                  editingForm={renderEditingForm()}
                  emptyState={renderWorkspaceEmptyState()}
                  emptyStateCopy={emptyStateCopy}
                  filteredTodoList={renderTodoList()}
                  introBody={
                    pageWorkspace
                      ? getWorkspaceDescription(pageWorkspace)
                      : "No personal or team workspace is available for this account yet."
                  }
                  introEyebrow={getDesktopPageEyebrow(route)}
                  introTitle={getDesktopRouteTitle(route, routedTeamWorkspace?.name)}
                  invitePanel={renderTeamInvitePanel()}
                  onCreateSubmit={(event) => void handleCreateSubmit(event)}
                  onDraftDueDateChange={setDraftDueDate}
                  onDraftTitleChange={setDraftTitle}
                  onNavigate={navigate}
                  selectedDatePanel={renderSelectedDatePanel()}
                  taskControls={renderTaskControls()}
                  todoTitleError={viewModel.todoTitleError}
                  workspace={pageWorkspace}
                />
              }
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
