import { describe, expect, test } from "vite-plus/test";

import {
  buildCreateTeamPayload,
  buildCreatePayload,
  buildUpdatePayload,
  completeTodo,
  createBrowserSessionStorageAdapter,
  createMemorySessionStorageAdapter,
  createSupabaseAuthRepository,
  createSupabaseTodoRepository,
  createSupabaseStorageAdapter,
  createTodoSupabaseClientOptions,
  mapSupabaseSession,
  refreshTodos,
  uncompleteTodo,
} from "../src/index.ts";
import type { CreateTodoInput, UpdateTodoInput } from "../../utils/src/index.ts";

describe("createMemorySessionStorageAdapter", () => {
  test("stores and removes session values", async () => {
    const storage = createMemorySessionStorageAdapter({
      existing: "token",
    });

    await storage.setItem("session", "value");
    expect(await storage.getItem("existing")).toBe("token");
    expect(await storage.getItem("session")).toBe("value");

    await storage.removeItem("existing");
    expect(storage.snapshot()).toEqual({
      session: "value",
    });
  });
});

describe("createBrowserSessionStorageAdapter", () => {
  test("bridges a browser-like storage object", async () => {
    const values = new Map<string, string>();
    const storage = createBrowserSessionStorageAdapter({
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, value);
      },
      removeItem(key) {
        values.delete(key);
      },
    });

    await storage.setItem("auth", "persisted");
    expect(await storage.getItem("auth")).toBe("persisted");
  });
});

describe("createSupabaseStorageAdapter", () => {
  test("normalizes storage methods for Supabase auth", async () => {
    const storage = createSupabaseStorageAdapter(createMemorySessionStorageAdapter());

    await storage.setItem("sb-todos-auth", "serialized-session");
    expect(await storage.getItem("sb-todos-auth")).toBe("serialized-session");

    await storage.removeItem("sb-todos-auth");
    expect(await storage.getItem("sb-todos-auth")).toBeNull();
  });
});

describe("createTodoSupabaseClientOptions", () => {
  test("uses storage adapters and web auth defaults", () => {
    const storage = createMemorySessionStorageAdapter();
    const options = createTodoSupabaseClientOptions({
      runtime: "web",
      env: {
        url: "https://example.supabase.co",
        anonKey: "anon-key",
        sessionStorageKey: "sb-todos-auth",
      },
      sessionStorage: storage,
    });

    expect(options.auth?.storageKey).toBe("sb-todos-auth");
    expect(options.auth?.persistSession).toBe(true);
    expect(options.auth?.autoRefreshToken).toBe(true);
    expect(options.auth?.detectSessionInUrl).toBe(true);
    expect(options.auth?.storage).toBeDefined();
  });

  test("disables url session detection by default outside web", () => {
    const options = createTodoSupabaseClientOptions({
      runtime: "mobile",
      env: {
        url: "https://example.supabase.co",
        anonKey: "anon-key",
        sessionStorageKey: "sb-mobile-auth",
      },
    });

    expect(options.auth?.detectSessionInUrl).toBe(false);
  });
});

