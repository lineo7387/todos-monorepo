import type { FormEvent, MouseEvent, ReactNode } from "react";
import { createTodoAppViewModel, type TodoAppState } from "todo-app";

import { getWebsiteRouteHref, type WebsiteRoute } from "./routes.ts";

type WebsiteTodoItem = TodoAppState["todos"][number];
export type WebsiteWorkspace = NonNullable<
  ReturnType<typeof createTodoAppViewModel>["activeWorkspace"]
>;

interface RouteLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate: (route: WebsiteRoute) => void;
  route: WebsiteRoute;
}

export interface AuthPageProps {
  authMode: "sign-in" | "sign-up";
  email: string;
  password: string;
  fieldErrors: TodoAppState["signInFieldErrors"];
  isLoading: boolean;
  onAuthModeChange: (mode: "sign-in" | "sign-up") => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface WorkspacePageProps {
  canManageTodos: boolean;
  draftTitle: string;
  draftDueDate: string;
  editingTodoId: string | null;
  editingTitle: string;
  editingDueDate: string;
  emptyStateCopy: {
    title: string;
    body: string;
  };
  todos: WebsiteTodoItem[];
  todoTitleError: string | null;
  workspace: WebsiteWorkspace | null;
  teamInviteCode: string;
  teamInviteExpiresAt: string | null;
  teamInviteLink: string | null;
  teamInviteMessage: string | null;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftTitleChange: (value: string) => void;
  onDraftDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onCreateTeamInvite: () => void;
  onNavigate: (route: WebsiteRoute) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onStartEdit: (todo: WebsiteTodoItem) => void;
  onCancelEditing: () => void;
  onCopyTeamInviteCode: () => void;
  onCopyTeamInviteLink: () => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleComplete: (todo: WebsiteTodoItem) => void;
}

export interface DashboardPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  personalWorkspace: WebsiteWorkspace | null;
  teamCount: number;
}

export interface TopLevelNavigationProps {
  currentRoute: WebsiteRoute;
  onNavigate: (route: WebsiteRoute) => void;
  personalWorkspace: WebsiteWorkspace | null;
  teams: WebsiteWorkspace[];
}

export interface TeamListPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  teams: WebsiteWorkspace[];
}

export interface JoinTeamPageProps {
  feedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  inviteCode: string;
  isSubmitting: boolean;
  onDismissFeedback: () => void;
  onNavigate: (route: WebsiteRoute) => void;
  onInviteCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  source: "link" | "manual";
}

export interface CreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: WebsiteRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function RouteLink({ children, className, onNavigate, route }: RouteLinkProps) {
  const href = getWebsiteRouteHref(route);

  return (
    <a
      className={className}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {children}
    </a>
  );
}

function isRouteActive(currentRoute: WebsiteRoute, route: WebsiteRoute): boolean {
  if (route.name === "team-list") {
    return currentRoute.name === "team-list" || currentRoute.name === "team-detail";
  }

  if (route.name === "team-detail") {
    return currentRoute.name === "team-detail" && currentRoute.teamId === route.teamId;
  }

  return currentRoute.name === route.name;
}

