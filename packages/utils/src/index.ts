export type TodoId = string;
export type UserId = string;
export type TeamId = string;
export type WorkspaceId = string;

export type TodoWorkspaceScope =
  | {
      kind: "personal";
      ownerUserId: UserId;
    }
  | {
      kind: "team";
      teamId: TeamId;
    };

export interface TodoWorkspace {
  id: WorkspaceId;
  kind: TodoWorkspaceScope["kind"];
  name: string;
  ownerUserId?: UserId;
  teamId?: TeamId;
}

export interface TodoItem {
  id: TodoId;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  workspace: TodoWorkspaceScope;
}

export interface CreateTodoInput {
  title: string;
  dueDate?: string | null;
}

export interface CreateTeamInput {
  name: string;
}

export interface CreateTeamInviteInput {
  expiresAt?: string;
}

export interface TeamInvite {
  id: string;
  teamId: TeamId;
  createdBy: UserId;
  token: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMembership {
  teamId: TeamId;
  userId: UserId;
  createdAt: string;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
  dueDate?: string | null;
}

export interface AuthSession {
  userId: UserId;
  email?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface PasswordSignInInput {
  email: string;
  password: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  signInWithPassword(input: PasswordSignInInput): Promise<AuthSession>;
  signUpWithPassword(input: PasswordSignInInput): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}

export interface TodoRepository {
  listWorkspaces(userId: UserId): Promise<TodoWorkspace[]>;
  createTeam(userId: UserId, input: CreateTeamInput): Promise<TodoWorkspace>;
  createTeamInvite(teamId: TeamId, input?: CreateTeamInviteInput): Promise<TeamInvite>;
  redeemTeamInvite(token: string): Promise<TeamMembership>;
  listTodos(workspace: TodoWorkspaceScope): Promise<TodoItem[]>;
  createTodo(workspace: TodoWorkspaceScope, input: CreateTodoInput): Promise<TodoItem>;
  updateTodo(todoId: TodoId, input: UpdateTodoInput): Promise<TodoItem>;
  deleteTodo(todoId: TodoId): Promise<void>;
}

const TODO_TITLE_MAX_LENGTH = 280;
const TEAM_NAME_MAX_LENGTH = 120;
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeTodoTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmailAddress(email: string): ValidationResult<string> {
  const normalizedEmail = normalizeEmailAddress(email);

  if (normalizedEmail.length === 0) {
    return {
      ok: false,
      error: "Email is required.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      ok: false,
      error: "Enter a valid email address.",
    };
  }

  return {
    ok: true,
    value: normalizedEmail,
  };
}

export function validatePasswordSignInInput(
  input: PasswordSignInInput,
): ValidationResult<PasswordSignInInput> {
  const email = validateEmailAddress(input.email);

  if (!email.ok || !email.value) {
    return {
      ok: false,
      error: email.error,
    };
  }

  if (input.password.trim().length === 0) {
    return {
      ok: false,
      error: "Password is required.",
    };
  }

  return {
    ok: true,
    value: {
      email: email.value,
      password: input.password,
    },
  };
}

export function validateTodoTitle(title: string): ValidationResult<string> {
  const normalizedTitle = normalizeTodoTitle(title);

  if (normalizedTitle.length === 0) {
    return {
      ok: false,
      error: "Todo title is required.",
    };
  }

  if (normalizedTitle.length > TODO_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Todo title must be ${TODO_TITLE_MAX_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    value: normalizedTitle,
  };
}

export function normalizeTeamName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeInviteToken(token: string): string {
  return token.trim();
}

export function normalizeDueDate(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

export function validateTeamName(name: string): ValidationResult<string> {
  const normalizedName = normalizeTeamName(name);

  if (normalizedName.length === 0) {
    return {
      ok: false,
      error: "Team name is required.",
    };
  }

  if (normalizedName.length > TEAM_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Team name must be ${TEAM_NAME_MAX_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    value: normalizedName,
  };
}

export function validateInviteToken(token: string): ValidationResult<string> {
  const normalizedToken = normalizeInviteToken(token);

  if (normalizedToken.length === 0) {
    return {
      ok: false,
      error: "Invite code is required.",
    };
  }

  return {
    ok: true,
    value: normalizedToken,
  };
}

export function validateDueDate(value: string | null | undefined): ValidationResult<string | null> {
  const normalizedValue = normalizeDueDate(value);

  if (normalizedValue === null) {
    return {
      ok: true,
      value: null,
    };
  }

  if (!DUE_DATE_PATTERN.test(normalizedValue)) {
    return {
      ok: false,
      error: "Due date must use the YYYY-MM-DD format.",
    };
  }

  const parsedDate = new Date(`${normalizedValue}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== normalizedValue
  ) {
    return {
      ok: false,
      error: "Enter a valid due date.",
    };
  }

  return {
    ok: true,
    value: normalizedValue,
  };
}

export function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return "title" in value && typeof value.title === "string";
}

export function createPersonalWorkspaceId(userId: UserId): WorkspaceId {
  return `personal:${userId}`;
}

export function createPersonalWorkspace(userId: UserId, name = "My Tasks"): TodoWorkspace {
  return {
    id: createPersonalWorkspaceId(userId),
    kind: "personal",
    name,
    ownerUserId: userId,
  };
}

export function getWorkspaceScopeId(workspace: TodoWorkspaceScope): WorkspaceId {
  return workspace.kind === "personal"
    ? createPersonalWorkspaceId(workspace.ownerUserId)
    : workspace.teamId;
}
