import type { FormEvent, ReactNode } from "react";

import {
  isDesktopRouteActive,
  type DesktopRoute,
  type DesktopTeamSection,
  type DesktopWorkspaceSection,
} from "./routes.ts";

interface DesktopActionLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate: (route: DesktopRoute) => void;
  route: DesktopRoute;
}

export interface DesktopDashboardPageProps {
  actions: Array<{
    body: string;
    eyebrow: string;
    route: DesktopRoute;
    title: string;
  }>;
  onNavigate: (route: DesktopRoute) => void;
  stats: Array<{
    label: string;
    value: string;
  }>;
  teamEntries: Array<{
    id: string;
    isActive: boolean;
    route: DesktopRoute;
    title: string;
  }>;
  teamEmptyState: string;
}

export interface DesktopTeamListPageProps {
  onNavigate: (route: DesktopRoute) => void;
  teams: Array<{
    id: string;
    name: string;
    route: DesktopRoute;
  }>;
}

export interface DesktopTopLevelNavigationProps {
  currentRoute: DesktopRoute;
  onNavigate: (route: DesktopRoute) => void;
  personalWorkspace: {
    name: string;
  } | null;
  teams: Array<{
    id: string;
    name: string;
    route: DesktopRoute;
  }>;
}

export interface DesktopJoinTeamPageProps {
  feedback: {
    kind: "error" | "notice" | "success";
    message: string;
  } | null;
  inputValue: string;
  isSubmitting: boolean;
  onInputChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface DesktopCreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface DesktopWorkspacePageProps {
  section: DesktopWorkspaceSection | DesktopTeamSection;
  sectionRoutes: Array<{
    isActive: boolean;
    label: string;
    route: DesktopRoute;
  }>;
  canManageTodos: boolean;
  dateControls: ReactNode;
  emptyState: ReactNode;
  editingForm: ReactNode;
  emptyStateCopy: {
    body: string;
    title: string;
  };
  filteredTodoList: ReactNode;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  invitePanel: ReactNode;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  selectedDatePanel: ReactNode;
  taskControls: ReactNode;
  todoTitleError: string | null;
  workspace: {
    kind: "personal" | "team";
    name: string;
  } | null;
  draftDueDate: string;
  draftTitle: string;
  composerPlaceholder: string;
}

function DesktopActionLink({ children, className, onNavigate, route }: DesktopActionLinkProps) {
  return (
    <button className={className} onClick={() => onNavigate(route)} type="button">
      {children}
    </button>
  );
}

export function DesktopTopLevelNavigation({
  currentRoute,
  onNavigate,
  personalWorkspace,
  teams,
}: DesktopTopLevelNavigationProps) {
  return (
    <nav aria-label="Workspace navigation" className="top-nav">
      <div className="top-nav__primary" role="list">
        {(
          [
            { label: "Dashboard", route: { name: "dashboard" } satisfies DesktopRoute },
            {
              label: "My workspace",
              route: { name: "personal-workspace", section: "tasks" } satisfies DesktopRoute,
            },
            {
              label: "Joined teams",
              route: { name: "team-list" } satisfies DesktopRoute,
            },
            { label: "Join team", route: { name: "join-team" } satisfies DesktopRoute },
            { label: "Create team", route: { name: "create-team" } satisfies DesktopRoute },
          ] as const
        ).map((entry) => (
          <button
            className={`top-nav__link ${isDesktopRouteActive(currentRoute, entry.route) ? "is-active" : ""}`}
            key={entry.label}
            onClick={() => onNavigate(entry.route)}
            role="listitem"
            type="button"
          >
            <strong>{entry.label}</strong>
          </button>
        ))}
      </div>

      {teams.length > 0 ? (
        <div className="top-nav__teams">
          <span className="top-nav__teams-label">
            {personalWorkspace ? personalWorkspace.name : "Teams"}
          </span>
          <div className="top-nav__team-list" role="list">
            {teams.map((team) => (
              <button
                className={`top-nav__link ${isDesktopRouteActive(currentRoute, team.route) ? "is-active" : ""}`}
                key={team.id}
                onClick={() => onNavigate(team.route)}
                role="listitem"
                type="button"
              >
                <strong>{team.name}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

export function DesktopDashboardPage({
  actions,
  onNavigate,
  stats,
  teamEntries,
  teamEmptyState,
}: DesktopDashboardPageProps) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h2>Keep your workspaces moving from one place.</h2>
        </div>

        <div className="dashboard-stats" role="list">
          {stats.map((stat) => (
            <div className="dashboard-stat" key={stat.label} role="listitem">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="page-grid">
        {actions.map((action) => (
          <button
            className="dashboard-card"
            key={action.eyebrow}
            onClick={() => onNavigate(action.route)}
            type="button"
          >
            <p className="empty-state__eyebrow">{action.eyebrow}</p>
            <h3>{action.title}</h3>
          </button>
        ))}
      </section>

      {teamEntries.length > 0 ? (
        <section className="workspace-switcher workspace-switcher--compact">
          <div className="workspace-switcher__controls">
            {teamEntries.length > 0 ? (
              <div className="dashboard-team-list" role="list">
                {teamEntries.map((team) => (
                  <button
                    className={team.isActive ? "is-active" : ""}
                    key={team.id}
                    onClick={() => onNavigate(team.route)}
                    role="listitem"
                    type="button"
                  >
                    {team.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="workspace-summary">
          <div className="workspace-summary__meta">
            <span className="workspace-badge workspace-badge--team">Joined teams</span>
            <span className="workspace-switcher__hint">{teamEmptyState}</span>
          </div>
        </section>
      )}
    </>
  );
}

export function DesktopTeamListPage({ onNavigate, teams }: DesktopTeamListPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <h2>Team workspaces</h2>
          <p>Open each shared workspace from its own desktop team detail destination.</p>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link"
            onNavigate={onNavigate}
            route={{ name: "create-team" }}
          >
            Create team
          </DesktopActionLink>
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
          {teams.map((team) => (
            <button
              className="dashboard-card"
              key={team.id}
              onClick={() => onNavigate(team.route)}
              type="button"
            >
              <p className="empty-state__eyebrow">Team detail</p>
              <h3>{team.name}</h3>
              <p>Open the dedicated desktop page for this shared workspace.</p>
            </button>
          ))}
        </section>
      )}
    </>
  );
}

export function DesktopJoinTeamPage({
  feedback,
  inputValue,
  isSubmitting,
  onInputChange,
  onNavigate,
  onSubmit,
}: DesktopJoinTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Join team</p>
          <h2>Join a shared workspace with an invite.</h2>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </DesktopActionLink>
        </div>
      </section>

      <section className="team-join-panel">
        <div className="team-join-panel__copy">
          <p className="page-eyebrow">Invite code</p>
          <h3>Paste an invite to continue.</h3>
        </div>

        <form className="team-join-panel__controls" onSubmit={onSubmit}>
          <label className="team-join-panel__field">
            <span>Invite code or link</span>
            <input
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isSubmitting}
              onChange={(event) => onInputChange(event.currentTarget.value)}
              placeholder="Paste an invite code or full join link"
              value={inputValue}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Joining team..." : "Join team"}
          </button>

          {feedback ? (
            <div
              className={`team-join-panel__feedback ${
                feedback.kind === "error"
                  ? "is-error"
                  : feedback.kind === "notice"
                    ? "is-notice"
                    : "is-success"
              }`}
            >
              <p>{feedback.message}</p>
            </div>
          ) : (
            <p className="team-join-panel__hint">Failed joins never reveal private team details.</p>
          )}
        </form>
      </section>
    </>
  );
}

export function DesktopCreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: DesktopCreateTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Create team</p>
          <h2>Start a shared workspace from its own page.</h2>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </DesktopActionLink>
        </div>
      </section>

      <form className="standalone-form" onSubmit={onSubmit}>
        <label className="composer__field">
          <span>Team name</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTeamNameChange(event.currentTarget.value)}
            placeholder="Operations"
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

export function DesktopWorkspacePage({
  section,
  sectionRoutes,
  canManageTodos,
  composerPlaceholder,
  dateControls,
  draftDueDate,
  draftTitle,
  editingForm,
  emptyState,
  emptyStateCopy,
  filteredTodoList,
  introBody,
  introEyebrow,
  introTitle,
  invitePanel,
  onCreateSubmit,
  onDraftDueDateChange,
  onDraftTitleChange,
  onNavigate,
  selectedDatePanel,
  taskControls,
  todoTitleError,
  workspace,
}: DesktopWorkspacePageProps) {
  const activeSection =
    workspace?.kind === "team"
      ? section === "date" || section === "invite"
        ? section
        : "tasks"
      : section === "date"
        ? "date"
        : "tasks";

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">{introEyebrow}</p>
          <h2>{introTitle}</h2>
          <p>{introBody}</p>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={workspace?.kind === "team" ? { name: "team-list" } : { name: "create-team" }}
          >
            {workspace?.kind === "team" ? "All teams" : "Create team"}
          </DesktopActionLink>
        </div>
      </section>

      <section className="workspace-subnav" aria-label="Workspace sections">
        {sectionRoutes.map((entry) => (
          <button
            className={entry.isActive ? "is-active" : ""}
            key={entry.label}
            onClick={() => onNavigate(entry.route)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </section>

      {activeSection === "tasks" ? (
        <>
          <form className="composer" onSubmit={onCreateSubmit}>
            <label className="composer__field">
              <span>New task</span>
              <input
                disabled={!canManageTodos}
                onChange={(event) => onDraftTitleChange(event.currentTarget.value)}
                placeholder={composerPlaceholder}
                value={draftTitle}
              />
            </label>

            <label className="composer__field">
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

          {todoTitleError ? (
            <p className="field-error field-error--spaced">{todoTitleError}</p>
          ) : null}

          {taskControls}
          {editingForm}

          {filteredTodoList ?? (
            <section className="empty-state">
              <p className="empty-state__eyebrow">
                {workspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
              </p>
              <h3>{emptyStateCopy.title}</h3>
              <p>{emptyStateCopy.body}</p>
            </section>
          )}

          {emptyState}
        </>
      ) : null}

      {activeSection === "date" ? (
        <>
          {taskControls}
          {dateControls}
          {selectedDatePanel}
          {emptyState}
        </>
      ) : null}

      {activeSection === "invite" ? invitePanel : null}
    </>
  );
}
