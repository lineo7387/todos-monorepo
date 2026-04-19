import { describe, expect, test } from "vite-plus/test";

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
import { createPersonalWorkspace, createPersonalWorkspaceId } from "../../utils/src/index.ts";
import {
  createTodoAppController,
  createTodoAppViewModel,
  validateSignInFields,
  validateTodoDraft,
} from "../src/index.ts";

function createTodo(
  overrides: Partial<TodoItem> = {},
  workspace: TodoWorkspaceScope = {
    kind: "personal",
    ownerUserId: "user-1",
  },
): TodoItem {
  return {
    id: "todo-1",
    title: "Ship cross-platform todos",
    completed: false,
    createdAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    workspace,
    ...overrides,
  };
}

function createTeamWorkspace(): TodoWorkspace {
  return {
    id: "team-1",
    kind: "team",
    name: "Design",
    teamId: "team-1",
  };
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

function createAuthRepository(session: AuthSession | null): AuthRepository {
  return {
    async getSession() {
      return session;
    },
    async signInWithPassword(input: PasswordSignInInput) {
      return {
        userId: "user-1",
        accessToken: `token:${input.email}`,
      };
    },
    async signUpWithPassword(input: PasswordSignInInput) {
      return {
        userId: "user-1",
        accessToken: `token:${input.email}`,
      };
    },
    async signOut() {},
  };
}

function createTodoRepository(overrides: Partial<TodoRepository> = {}): TodoRepository {
  return {
    async listWorkspaces(userId: string) {
      return [createPersonalWorkspace(userId), createTeamWorkspace()];
    },
    async createTeam(userId: string, input: CreateTeamInput) {
      return {
        id: "team-created",
        kind: "team",
        name: input.name.trim(),
        teamId: "team-created",
      };
    },
    async listTodos(workspace: TodoWorkspaceScope) {
      return [createTodo({}, workspace)];
    },
    async createTodo(workspace: TodoWorkspaceScope, input: CreateTodoInput) {
      return createTodo(
        {
          id: "todo-created",
          title: input.title.trim(),
        },
        workspace,
      );
    },
    async updateTodo(todoId: TodoId, input: UpdateTodoInput) {
      return createTodo({
        id: todoId,
        title: input.title ?? "Updated title",
        completed: input.completed ?? false,
      });
    },
    async deleteTodo() {},
    ...overrides,
  };
}

describe("createTodoAppController", () => {
  test("marks the user as signed out when no session is available", async () => {
    const controller = createTodoAppController({
      authRepository: createAuthRepository(null),
      todoRepository: createTodoRepository(),
    });

    await controller.initialize();

    expect(controller.getState()).toEqual({
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
    });
  });

  test("loads personal workspace by default for an authenticated session", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };

    const controller = createTodoAppController({
      authRepository: createAuthRepository(session),
      todoRepository: createTodoRepository({
        async listTodos(workspace) {
          return [createTodo({}, workspace)];
        },
      }),
    });

    await controller.initialize();

    expect(controller.getState()).toEqual({
      status: "ready",
      session,
      workspaces: [createPersonalWorkspace("user-1"), createTeamWorkspace()],
      activeWorkspaceId: createPersonalWorkspaceId("user-1"),
      todos: [
        createTodo(
          {},
          {
            kind: "personal",
            ownerUserId: "user-1",
          },
        ),
      ],
      pendingMutations: 0,
      lastError: null,
      lastErrorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
      lastMutation: "refresh",
    });
  });

  test("selects a team workspace and reloads that workspace's todos", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };
    const scopes: TodoWorkspaceScope[] = [];
    const controller = createTodoAppController({
      authRepository: createAuthRepository(session),
      todoRepository: createTodoRepository({
        async listTodos(workspace) {
          scopes.push(workspace);
          return [
            createTodo(
              {
                id: scopes.length === 1 ? "personal-todo" : "team-todo",
              },
              workspace,
            ),
          ];
        },
      }),
    });

    await controller.initialize();
    await controller.selectWorkspace("team-1");

    expect(scopes).toEqual([
      {
        kind: "personal",
        ownerUserId: "user-1",
      },
      {
        kind: "team",
        teamId: "team-1",
      },
    ]);
    expect(controller.getState().activeWorkspaceId).toBe("team-1");
    expect(controller.getState().todos).toEqual([
      createTodo(
        {
          id: "team-todo",
        },
        {
          kind: "team",
          teamId: "team-1",
        },
      ),
    ]);
  });

  test("creates optimistic todos in the active team workspace", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };
    const createRequest = deferred<TodoItem>();
    const scopes: TodoWorkspaceScope[] = [];
    const controller = createTodoAppController({
      authRepository: createAuthRepository(session),
      todoRepository: createTodoRepository({
        async listTodos(workspace) {
          return workspace.kind === "team" ? [] : [createTodo({}, workspace)];
        },
        async createTodo(workspace, input) {
          scopes.push(workspace);
          return createRequest.promise.then(() =>
            createTodo(
              {
                id: "team-created",
                title: input.title.trim(),
              },
              workspace,
            ),
          );
        },
      }),
    });

    await controller.initialize();
    await controller.selectWorkspace("team-1");

    const createPromise = controller.createTodo({
      title: "  Draft team handoff  ",
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(controller.getState().todos).toEqual([
      expect.objectContaining({
        id: "optimistic-1",
        title: "Draft team handoff",
        workspace: {
          kind: "team",
          teamId: "team-1",
        },
      }),
    ]);

    createRequest.resolve(
      createTodo(
        {
          id: "team-created",
          title: "Draft team handoff",
        },
        {
          kind: "team",
          teamId: "team-1",
        },
      ),
    );

    await expect(createPromise).resolves.toEqual(
      createTodo(
        {
          id: "team-created",
          title: "Draft team handoff",
        },
        {
          kind: "team",
          teamId: "team-1",
        },
      ),
    );
    expect(scopes).toEqual([
      {
        kind: "team",
        teamId: "team-1",
      },
    ]);
  });

  test("refresh keeps the selected workspace when it still exists", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };
    const controller = createTodoAppController({
      authRepository: createAuthRepository(session),
      todoRepository: createTodoRepository({
        async listTodos(workspace) {
          return [
            createTodo(
              {
                id: workspace.kind === "team" ? "team-refresh" : "personal-refresh",
              },
              workspace,
            ),
          ];
        },
      }),
    });

    await controller.initialize();
    await controller.selectWorkspace("team-1");
    await controller.refresh();

    expect(controller.getState().activeWorkspaceId).toBe("team-1");
    expect(controller.getState().todos).toEqual([
      createTodo(
        {
          id: "team-refresh",
        },
        {
          kind: "team",
          teamId: "team-1",
        },
      ),
    ]);
  });

  test("creates a team workspace and switches into it", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };
    const listTodoScopes: TodoWorkspaceScope[] = [];
    const controller = createTodoAppController({
      authRepository: createAuthRepository(session),
      todoRepository: createTodoRepository({
        async createTeam(userId, input) {
          expect(userId).toBe("user-1");
          expect(input).toEqual({
            name: "  Product Ops  ",
          });

          return {
            id: "team-created",
            kind: "team",
            name: "Product Ops",
            teamId: "team-created",
          };
        },
        async listWorkspaces(userId) {
          return [
            createPersonalWorkspace(userId),
            createTeamWorkspace(),
            {
              id: "team-created",
              kind: "team",
              name: "Product Ops",
              teamId: "team-created",
            },
          ];
        },
        async listTodos(workspace) {
          listTodoScopes.push(workspace);
          return workspace.kind === "team" && workspace.teamId === "team-created"
            ? []
            : [createTodo({}, workspace)];
        },
      }),
    });

    await controller.initialize();
    await expect(
      controller.createTeam({
        name: "  Product Ops  ",
      }),
    ).resolves.toEqual({
      id: "team-created",
      kind: "team",
      name: "Product Ops",
      teamId: "team-created",
    });

    expect(listTodoScopes).toEqual([
      {
        kind: "personal",
        ownerUserId: "user-1",
      },
      {
        kind: "team",
        teamId: "team-created",
      },
    ]);
    expect(controller.getState().activeWorkspaceId).toBe("team-created");
    expect(controller.getState().workspaces).toEqual([
      createPersonalWorkspace("user-1"),
      createTeamWorkspace(),
      {
        id: "team-created",
        kind: "team",
        name: "Product Ops",
        teamId: "team-created",
      },
    ]);
    expect(controller.getState().todos).toEqual([]);
  });

  test("clears session and workspace state after sign out", async () => {
    const session = {
      userId: "user-1",
      accessToken: "access-token",
    };
    let signOutCalls = 0;
    const controller = createTodoAppController({
      authRepository: {
        ...createAuthRepository(session),
        async signOut() {
          signOutCalls += 1;
        },
      },
      todoRepository: createTodoRepository(),
    });

    await controller.initialize();
    await controller.signOut();

    expect(signOutCalls).toBe(1);
    expect(controller.getState()).toEqual({
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
      lastMutation: "sign-out",
    });
  });

  test("stores validation feedback for invalid sign-in input", async () => {
    const controller = createTodoAppController({
      authRepository: createAuthRepository(null),
      todoRepository: createTodoRepository(),
    });

    await controller.initialize();

    await expect(
      controller.signInWithPassword({
        email: "not-an-email",
        password: "",
      }),
    ).rejects.toThrow("Enter a valid email address.");

    expect(controller.getState().signInFieldErrors).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
  });

  test("stores email-confirmation follow-up as a notice after sign-up", async () => {
    const controller = createTodoAppController({
      authRepository: {
        ...createAuthRepository(null),
        async signUpWithPassword() {
          return null;
        },
      },
      todoRepository: createTodoRepository(),
    });

    await controller.initialize();

    await expect(
      controller.signUpWithPassword({
        email: "new-user@example.com",
        password: "secret",
      }),
    ).resolves.toBeNull();

    expect(controller.getState().lastError).toBe(
      "Registration succeeded. Check your email to confirm the account, then sign in.",
    );
    expect(controller.getState().lastErrorKind).toBe("notice");
  });
});

