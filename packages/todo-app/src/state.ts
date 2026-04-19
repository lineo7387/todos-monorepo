import type {
  AuthRepository,
  AuthSession,
  CreateTeamInput,
  CreateTodoInput,
  PasswordSignInInput,
  TodoId,
  TodoItem,
  TodoRepository,
  TodoWorkspace,
  TodoWorkspaceScope,
  UpdateTodoInput,
} from "../../utils/src/index.ts";
import {
  normalizeTodoTitle,
  validateEmailAddress,
  validateTeamName,
  validateTodoTitle,
} from "../../utils/src/index.ts";

export type TodoAppStatus = "checking-session" | "signed-out" | "loading" | "ready" | "error";

export type TodoMutationKind =
  | "sign-up"
  | "refresh"
  | "create-team"
  | "create"
  | "update"
  | "delete"
  | "complete"
  | "uncomplete"
  | "sign-out";

export type TodoAppErrorKind = "auth" | "session" | "sync" | "validation" | "notice";

export interface TodoAppState {
  status: TodoAppStatus;
  session: AuthSession | null;
  workspaces: TodoWorkspace[];
  activeWorkspaceId: string | null;
  todos: TodoItem[];
  pendingMutations: number;
  lastError: string | null;
  lastErrorKind: TodoAppErrorKind | null;
  signInFieldErrors: TodoAppSignInFieldErrors;
  todoTitleError: string | null;
  lastMutation: TodoMutationKind | null;
}

export interface TodoAppDependencies {
  authRepository: AuthRepository;
  todoRepository: TodoRepository;
}

export interface TodoAppController {
  getState(): TodoAppState;
  subscribe(listener: TodoAppStateListener): () => void;
  initialize(): Promise<TodoAppState>;
  signInWithPassword(input: PasswordSignInInput): Promise<AuthSession>;
  signUpWithPassword(input: PasswordSignInInput): Promise<AuthSession | null>;
  createTeam(input: CreateTeamInput): Promise<TodoWorkspace>;
  selectWorkspace(workspaceId: string): Promise<TodoItem[]>;
  refresh(): Promise<TodoItem[]>;
  createTodo(input: CreateTodoInput): Promise<TodoItem>;
  updateTodo(todoId: TodoId, input: UpdateTodoInput): Promise<TodoItem>;
  completeTodo(todoId: TodoId): Promise<TodoItem>;
  uncompleteTodo(todoId: TodoId): Promise<TodoItem>;
  deleteTodo(todoId: TodoId): Promise<void>;
  signOut(): Promise<void>;
  clearError(): void;
}

export type TodoAppStateListener = (state: TodoAppState) => void;

export interface TodoAppViewModel {
  screen: "auth" | "loading" | "error" | "empty" | "list";
  isAuthenticated: boolean;
  canManageTodos: boolean;
  showEmptyState: boolean;
  isLoading: boolean;
  loadingMessage: string | null;
  pendingMessage: string | null;
  workspaces: TodoWorkspace[];
  activeWorkspace: TodoWorkspace | null;
  todos: TodoItem[];
  pendingMutations: number;
  errorMessage: string | null;
  errorKind: TodoAppErrorKind | null;
  signInFieldErrors: TodoAppSignInFieldErrors;
  todoTitleError: string | null;
}

export interface TodoAppSignInFieldErrors {
  email: string | null;
  password: string | null;
}

const INITIAL_STATE: TodoAppState = {
  status: "checking-session",
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong while syncing todos.";
}

function getLoadingMessage(state: TodoAppState): string | null {
  if (state.status === "checking-session") {
    return "Restoring your session...";
  }

  if (state.status !== "loading") {
    return null;
  }

  if (!state.session) {
    return "Signing you in...";
  }

  return "Loading your todos...";
}

