import type {
  CreateTeamInviteInput,
  TeamInvite,
  CreateTeamInput,
  CreateTodoInput,
  TodoId,
  TodoItem,
  TodoRepository,
  TodoWorkspace,
  TodoWorkspaceScope,
  UpdateTodoInput,
} from "../../utils/src/index.ts";
import {
  createPersonalWorkspace,
  validateTeamName,
  validateTodoTitle,
} from "../../utils/src/index.ts";

import type {
  TeamMemberWorkspaceRow,
  TeamInviteRecordRow,
  TeamRecordRow,
  TodoDatabase,
  TodoRecordRow,
  TodoSupabaseClient,
} from "./types.ts";

function mapTodoRecord(record: TodoRecordRow): TodoItem {
  if (record.owner_user_id) {
    return {
      id: record.id,
      title: record.title,
      completed: record.completed,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      workspace: {
        kind: "personal",
        ownerUserId: record.owner_user_id,
      },
    };
  }

  if (record.team_id) {
    return {
      id: record.id,
      title: record.title,
      completed: record.completed,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      workspace: {
        kind: "team",
        teamId: record.team_id,
      },
    };
  }

  throw new Error(`Todo "${record.id}" is missing a workspace scope.`);
}

function mapTeamWorkspace(record: TeamRecordRow): TodoWorkspace {
  return {
    id: record.id,
    kind: "team",
    name: record.name,
    teamId: record.id,
  };
}

export function mapTeamInvite(record: TeamInviteRecordRow): TeamInvite {
  return {
    id: record.id,
    teamId: record.team_id,
    createdBy: record.created_by,
    token: record.token,
    expiresAt: record.expires_at,
    revokedAt: record.revoked_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapJoinedTeamWorkspace(record: TeamMemberWorkspaceRow): TodoWorkspace {
  const team = Array.isArray(record.team) ? record.team[0] : record.team;

  if (!team) {
    throw new Error(`Team membership for "${record.team_id}" is missing team details.`);
  }

  return mapTeamWorkspace(team);
}

function buildCreatePayload(workspace: TodoWorkspaceScope, input: CreateTodoInput) {
  const validatedTitle = validateTodoTitle(input.title);

  if (!validatedTitle.ok || !validatedTitle.value) {
    throw new Error(validatedTitle.error ?? "Todo title is invalid.");
  }

  if (workspace.kind === "personal") {
    return {
      owner_user_id: workspace.ownerUserId,
      title: validatedTitle.value,
    };
  }

  return {
    team_id: workspace.teamId,
    title: validatedTitle.value,
  };
}

function buildCreateTeamPayload(userId: string, input: CreateTeamInput) {
  const validatedName = validateTeamName(input.name);

  if (!validatedName.ok || !validatedName.value) {
    throw new Error(validatedName.error ?? "Team name is invalid.");
  }

  return {
    created_by: userId,
    name: validatedName.value,
  };
}

function buildUpdatePayload(input: UpdateTodoInput) {
  const payload: TodoDatabase["public"]["Tables"]["todos"]["Update"] = {};

  if (input.title !== undefined) {
    const validatedTitle = validateTodoTitle(input.title);

    if (!validatedTitle.ok || !validatedTitle.value) {
      throw new Error(validatedTitle.error ?? "Todo title is invalid.");
    }

    payload.title = validatedTitle.value;
  }

  if (input.completed !== undefined) {
    payload.completed = input.completed;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Todo update requires at least one field.");
  }

  return payload;
}

export class SupabaseTodoRepository implements TodoRepository {
  private readonly client: TodoSupabaseClient;

  constructor(client: TodoSupabaseClient) {
    this.client = client;
  }

  async listWorkspaces(userId: string): Promise<TodoWorkspace[]> {
    const { data, error } = await this.client
      .from("team_members")
      .select(
        "team_id, user_id, created_at, team:teams!team_members_team_id_fkey (id, name, created_by, created_at, updated_at)",
      )
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const teams = ((data ?? []) as TeamMemberWorkspaceRow[])
      .map(mapJoinedTeamWorkspace)
      .sort((left, right) => left.name.localeCompare(right.name));

    return [createPersonalWorkspace(userId), ...teams];
  }

  async createTeam(userId: string, input: CreateTeamInput): Promise<TodoWorkspace> {
    const { data, error } = await this.client
      .from("teams")
      .insert(buildCreateTeamPayload(userId, input) as never)
      .select("id, name, created_by, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    return mapTeamWorkspace(data as TeamRecordRow);
  }

  async createTeamInvite(teamId: string, input?: CreateTeamInviteInput): Promise<TeamInvite> {
    const { data, error } = await this.client.rpc("create_team_invite", {
      target_team_id: teamId,
      target_expires_at: input?.expiresAt ?? null,
    } as never);

    if (error) {
      throw error;
    }

    return mapTeamInvite(data as TeamInviteRecordRow);
  }

  async listTodos(workspace: TodoWorkspaceScope): Promise<TodoItem[]> {
    let query = this.client.from("todos").select("*");

    query =
      workspace.kind === "personal"
        ? query.eq("owner_user_id", workspace.ownerUserId)
        : query.eq("team_id", workspace.teamId);

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as TodoRecordRow[]).map(mapTodoRecord);
  }

  async createTodo(workspace: TodoWorkspaceScope, input: CreateTodoInput): Promise<TodoItem> {
    // Supabase's mutation generics are happiest with generated schema metadata.
    // We bridge that gap locally until the project adopts generated DB types.
    const { data, error } = await this.client
      .from("todos")
      .insert(buildCreatePayload(workspace, input) as never)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapTodoRecord(data as TodoRecordRow);
  }

  async updateTodo(todoId: TodoId, input: UpdateTodoInput): Promise<TodoItem> {
    const { data, error } = await this.client
      .from("todos")
      .update(buildUpdatePayload(input) as never)
      .eq("id", todoId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapTodoRecord(data as TodoRecordRow);
  }

  async deleteTodo(todoId: TodoId): Promise<void> {
    const { error } = await this.client.from("todos").delete().eq("id", todoId);

    if (error) {
      throw error;
    }
  }
}

export function createSupabaseTodoRepository(client: TodoSupabaseClient): TodoRepository {
  return new SupabaseTodoRepository(client);
}

export async function refreshTodos(
  repository: TodoRepository,
  workspace: TodoWorkspaceScope,
): Promise<TodoItem[]> {
  return repository.listTodos(workspace);
}

export async function completeTodo(repository: TodoRepository, todoId: TodoId): Promise<TodoItem> {
  return repository.updateTodo(todoId, { completed: true });
}

export async function uncompleteTodo(
  repository: TodoRepository,
  todoId: TodoId,
): Promise<TodoItem> {
  return repository.updateTodo(todoId, { completed: false });
}

export { buildCreatePayload, buildCreateTeamPayload, buildUpdatePayload, mapTodoRecord };
