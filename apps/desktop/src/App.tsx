import { useEffect, useState, type FormEvent } from "react";
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

import { getDesktopSupabaseEnv } from "./env.ts";

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

function getWorkspaceBadgeLabel(workspace: DesktopWorkspace): string {
  return workspace.kind === "team" ? "Team workspace" : "Personal workspace";
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

export function App() {
  const [bootstrap] = useState(createDesktopBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTeamName, setDraftTeamName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    if (!bootstrap.controller) {
      return;
    }

    const unsubscribe = bootstrap.controller.subscribe(setState);

    void bootstrap.controller.initialize().catch(() => {});

    return unsubscribe;
  }, [bootstrap.controller]);

  const viewModel = createTodoAppViewModel(state);
  const controller = bootstrap.controller;
  const pendingUi = viewModel.isLoading || state.pendingMutations > 0;
  const activeWorkspace = viewModel.activeWorkspace;
  const emptyStateCopy = getEmptyStateCopy(activeWorkspace);

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
      })
      .then(() => {
        setDraftTitle("");
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
      .then(() => {
        setDraftTeamName("");
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
      })
      .then(() => {
        setEditingTodoId(null);
        setEditingTitle("");
      })
      .catch(() => {});
  }

  function beginEditing(todo: DesktopTodoItem) {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  }

  function cancelEditing() {
    setEditingTodoId(null);
    setEditingTitle("");
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

  return (
    <main className="app-shell">
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

      <section className="workspace-panel">
        <header className="workspace-header">
          <div>
            <p className="workspace-header__eyebrow">Desktop client</p>
            <h2>Todo workspace</h2>
          </div>

          {viewModel.isAuthenticated ? (
            <div className="workspace-header__session">
              <p>{state.session?.userId}</p>
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
          <>
            <section className="workspace-switcher">
              <div className="workspace-switcher__copy">
                <p className="workspace-switcher__eyebrow">Workspace</p>
                <h3>{activeWorkspace?.name ?? "No workspace available"}</h3>
                <p>
                  {activeWorkspace
                    ? getWorkspaceDescription(activeWorkspace)
                    : "No personal or team workspace is available for this account yet."}
                </p>
              </div>

              <div className="workspace-switcher__controls">
                <label className="workspace-switcher__field">
                  <span>Active workspace</span>
                  <select
                    disabled={pendingUi || viewModel.workspaces.length === 0}
                    onChange={(event) =>
                      void controller.selectWorkspace(event.currentTarget.value).catch(() => {})
                    }
                    value={viewModel.activeWorkspace?.id ?? ""}
                  >
                    {viewModel.workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.kind === "team" ? `Team: ${workspace.name}` : workspace.name}
                      </option>
                    ))}
                  </select>
                </label>

                {activeWorkspace ? (
                  <div className="workspace-switcher__meta">
                    <span className={`workspace-badge workspace-badge--${activeWorkspace.kind}`}>
                      {getWorkspaceBadgeLabel(activeWorkspace)}
                    </span>
                    <span className="workspace-switcher__hint">
                      {activeWorkspace.kind === "team"
                        ? "Create, edit, complete, and delete actions apply to this shared team list."
                        : "Create, edit, complete, and delete actions stay scoped to your personal list."}
                    </span>
                  </div>
                ) : null}

                <form
                  className="workspace-switcher__create"
                  onSubmit={(event) => void handleCreateTeamSubmit(event)}
                >
                  <label className="workspace-switcher__field">
                    <span>New team</span>
                    <input
                      disabled={!viewModel.canManageTodos}
                      onChange={(event) => setDraftTeamName(event.currentTarget.value)}
                      placeholder="Operations"
                      value={draftTeamName}
                    />
                  </label>

                  <button disabled={!viewModel.canManageTodos} type="submit">
                    Create team
                  </button>
                </form>
              </div>
            </section>

            <form className="composer" onSubmit={(event) => void handleCreateSubmit(event)}>
              <label className="composer__field">
                <span>New task</span>
                <input
                  disabled={!viewModel.canManageTodos}
                  onChange={(event) => setDraftTitle(event.currentTarget.value)}
                  placeholder={getComposerPlaceholder(activeWorkspace)}
                  value={draftTitle}
                />
              </label>

              <button disabled={!viewModel.canManageTodos} type="submit">
                Add task
              </button>
            </form>

            {viewModel.todoTitleError ? (
              <p className="field-error field-error--spaced">{viewModel.todoTitleError}</p>
            ) : null}

            {editingTodoId ? (
              <form className="editor" onSubmit={(event) => void handleSaveEdit(event)}>
                <label className="composer__field">
                  <span>Edit task</span>
                  <input
                    disabled={!viewModel.canManageTodos}
                    onChange={(event) => setEditingTitle(event.currentTarget.value)}
                    value={editingTitle}
                  />
                </label>

                <div className="editor__actions">
                  <button disabled={!viewModel.canManageTodos} type="submit">
                    Save
                  </button>
                  <button
                    disabled={!viewModel.canManageTodos}
                    onClick={cancelEditing}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {viewModel.showEmptyState ? (
              <section className="empty-state">
                <p className="empty-state__eyebrow">
                  {activeWorkspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
                </p>
                <h3>{emptyStateCopy.title}</h3>
                <p>{emptyStateCopy.body}</p>
              </section>
            ) : null}

            {viewModel.todos.length > 0 ? (
              <ul className="todo-list">
                {viewModel.todos.map((todo) => (
                  <TodoRow
                    disabled={!viewModel.canManageTodos}
                    key={todo.id}
                    onDelete={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
                    onStartEdit={beginEditing}
                    onToggleComplete={(entry) =>
                      void (
                        entry.completed
                          ? controller.uncompleteTodo(entry.id)
                          : controller.completeTodo(entry.id)
                      ).catch(() => {})
                    }
                    todo={todo}
                  />
                ))}
              </ul>
            ) : null}

            {viewModel.screen === "error" ? (
              <section className="empty-state empty-state--error">
                <p className="empty-state__eyebrow">Sync needs attention</p>
                <h3>We could not load the latest todos.</h3>
                <p>Try refreshing after checking your network or Supabase configuration.</p>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