function getPendingMessage(state: TodoAppState): string | null {
  if (state.pendingMutations === 0) {
    return null;
  }

  switch (state.lastMutation) {
    case "create":
      return "Saving your new task...";
    case "create-team":
      return "Creating your team workspace...";
    case "delete":
      return "Deleting task...";
    case "sign-up":
      return "Creating your account...";
    case "sign-out":
      return "Signing you out...";
    case "update":
    case "complete":
    case "uncomplete":
      return "Saving your changes...";
    case "refresh":
      return "Refreshing tasks...";
    default:
      return "Syncing your changes...";
  }
}

export function validateTodoDraft(title: string): string | null {
  const validation = validateTodoTitle(title);

  return validation.ok ? null : (validation.error ?? "Todo title is invalid.");
}

export function validateSignInFields(input: PasswordSignInInput): TodoAppSignInFieldErrors {
  const email = validateEmailAddress(input.email);

  return {
    email: email.ok ? null : (email.error ?? "Email is required."),
    password: input.password.trim().length > 0 ? null : "Password is required.",
  };
}

function replaceTodo(todos: TodoItem[], todoId: TodoId, nextTodo: TodoItem): TodoItem[] {
  return todos.map((todo) => (todo.id === todoId ? nextTodo : todo));
}

function removeTodo(todos: TodoItem[], todoId: TodoId): TodoItem[] {
  return todos.filter((todo) => todo.id !== todoId);
}

function ensureAuthenticatedSession(session: AuthSession | null): AuthSession {
  if (!session) {
    throw new Error("You must be signed in to manage todos.");
  }

  return session;
}

function getActiveWorkspace(state: TodoAppState): TodoWorkspace | null {
  if (!state.activeWorkspaceId) {
    return null;
  }

  return state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? null;
}

function getWorkspaceScope(workspace: TodoWorkspace): TodoWorkspaceScope {
  if (workspace.kind === "personal") {
    if (!workspace.ownerUserId) {
      throw new Error("Personal workspace is missing owner details.");
    }

    return {
      kind: "personal",
      ownerUserId: workspace.ownerUserId,
    };
  }

  if (!workspace.teamId) {
    throw new Error("Team workspace is missing team details.");
  }

  return {
    kind: "team",
    teamId: workspace.teamId,
  };
}

class TodoAppControllerImpl implements TodoAppController {
  private readonly listeners = new Set<TodoAppStateListener>();
  private state: TodoAppState = INITIAL_STATE;
  private mutationQueue = Promise.resolve();
  private optimisticIdCounter = 0;
  private readonly dependencies: TodoAppDependencies;

  constructor(dependencies: TodoAppDependencies) {
    this.dependencies = dependencies;
  }

  getState(): TodoAppState {
    return this.state;
  }