describe("createTodoAppViewModel", () => {
  test("exposes active workspace and empty-state metadata", () => {
    expect(
      createTodoAppViewModel({
        status: "ready",
        session: {
          userId: "user-1",
          accessToken: "access-token",
        },
        workspaces: [createPersonalWorkspace("user-1"), createTeamWorkspace()],
        activeWorkspaceId: "team-1",
        todos: [],
        pendingMutations: 0,
        lastError: null,
        lastErrorKind: null,
        signInFieldErrors: {
          email: null,
          password: null,
        },
        todoTitleError: null,
        lastMutation: "refresh",
      }),
    ).toEqual({
      screen: "empty",
      isAuthenticated: true,
      canManageTodos: true,
      showEmptyState: true,
      isLoading: false,
      loadingMessage: null,
      pendingMessage: null,
      workspaces: [createPersonalWorkspace("user-1"), createTeamWorkspace()],
      activeWorkspace: createTeamWorkspace(),
      todos: [],
      pendingMutations: 0,
      errorMessage: null,
      errorKind: null,
      signInFieldErrors: {
        email: null,
        password: null,
      },
      todoTitleError: null,
    });
  });
});

describe("todo-app validation helpers", () => {
  test("returns field errors for invalid sign-in input", () => {
    expect(
      validateSignInFields({
        email: "invalid-email",
        password: "",
      }),
    ).toEqual({
      email: "Enter a valid email address.",
      password: "Password is required.",
    });
  });

  test("returns a validation message for invalid todo drafts", () => {
    expect(validateTodoDraft("   ")).toBe("Todo title is required.");
    expect(validateTodoDraft("Ship shared UI")).toBeNull();
  });
});