function getNavLinkClassName(currentRoute: WebsiteRoute, route: WebsiteRoute): string {
  return isRouteActive(currentRoute, route) ? "top-nav__link is-active" : "top-nav__link";
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getWorkspaceBadgeLabel(workspace: WebsiteWorkspace): string {
  return workspace.kind === "team" ? "Team workspace" : "Personal workspace";
}

function getWorkspaceDescription(workspace: WebsiteWorkspace): string {
  return workspace.kind === "team"
    ? "Shared tasks stay in sync for every member of this team workspace."
    : "These tasks belong to your personal workspace and follow your account across clients.";
}

function getComposerPlaceholder(workspace: WebsiteWorkspace | null): string {
  if (!workspace) {
    return "Select a workspace before adding a task";
  }

  return workspace.kind === "team" ? "Add a task for this team" : "Add a task for yourself";
}

export function TopLevelNavigation({
  currentRoute,
  onNavigate,
  personalWorkspace,
  teams,
}: TopLevelNavigationProps) {
  return (
    <nav aria-label="Workspace navigation" className="top-nav">
      <div className="top-nav__header">
        <div>
          <p className="page-eyebrow">Workspace navigation</p>
          <h2>Move between dashboard, your workspace, and team actions.</h2>
        </div>
        <p className="top-nav__body">
          The app now keeps the workspace model route-driven, with joined teams available as
          dedicated destinations.
        </p>
      </div>

      <div className="top-nav__primary" role="list">
        <RouteLink
          className={getNavLinkClassName(currentRoute, { name: "dashboard" })}
          onNavigate={onNavigate}
          route={{ name: "dashboard" }}
        >
          <span>Dashboard</span>
          <strong>Overview and quick entry points</strong>
        </RouteLink>

        <RouteLink
          className={getNavLinkClassName(currentRoute, { name: "personal-workspace" })}
          onNavigate={onNavigate}
          route={{ name: "personal-workspace" }}
        >
          <span>My workspace</span>
          <strong>{personalWorkspace?.name ?? "Personal tasks"}</strong>
        </RouteLink>

        <RouteLink
          className={getNavLinkClassName(currentRoute, { name: "team-list" })}
          onNavigate={onNavigate}
          route={{ name: "team-list" }}
        >
          <span>Joined teams</span>
          <strong>
            {teams.length} team{teams.length === 1 ? "" : "s"}
          </strong>
        </RouteLink>

        <RouteLink
          className={getNavLinkClassName(currentRoute, { name: "join-team" })}
          onNavigate={onNavigate}
          route={{ name: "join-team" }}
        >
          <span>Join team</span>
          <strong>Redeem an invite</strong>
        </RouteLink>

        <RouteLink
          className={getNavLinkClassName(currentRoute, { name: "create-team" })}
          onNavigate={onNavigate}
          route={{ name: "create-team" }}
        >
          <span>Create team</span>
          <strong>Start a shared workspace</strong>
        </RouteLink>
      </div>

      <div className="top-nav__teams">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <p className="top-nav__teams-copy">
            Jump directly into a dedicated team detail page from anywhere in the signed-in flow.
          </p>
        </div>

        {teams.length > 0 ? (
          <div className="top-nav__team-list" role="list">
            {teams.map((team) => (
              <RouteLink
                className={getNavLinkClassName(currentRoute, {
                  name: "team-detail",
                  teamId: team.teamId ?? team.id,
                })}
                key={team.id}
                onNavigate={onNavigate}
                route={{ name: "team-detail", teamId: team.teamId ?? team.id }}
              >
                <span>Team</span>
                <strong>{team.name}</strong>
              </RouteLink>
            ))}
          </div>
        ) : (
          <p className="top-nav__empty">No joined teams yet. Create one or accept an invite.</p>
        )}
      </div>
    </nav>
  );
}

function TodoRow({
  todo,
  disabled,
  onDelete,
  onStartEdit,
  onToggleComplete,
}: {
  todo: WebsiteTodoItem;
  disabled: boolean;
  onDelete: (todoId: string) => void;
  onStartEdit: (todo: WebsiteTodoItem) => void;
  onToggleComplete: (todo: WebsiteTodoItem) => void;
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

export function AuthPage({
  authMode,
  email,
  password,
  fieldErrors,
  isLoading,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthPageProps) {
  return (
    <section className="auth-panel auth-panel--page">
      <div>
        <p className="auth-panel__eyebrow">Sign in</p>
        <h3>
          {authMode === "sign-up"
            ? "Create an account for synced todos."
            : "Authenticate before accessing your tasks."}
        </h3>
        <p className="auth-panel__body">
          {authMode === "sign-up"
            ? "Create a Supabase-backed account with email and password. If email confirmation is enabled, confirm first and then sign in."
            : "Use a Supabase account configured for this project. Session restore will keep you signed in on reload."}
        </p>
      </div>

      <div className="auth-mode-toggle">
        <button
          className={authMode === "sign-in" ? "is-active" : ""}
          onClick={() => onAuthModeChange("sign-in")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={authMode === "sign-up" ? "is-active" : ""}
          onClick={() => onAuthModeChange("sign-up")}
          type="button"
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            onChange={(event) => onEmailChange(event.currentTarget.value)}
            placeholder="user@example.com"
            type="email"
            value={email}
          />
          {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            onChange={(event) => onPasswordChange(event.currentTarget.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
          {fieldErrors.password ? (
            <small className="field-error">{fieldErrors.password}</small>
          ) : null}
        </label>

        <button disabled={isLoading} type="submit">
          {isLoading
            ? authMode === "sign-up"
              ? "Creating account..."
              : "Signing in..."
            : authMode === "sign-up"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </section>
  );
}

export function DashboardPage({ onNavigate, personalWorkspace, teamCount }: DashboardPageProps) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h2>Keep your workspaces moving from one place.</h2>
          <p className="dashboard-hero__body">
            The web client now lands on a dedicated dashboard instead of a persistent two-column
            shell, so each destination can have its own page shape.
          </p>
        </div>

        <div className="dashboard-stats" role="list">
          <div className="dashboard-stat" role="listitem">
            <span>My workspace</span>
            <strong>{personalWorkspace?.name ?? "Ready"}</strong>
          </div>
          <div className="dashboard-stat" role="listitem">
            <span>Joined teams</span>
            <strong>{teamCount}</strong>
          </div>
          <div className="dashboard-stat" role="listitem">
            <span>Next focus</span>
            <strong>Join and create flows</strong>
          </div>
        </div>
      </section>

      <section className="page-grid">
        <RouteLink
          className="route-card route-card--feature"
          onNavigate={onNavigate}
          route={{ name: "personal-workspace" }}
        >
          <p className="page-eyebrow">My workspace</p>
          <h3>{personalWorkspace?.name ?? "Personal workspace"}</h3>
          <p>Open your personal task list as its own focused page.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "team-list" }}>
          <p className="page-eyebrow">Teams</p>
          <h3>
            {teamCount} joined team{teamCount === 1 ? "" : "s"}
          </h3>
          <p>Browse current memberships and jump to a dedicated team detail page.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "join-team" }}>
          <p className="page-eyebrow">Join team</p>
          <h3>Accept an invite</h3>
          <p>Use a dedicated join surface instead of layering flows into one workspace screen.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "create-team" }}>
          <p className="page-eyebrow">Create team</p>
          <h3>Start a shared workspace</h3>
          <p>Create a team from its own page and continue into the resulting detail view.</p>
        </RouteLink>
      </section>
    </>
  );
}

export function WorkspacePage({
  canManageTodos,
  draftTitle,
  draftDueDate,
  editingTodoId,
  editingTitle,
  editingDueDate,
  emptyStateCopy,
  todos,
  todoTitleError,
  workspace,
  teamInviteCode,
  teamInviteExpiresAt,
  teamInviteLink,
  teamInviteMessage,
  onCreateSubmit,
  onDraftTitleChange,
  onDraftDueDateChange,
  onEditTitleChange,
  onEditDueDateChange,
  onCreateTeamInvite,
  onNavigate,
  onSaveEdit,
  onStartEdit,
  onCancelEditing,
  onCopyTeamInviteCode,
  onCopyTeamInviteLink,
  onDeleteTodo,
  onToggleComplete,
}: WorkspacePageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">
            {workspace?.kind === "team" ? "Team detail" : "My workspace"}
          </p>
          <h2>{workspace?.name ?? "Workspace unavailable"}</h2>
          <p>
            {workspace
              ? getWorkspaceDescription(workspace)
              : "We could not resolve the workspace from the current route."}
          </p>
        </div>
        <div className="page-intro__actions">
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </RouteLink>
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={workspace?.kind === "team" ? { name: "team-list" } : { name: "create-team" }}
          >
            {workspace?.kind === "team" ? "All teams" : "Create team"}
          </RouteLink>
        </div>
      </section>

      <section className="workspace-summary">
        {workspace ? (
          <div className="workspace-summary__meta">
            <span className={`workspace-badge workspace-badge--${workspace.kind}`}>
              {getWorkspaceBadgeLabel(workspace)}
            </span>
            <span className="workspace-switcher__hint">
              {workspace.kind === "team"
                ? "Create, edit, complete, and delete actions apply to this shared team list."
                : "Create, edit, complete, and delete actions stay scoped to your personal list."}
            </span>
          </div>
        ) : null}
      </section>

      {workspace?.kind === "team" ? (
        <section className="invite-panel">
          <div className="invite-panel__header">
            <div>
              <p className="page-eyebrow">Invite teammates</p>
              <h3>Generate a reusable invite for {workspace.name}.</h3>
              <p className="invite-panel__body">
                This invite uses the current database policy path and defaults to a 7-day expiry.
              </p>
            </div>
            <button disabled={!canManageTodos} onClick={onCreateTeamInvite} type="button">
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
                  <button onClick={onCopyTeamInviteCode} type="button">
                    Copy code
                  </button>
                </div>
              </label>

              {teamInviteLink ? (
                <label className="composer__field">
                  <span>Join link</span>
                  <div className="inline-copy-field">
                    <input readOnly value={teamInviteLink} />
                    <button onClick={onCopyTeamInviteLink} type="button">
                      Copy link
                    </button>
                  </div>
                </label>
              ) : null}

              {teamInviteExpiresAt ? (
                <p className="invite-panel__meta">
                  Invite expires {formatDateTime(teamInviteExpiresAt)}.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <form className="composer" onSubmit={onCreateSubmit}>
        <label className="composer__field">
          <span>New task</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTitleChange(event.currentTarget.value)}
            placeholder={getComposerPlaceholder(workspace)}
            value={draftTitle}
          />
        </label>

        <label className="composer__field composer__field--date">
          <span>Due date</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftDueDateChange(event.currentTarget.value)}
            type="date"
            value={draftDueDate}
          />
        </label>

        <button disabled={!canManageTodos} type="submit">
          Add task
        </button>
      </form>

      {todoTitleError ? <p className="field-error field-error--spaced">{todoTitleError}</p> : null}

      {editingTodoId ? (
        <form className="editor" onSubmit={onSaveEdit}>
          <label className="composer__field">
            <span>Edit task</span>
            <input
              disabled={!canManageTodos}
              onChange={(event) => onEditTitleChange(event.currentTarget.value)}
              value={editingTitle}
            />
          </label>

          <label className="composer__field">
            <span>Due date</span>
            <input
              disabled={!canManageTodos}
              onChange={(event) => onEditDueDateChange(event.currentTarget.value)}
              type="date"
              value={editingDueDate}
            />
          </label>

          <div className="editor__actions">
            <button disabled={!canManageTodos} type="submit">
              Save
            </button>
            <button disabled={!canManageTodos} onClick={onCancelEditing} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {todos.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">
            {workspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
          </p>
          <h3>{emptyStateCopy.title}</h3>
          <p>{emptyStateCopy.body}</p>
        </section>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoRow
              disabled={!canManageTodos}
              key={todo.id}
              onDelete={onDeleteTodo}
              onStartEdit={onStartEdit}
              onToggleComplete={onToggleComplete}
              todo={todo}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export function TeamListPage({ onNavigate, teams }: TeamListPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <h2>Team workspaces</h2>
          <p>Open each shared workspace from its own URL-backed detail page.</p>
        </div>
        <div className="page-intro__actions">
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </RouteLink>
          <RouteLink
            className="button-link"
            onNavigate={onNavigate}
            route={{ name: "create-team" }}
          >
            Create team
          </RouteLink>
        </div>
      </section>

      {teams.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No joined teams yet</p>
          <h3>Your teams will appear here.</h3>
          <p>Create a team or redeem an invite to populate this list.</p>
        </section>
      ) : (
        <section className="page-grid">
          {teams.map((workspace) => (
            <RouteLink
              className="route-card"
              key={workspace.id}
              onNavigate={onNavigate}
              route={{ name: "team-detail", teamId: workspace.teamId ?? workspace.id }}
            >
              <p className="page-eyebrow">Team detail</p>
              <h3>{workspace.name}</h3>
              <p>Open the dedicated page for this shared workspace.</p>
            </RouteLink>
          ))}
        </section>
      )}
    </>
  );
}

export function JoinTeamPage({
  feedback,
  inviteCode,
  isSubmitting,
  onDismissFeedback,
  onNavigate,
  onInviteCodeChange,
  onSubmit,
  source,
}: JoinTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Join team</p>
          <h2>Join a shared workspace with an invite.</h2>
          <p>
            Open a shared invite link or paste the invite code directly. After a successful join, we
            will take you straight into the team detail page.
          </p>
        </div>
        <div className="page-intro__actions">
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </RouteLink>
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </RouteLink>
        </div>
      </section>

      <section className="join-team-layout">
        <form className="join-team-panel" onSubmit={onSubmit}>
          <div>
            <p className="page-eyebrow">
              {source === "link" ? "Invite link opened" : "Invite code"}
            </p>
            <h3>
              {source === "link"
                ? "We prefilled the invite for you."
                : "Paste an invite to continue."}
            </h3>
            <p className="join-team-panel__body">
              Invite acceptance stays in the authenticated flow so the shared workspace appears in
              your dashboard and team navigation as soon as membership is granted.
            </p>
          </div>

          {feedback ? (
            <div
              className={`feedback-banner ${feedback.kind === "notice" ? "is-notice" : "is-error"}`}
            >
              <p>{feedback.message}</p>
              <button onClick={onDismissFeedback} type="button">
                Dismiss
              </button>
            </div>
          ) : null}

          <label className="join-team-panel__field">
            <span>Invite code</span>
            <input
              autoCapitalize="none"
              autoCorrect="off"
              name="inviteCode"
              onChange={(event) => onInviteCodeChange(event.currentTarget.value)}
              placeholder="Paste invite code"
              value={inviteCode}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Joining team..." : "Join team"}
          </button>
        </form>

        <section className="join-team-aside">
          <p className="page-eyebrow">What happens next</p>
          <h3>Membership sync keeps the workspace list current.</h3>
          <p>
            The join action redeems the invite, refreshes your joined teams, and lands you in the
            target team workspace while keeping your personal workspace available in navigation.
          </p>
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Browse current teams
          </RouteLink>
        </section>
      </section>
    </>
  );
}

export function CreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: CreateTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Create team</p>
          <h2>Start a shared workspace from its own page.</h2>
          <p>
            Successful creation will send you straight to the new team detail route to keep the
            workspace model URL-driven.
          </p>
        </div>
        <div className="page-intro__actions">
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </RouteLink>
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </RouteLink>
        </div>
      </section>

      <form className="standalone-form" onSubmit={onSubmit}>
        <label className="composer__field">
          <span>Team name</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTeamNameChange(event.currentTarget.value)}
            placeholder="Product Ops"
            value={draftTeamName}
          />
        </label>

        <button disabled={!canManageTodos} type="submit">
          Create team
        </button>
      </form>
    </>
  );
}