  subscribe(listener: TodoAppStateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async initialize(): Promise<TodoAppState> {
    this.setState({
      status: "checking-session",
      todos: [],
      session: null,
      workspaces: [],
      activeWorkspaceId: null,
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: null,
    });

    try {
      const session = await this.dependencies.authRepository.getSession();

      if (!session) {
        this.setState({
          status: "signed-out",
          todos: [],
          session: null,
          workspaces: [],
          activeWorkspaceId: null,
          lastError: null,
          lastErrorKind: null,
          signInFieldErrors: {
            email: null,
            password: null,
          },
          todoTitleError: null,
          lastMutation: null,
        });

        return this.state;
      }

      this.setState({
        status: "loading",
        session,
        workspaces: [],
        activeWorkspaceId: null,
        todos: [],
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
      });

      const workspaces = await this.dependencies.todoRepository.listWorkspaces(session.userId);
      const activeWorkspace = workspaces[0] ?? null;
      const todos = activeWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(activeWorkspace))
        : [];

      this.setState({
        status: "ready",
        session,
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        todos,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      });
    } catch (error) {
      this.setState({
        status: "error",
        todos: [],
        session: null,
        workspaces: [],
        activeWorkspaceId: null,
        lastError: toErrorMessage(error),
        lastErrorKind: "session",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
      });
    }

    return this.state;
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<AuthSession> {
    const fieldErrors = validateSignInFields(input);

    if (fieldErrors.email || fieldErrors.password) {
      const errorMessage =
        fieldErrors.email ?? fieldErrors.password ?? "Sign-in details are invalid.";

      this.setState({
        status: "signed-out",
        session: null,
        workspaces: [],
        activeWorkspaceId: null,
        todos: [],
        lastError: errorMessage,
        lastErrorKind: "validation",
        signInFieldErrors: fieldErrors,
        todoTitleError: null,
        lastMutation: null,
      });

      throw new Error(errorMessage);
    }

    this.setState({
      status: "loading",
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: null,
      workspaces: [],
      activeWorkspaceId: null,
      todos: [],
    });

    try {
      const session = await this.dependencies.authRepository.signInWithPassword(input);
      const workspaces = await this.dependencies.todoRepository.listWorkspaces(session.userId);
      const activeWorkspace = workspaces[0] ?? null;
      const todos = activeWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(activeWorkspace))
        : [];

      this.setState({
        status: "ready",
        session,
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        todos,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      });

      return session;
    } catch (error) {
      this.setState({
        status: "signed-out",
        session: null,
        workspaces: [],
        activeWorkspaceId: null,
        todos: [],
        lastError: toErrorMessage(error),
        lastErrorKind: "auth",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: null,
      });

      throw error;
    }
  }