describe("mapSupabaseSession", () => {
  test("returns null when no user is available", () => {
    expect(mapSupabaseSession(null)).toBeNull();
  });

  test("maps the session into the shared auth contract", () => {
    expect(
      mapSupabaseSession({
        access_token: "access-token",
        refresh_token: "refresh-token",
        expires_in: 3600,
        expires_at: 1234,
        token_type: "bearer",
        user: {
          id: "user-1",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "2026-04-19T00:00:00.000Z",
        },
      } as never),
    ).toEqual({
      userId: "user-1",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });
});

describe("createSupabaseAuthRepository", () => {
  test("signs in with normalized password credentials", async () => {
    const signInCalls: Array<{ email: string; password: string }> = [];
    const repository = createSupabaseAuthRepository({
      auth: {
        async getSession() {
          return {
            data: { session: null },
            error: null,
          };
        },
        async signInWithPassword(input: { email: string; password: string }) {
          signInCalls.push(input);

          return {
            data: {
              session: {
                access_token: "access-token",
                refresh_token: "refresh-token",
                expires_in: 3600,
                expires_at: 1234,
                token_type: "bearer",
                user: {
                  id: "user-1",
                  app_metadata: {},
                  user_metadata: {},
                  aud: "authenticated",
                  created_at: "2026-04-19T00:00:00.000Z",
                },
              },
            },
            error: null,
          };
        },
        async signOut() {
          return {
            error: null,
          };
        },
      },
    } as never);

    await expect(
      repository.signInWithPassword({
        email: "  USER@example.com ",
        password: "secret",
      }),
    ).resolves.toEqual({
      userId: "user-1",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    expect(signInCalls).toEqual([
      {
        email: "user@example.com",
        password: "secret",
      },
    ]);
  });
});

describe("todo mutation payloads", () => {
  test("normalizes personal create payload titles", () => {
    expect(
      buildCreatePayload(
        {
          kind: "personal",
          ownerUserId: "user-1",
        },
        { title: "  plan   release  " },
      ),
    ).toEqual({
      owner_user_id: "user-1",
      title: "plan release",
      due_date: null,
    });
  });

  test("builds team create payloads", () => {
    expect(
      buildCreatePayload(
        {
          kind: "team",
          teamId: "team-1",
        },
        { title: "  team task  " },
      ),
    ).toEqual({
      team_id: "team-1",
      title: "team task",
      due_date: null,
    });
  });

  test("builds create payloads with an optional due date", () => {
    expect(
      buildCreatePayload(
        {
          kind: "personal",
          ownerUserId: "user-1",
        },
        { title: "  publish roadmap  ", dueDate: "2026-05-01" },
      ),
    ).toEqual({
      owner_user_id: "user-1",
      title: "publish roadmap",
      due_date: "2026-05-01",
    });
  });

  test("builds team workspace payloads", () => {
    expect(
      buildCreateTeamPayload("user-1", {
        name: "  Product Ops  ",
      }),
    ).toEqual({
      created_by: "user-1",
      name: "Product Ops",
    });
  });

  test("rejects empty create payload titles", () => {
    expect(() =>
      buildCreatePayload(
        {
          kind: "personal",
          ownerUserId: "user-1",
        },
        { title: "   " },
      ),
    ).toThrow("Todo title is required.");
  });

  test("builds update payloads for title and completion changes", () => {
    expect(
      buildUpdatePayload({
        title: "  write tests  ",
        completed: true,
      }),
    ).toEqual({
      title: "write tests",
      completed: true,
    });
  });

  test("builds update payloads for due date changes", () => {
    expect(
      buildUpdatePayload({
        dueDate: "2026-05-03",
      }),
    ).toEqual({
      due_date: "2026-05-03",
    });
  });
});

describe("todo repository helpers", () => {
  const personalScope = {
    kind: "personal" as const,
    ownerUserId: "user-1",
  };

  test("refreshTodos delegates to listTodos with the workspace scope", async () => {
    const repository = {
      async listWorkspaces() {
        throw new Error("not used");
      },
      async createTeam() {
        throw new Error("not used");
      },
      async createTeamInvite() {
        throw new Error("not used");
      },
      async redeemTeamInvite() {
        throw new Error("not used");
      },
      async listTodos(workspace: { kind: "personal"; ownerUserId: string }) {
        return [
          {
            id: "todo-1",
            title: "refresh",
            completed: false,
            dueDate: null,
            createdAt: "",
            updatedAt: "",
            workspace,
          },
        ];
      },
      async createTodo(
        _workspace: { kind: "personal"; ownerUserId: string },
        _input: CreateTodoInput,
      ) {
        throw new Error("not used");
      },
      async updateTodo(_todoId: string, _input: UpdateTodoInput) {
        throw new Error("not used");
      },
      async deleteTodo() {
        throw new Error("not used");
      },
    };

    await expect(refreshTodos(repository, personalScope)).resolves.toEqual([
      {
        id: "todo-1",
        title: "refresh",
        completed: false,
        dueDate: null,
        createdAt: "",
        updatedAt: "",
        workspace: personalScope,
      },
    ]);
  });

  test("completeTodo and uncompleteTodo delegate through updateTodo", async () => {
    const calls: Array<{ todoId: string; completed: boolean }> = [];
    const repository = {
      async listWorkspaces() {
        throw new Error("not used");
      },
      async createTeam() {
        throw new Error("not used");
      },
      async createTeamInvite() {
        throw new Error("not used");
      },
      async redeemTeamInvite() {
        throw new Error("not used");
      },
      async listTodos() {
        throw new Error("not used");
      },
      async createTodo(
        _workspace: { kind: "personal"; ownerUserId: string },
        _input: CreateTodoInput,
      ) {
        throw new Error("not used");
      },
      async updateTodo(todoId: string, input: { completed?: boolean }) {
        calls.push({ todoId, completed: input.completed ?? false });

        return {
          id: todoId,
          title: "toggle",
          completed: input.completed ?? false,
          dueDate: null,
          createdAt: "",
          updatedAt: "",
          workspace: personalScope,
        };
      },
      async deleteTodo() {
        throw new Error("not used");
      },
    };

    await completeTodo(repository, "todo-1");
    await uncompleteTodo(repository, "todo-1");

    expect(calls).toEqual([
      { todoId: "todo-1", completed: true },
      { todoId: "todo-1", completed: false },
    ]);
  });

  test("createSupabaseTodoRepository lists personal plus joined team workspaces from memberships", async () => {
    const client = {
      from(table: string) {
        if (table === "team_members") {
          return {
            select(selection: string) {
              expect(selection).toContain("team:teams!team_members_team_id_fkey");

              return {
                eq(column: string, value: string) {
                  expect(column).toBe("user_id");
                  expect(value).toBe("user-1");

                  return Promise.resolve({
                    data: [
                      {
                        team_id: "team-2",
                        user_id: "user-1",
                        created_at: "2026-04-20T00:00:00.000Z",
                        team: {
                          id: "team-2",
                          name: "Research",
                          created_by: "user-2",
                          created_at: "2026-04-20T00:00:00.000Z",
                          updated_at: "2026-04-20T00:00:00.000Z",
                        },
                      },
                      {
                        team_id: "team-1",
                        user_id: "user-1",
                        created_at: "2026-04-19T00:00:00.000Z",
                        team: {
                          id: "team-1",
                          name: "Design",
                          created_by: "user-1",
                          created_at: "2026-04-19T00:00:00.000Z",
                          updated_at: "2026-04-19T00:00:00.000Z",
                        },
                      },
                    ],
                    error: null,
                  });
                },
              };
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(repository.listWorkspaces("user-1")).resolves.toEqual([
      {
        id: "personal:user-1",
        kind: "personal",
        name: "My Tasks",
        ownerUserId: "user-1",
      },
      {
        id: "team-1",
        kind: "team",
        name: "Design",
        teamId: "team-1",
      },
      {
        id: "team-2",
        kind: "team",
        name: "Research",
        teamId: "team-2",
      },
    ]);
  });

  test("createSupabaseTodoRepository maps personal todo rows from Supabase", async () => {
    const client = {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  order: async () => ({
                    data: [
                      {
                        id: "todo-1",
                        user_id: "user-1",
                        owner_user_id: "user-1",
                        team_id: null,
                        title: "ship desktop shell",
                        completed: false,
                        created_at: "2026-04-19T00:00:00.000Z",
                        updated_at: "2026-04-19T01:00:00.000Z",
                      },
                    ],
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(repository.listTodos(personalScope)).resolves.toEqual([
      {
        id: "todo-1",
        title: "ship desktop shell",
        completed: false,
        createdAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T01:00:00.000Z",
        workspace: personalScope,
      },
    ]);
  });

  test("createSupabaseTodoRepository creates a team workspace", async () => {
    const client = {
      from(table: string) {
        if (table !== "teams") {
          throw new Error(`Unexpected table: ${table}`);
        }

        return {
          insert(payload: { created_by: string; name: string }) {
            expect(payload).toEqual({
              created_by: "user-1",
              name: "Product Ops",
            });

            return {
              select() {
                return {
                  single: async () => ({
                    data: {
                      id: "team-created",
                      name: "Product Ops",
                      created_by: "user-1",
                      created_at: "2026-04-19T00:00:00.000Z",
                      updated_at: "2026-04-19T00:00:00.000Z",
                    },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(
      repository.createTeam("user-1", {
        name: "  Product Ops  ",
      }),
    ).resolves.toEqual({
      id: "team-created",
      kind: "team",
      name: "Product Ops",
      teamId: "team-created",
    });
  });

  test("createSupabaseTodoRepository creates a team invite through the invite rpc", async () => {
    const client = {
      rpc(fn: string, args: { target_team_id: string; target_expires_at: string | null }) {
        expect(fn).toBe("create_team_invite");
        expect(args).toEqual({
          target_team_id: "team-1",
          target_expires_at: null,
        });

        return Promise.resolve({
          data: {
            id: "invite-1",
            team_id: "team-1",
            created_by: "user-1",
            token: "abc123",
            expires_at: "2026-04-28T00:00:00.000Z",
            revoked_at: null,
            created_at: "2026-04-21T00:00:00.000Z",
            updated_at: "2026-04-21T00:00:00.000Z",
          },
          error: null,
        });
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(repository.createTeamInvite("team-1")).resolves.toEqual({
      id: "invite-1",
      teamId: "team-1",
      createdBy: "user-1",
      token: "abc123",
      expiresAt: "2026-04-28T00:00:00.000Z",
      revokedAt: null,
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    });
  });

  test("createSupabaseTodoRepository redeems a team invite through the redeem rpc", async () => {
    const client = {
      rpc(fn: string, args: { target_token: string }) {
        expect(fn).toBe("redeem_team_invite");
        expect(args).toEqual({
          target_token: "invite-token",
        });

        return Promise.resolve({
          data: {
            team_id: "team-1",
            user_id: "user-2",
            created_at: "2026-04-21T00:00:00.000Z",
          },
          error: null,
        });
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(repository.redeemTeamInvite("invite-token")).resolves.toEqual({
      teamId: "team-1",
      userId: "user-2",
      createdAt: "2026-04-21T00:00:00.000Z",
    });
  });

  test("createSupabaseTodoRepository maps team todo rows from Supabase", async () => {
    const client = {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  order: async () => ({
                    data: [
                      {
                        id: "todo-2",
                        user_id: null,
                        owner_user_id: null,
                        team_id: "team-1",
                        title: "review sprint board",
                        completed: true,
                        due_date: "2026-05-04",
                        created_at: "2026-04-19T00:00:00.000Z",
                        updated_at: "2026-04-19T01:00:00.000Z",
                      },
                    ],
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    };

    const repository = createSupabaseTodoRepository(client as never);

    await expect(
      repository.listTodos({
        kind: "team",
        teamId: "team-1",
      }),
    ).resolves.toEqual([
      {
        id: "todo-2",
        title: "review sprint board",
        completed: true,
        dueDate: "2026-05-04",
        createdAt: "2026-04-19T00:00:00.000Z",
        updatedAt: "2026-04-19T01:00:00.000Z",
        workspace: {
          kind: "team",
          teamId: "team-1",
        },
      },
    ]);
  });
});