  async signUpWithPassword(input: PasswordSignInInput): Promise<AuthSession | null> {
    const fieldErrors = validateSignInFields(input);

    if (fieldErrors.email || fieldErrors.password) {
      const errorMessage =
        fieldErrors.email ?? fieldErrors.password ?? "Sign-up details are invalid.";

      this.setState({
        status: "signed-out",
        session: null,
        workspaces: [],
        activeWorkspaceId: null,
        todos: [],
        lastError: errorMessage,
        lastErrorKind: "validation",
        signInFieldErrors: fieldErrors,
        todoTitleError: null,
        lastMutation: null,
      });

      throw new Error(errorMessage);
    }

    this.setState({
      status: "loading",
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: "sign-up",
      workspaces: [],
      activeWorkspaceId: null,
      todos: [],
    });

    try {
      const session = await this.dependencies.authRepository.signUpWithPassword(input);

      if (!session) {
        this.setState({
          status: "signed-out",
          session: null,
          workspaces: [],
          activeWorkspaceId: null,
          todos: [],
          lastError:
            "Registration succeeded. Check your email to confirm the account, then sign in.",
          lastErrorKind: "notice",
          signInFieldErrors: {
            email: null,
            password: null,
          },
          todoTitleError: null,
          lastMutation: "sign-up",
        });

        return null;
      }

      const workspaces = await this.dependencies.todoRepository.listWorkspaces(session.userId);
      const activeWorkspace = workspaces[0] ?? null;
      const todos = activeWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(activeWorkspace))
        : [];

      this.setState({
        status: "ready",
        session,
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        todos,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      });

      return session;
    } catch (error) {
      this.setState({
        status: "signed-out",
        session: null,
        workspaces: [],
        activeWorkspaceId: null,
        todos: [],
        lastError: toErrorMessage(error),
        lastErrorKind: "auth",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "sign-up",
      });

      throw error;
    }
  }

  async refresh(): Promise<TodoItem[]> {
    const session = ensureAuthenticatedSession(this.state.session);
    const activeWorkspace = this.requireActiveWorkspace();

    this.setState({
      status: "loading",
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: "refresh",
    });

    try {
      const workspaces = await this.dependencies.todoRepository.listWorkspaces(session.userId);
      const nextActiveWorkspace = this.resolveActiveWorkspace(workspaces, activeWorkspace.id);
      const todos = nextActiveWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(nextActiveWorkspace))
        : [];

      this.setState({
        status: "ready",
        workspaces,
        activeWorkspaceId: nextActiveWorkspace?.id ?? null,
        todos,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
      });

      return todos;
    } catch (error) {
      this.setState({
        status: "error",
        lastError: toErrorMessage(error),
        lastErrorKind: "sync",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
      });

      throw error;
    }
  }

  async createTeam(input: CreateTeamInput): Promise<TodoWorkspace> {
    const teamName = validateTeamName(input.name);

    if (!teamName.ok || !teamName.value) {
      const message = teamName.error ?? "Team name is invalid.";

      this.setState({
        lastError: message,
        lastErrorKind: "validation",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "create-team",
      });

      throw new Error(message);
    }

    const session = ensureAuthenticatedSession(this.state.session);
    const snapshot = this.state;

    this.setState({
      pendingMutations: snapshot.pendingMutations + 1,
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: "create-team",
      status: "ready",
    });

    try {
      const createdWorkspace = await this.dependencies.todoRepository.createTeam(
        session.userId,
        input,
      );
      const workspaces = await this.dependencies.todoRepository.listWorkspaces(session.userId);
      const activeWorkspace = this.resolveActiveWorkspace(workspaces, createdWorkspace.id);
      const todos = activeWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(activeWorkspace))
        : [];

      this.setState({
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        todos,
        pendingMutations: Math.max(this.state.pendingMutations - 1, 0),
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "create-team",
        status: "ready",
      });

      return activeWorkspace ?? createdWorkspace;
    } catch (error) {
      await this.handleMutationFailure(snapshot, "create-team", error);
      throw error;
    }
  }

  async selectWorkspace(workspaceId: string): Promise<TodoItem[]> {
    ensureAuthenticatedSession(this.state.session);
    const workspace = this.state.workspaces.find((entry) => entry.id === workspaceId);

    if (!workspace) {
      throw new Error(`Workspace "${workspaceId}" could not be found.`);
    }

    this.setState({
      status: "loading",
      activeWorkspaceId: workspace.id,
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: "refresh",
    });

    try {
      const todos = await this.dependencies.todoRepository.listTodos(getWorkspaceScope(workspace));

      this.setState({
        status: "ready",
        activeWorkspaceId: workspace.id,
        todos,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      });

      return todos;
    } catch (error) {
      this.setState({
        status: "error",
        activeWorkspaceId: workspace.id,
        todos: [],
        lastError: toErrorMessage(error),
        lastErrorKind: "sync",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      });

      throw error;
    }
  }

  createTodo(input: CreateTodoInput): Promise<TodoItem> {
    const titleError = validateTodoDraft(input.title);

    if (titleError) {
      this.setState({
        lastError: titleError,
        lastErrorKind: "validation",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: titleError,
        lastMutation: "create",
      });

      return Promise.reject(new Error(titleError));
    }

    return this.enqueueMutation("create", async () => {
      const workspace = this.requireActiveWorkspace();
      const optimisticTodo = this.buildOptimisticTodo(getWorkspaceScope(workspace), input);

      return {
        optimisticTodos: [optimisticTodo, ...this.state.todos],
        execute: async () => {
          const created = await this.dependencies.todoRepository.createTodo(
            getWorkspaceScope(workspace),
            input,
          );

          return {
            result: created,
            nextTodos: replaceTodo(this.state.todos, optimisticTodo.id, created),
          };
        },
      };
    });
  }

  updateTodo(todoId: TodoId, input: UpdateTodoInput): Promise<TodoItem> {
    if (input.title !== undefined) {
      const titleError = validateTodoDraft(input.title);

      if (titleError) {
        this.setState({
          lastError: titleError,
          lastErrorKind: "validation",
          signInFieldErrors: {
            email: null,
            password: null,
          },
          todoTitleError: titleError,
          lastMutation: "update",
        });

        return Promise.reject(new Error(titleError));
      }
    }

    return this.enqueueMutation("update", async () => {
      const existing = this.requireTodo(todoId);
      const optimisticTodo: TodoItem = {
        ...existing,
        ...(input.title !== undefined ? { title: normalizeTodoTitle(input.title) } : {}),
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
      };

      return {
        optimisticTodos: replaceTodo(this.state.todos, todoId, optimisticTodo),
        execute: async () => {
          const updated = await this.dependencies.todoRepository.updateTodo(todoId, input);

          return {
            result: updated,
            nextTodos: replaceTodo(this.state.todos, todoId, updated),
          };
        },
      };
    });
  }

  completeTodo(todoId: TodoId): Promise<TodoItem> {
    return this.updateTodo(todoId, { completed: true });
  }

  uncompleteTodo(todoId: TodoId): Promise<TodoItem> {
    return this.updateTodo(todoId, { completed: false });
  }

  deleteTodo(todoId: TodoId): Promise<void> {
    return this.enqueueMutation("delete", async () => {
      this.requireTodo(todoId);

      return {
        optimisticTodos: removeTodo(this.state.todos, todoId),
        execute: async () => {
          await this.dependencies.todoRepository.deleteTodo(todoId);

          return {
            result: undefined,
            nextTodos: removeTodo(this.state.todos, todoId),
          };
        },
      };
    });
  }

  signOut(): Promise<void> {
    return this.enqueueMutation("sign-out", async () => ({
      optimisticTodos: [],
      execute: async () => {
        await this.dependencies.authRepository.signOut();

        return {
          result: undefined,
          nextTodos: [],
          nextState: {
            status: "signed-out" as const,
            session: null,
            workspaces: [],
            activeWorkspaceId: null,
          },
        };
      },
    }));
  }

  clearError(): void {
    this.setState({
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
    });
  }

  private async enqueueMutation<TResult>(
    mutation: TodoMutationKind,
    planFactory: () => Promise<{
      optimisticTodos: TodoItem[];
      execute: () => Promise<{
        result: TResult;
        nextTodos: TodoItem[];
        nextState?: Partial<
          Pick<TodoAppState, "status" | "session" | "workspaces" | "activeWorkspaceId">
        >;
      }>;
    }>,
  ): Promise<TResult> {
    const run = async () => {
      const snapshot = this.state;
      let plan: Awaited<ReturnType<typeof planFactory>>;

      try {
        plan = await planFactory();
      } catch (error) {
        const message = toErrorMessage(error);

        this.setState({
          ...snapshot,
          lastError: message,
          lastErrorKind: "validation",
          signInFieldErrors: {
            email: null,
            password: null,
          },
          todoTitleError: message,
          lastMutation: mutation,
        });

        throw error;
      }

      this.setState({
        todos: plan.optimisticTodos,
        pendingMutations: snapshot.pendingMutations + 1,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: mutation,
        status: snapshot.session ? "ready" : snapshot.status,
      });

      try {
        const outcome = await plan.execute();

        this.setState({
          todos: outcome.nextTodos,
          pendingMutations: Math.max(this.state.pendingMutations - 1, 0),
          lastError: null,
          lastErrorKind: null,
          signInFieldErrors: {
            email: null,
            password: null,
          },
          todoTitleError: null,
          lastMutation: mutation,
          ...outcome.nextState,
        });

        return outcome.result;
      } catch (error) {
        await this.handleMutationFailure(snapshot, mutation, error);
        throw error;
      }
    };

    const result = this.mutationQueue.then(run);
    this.mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );

    return result;
  }

  private async handleMutationFailure(
    snapshot: TodoAppState,
    mutation: TodoMutationKind,
    error: unknown,
  ): Promise<void> {
    const lastError = toErrorMessage(error);

    this.setState({
      ...snapshot,
      pendingMutations: Math.max(snapshot.pendingMutations - 1, 0),
      lastError,
      lastErrorKind: "sync",
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: mutation,
    });

    if (!snapshot.session) {
      return;
    }

    try {
      const workspaces = await this.dependencies.todoRepository.listWorkspaces(
        snapshot.session.userId,
      );
      const activeWorkspace = this.resolveActiveWorkspace(workspaces, snapshot.activeWorkspaceId);
      const refreshedTodos = activeWorkspace
        ? await this.dependencies.todoRepository.listTodos(getWorkspaceScope(activeWorkspace))
        : [];

      this.setState({
        ...snapshot,
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        todos: refreshedTodos,
        pendingMutations: 0,
        status: "ready",
        lastError,
        lastErrorKind: "sync",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: mutation,
      });
    } catch {
      this.setState({
        ...snapshot,
        pendingMutations: 0,
        status: snapshot.status === "signed-out" ? "signed-out" : "ready",
        lastError,
        lastErrorKind: "sync",
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: mutation,
      });
    }
  }

  private requireTodo(todoId: TodoId): TodoItem {
    const todo = this.state.todos.find((entry) => entry.id === todoId);

    if (!todo) {
      throw new Error(`Todo "${todoId}" could not be found.`);
    }

    return todo;
  }

  private requireActiveWorkspace(): TodoWorkspace {
    const workspace = getActiveWorkspace(this.state);

    if (!workspace) {
      throw new Error("Select a workspace before managing todos.");
    }

    return workspace;
  }

  private resolveActiveWorkspace(
    workspaces: TodoWorkspace[],
    preferredWorkspaceId: string | null,
  ): TodoWorkspace | null {
    if (preferredWorkspaceId) {
      const preferred = workspaces.find((workspace) => workspace.id === preferredWorkspaceId);

      if (preferred) {
        return preferred;
      }
    }

    return workspaces[0] ?? null;
  }

  private buildOptimisticTodo(workspace: TodoWorkspaceScope, input: CreateTodoInput): TodoItem {
    this.optimisticIdCounter += 1;
    const validation = validateTodoTitle(input.title);

    if (!validation.ok || !validation.value) {
      throw new Error(validation.error ?? "Todo title is invalid.");
    }

    const now = new Date().toISOString();

    return {
      id: `optimistic-${this.optimisticIdCounter}`,
      title: validation.value,
      completed: false,
      createdAt: now,
      updatedAt: now,
      workspace,
    };
  }

  private setState(nextState: Partial<TodoAppState>): void {
    this.state = {
      ...this.state,
      ...nextState,
    };

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export function createTodoAppController(dependencies: TodoAppDependencies): TodoAppController {
  return new TodoAppControllerImpl(dependencies);
}

export function createTodoAppViewModel(state: TodoAppState): TodoAppViewModel {
  const isAuthenticated = state.session !== null;
  const activeWorkspace = getActiveWorkspace(state);
  const showEmptyState = isAuthenticated && state.status === "ready" && state.todos.length === 0;
  const isLoading = state.status === "loading" || state.status === "checking-session";
  let screen: TodoAppViewModel["screen"];

  if (!isAuthenticated && state.status === "signed-out") {
    screen = "auth";
  } else if (state.status === "loading" || state.status === "checking-session") {
    screen = "loading";
  } else if (showEmptyState) {
    screen = "empty";
  } else if (state.status === "error") {
    screen = "error";
  } else {
    screen = "list";
  }

  return {
    screen,
    isAuthenticated,
    canManageTodos: isAuthenticated && state.status === "ready",
    showEmptyState,
    isLoading,
    loadingMessage: getLoadingMessage(state),
    pendingMessage: getPendingMessage(state),
    workspaces: state.workspaces,
    activeWorkspace,
    todos: state.todos,
    pendingMutations: state.pendingMutations,
    errorMessage: state.lastError,
    errorKind: state.lastErrorKind,
    signInFieldErrors: state.signInFieldErrors,
    todoTitleError: state.todoTitleError,
  };
}
