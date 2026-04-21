import type { FormEvent, ReactNode } from "react";

import type { DesktopRoute } from "./routes.ts";

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
  activeDateViewLabel: string;
  activeTaskFilterLabel: string;
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
          <p className="empty-state__eyebrow">Dashboard</p>
          <h3>Keep my workspace and team flows moving from one place.</h3>
          <p>
            Desktop now opens into dashboard first, with direct entry points to my workspace, joined
            teams, join team, and create team instead of pushing every flow into one combined
            signed-in screen.
          </p>
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

      <section className="dashboard-grid">
        {actions.map((action) => (
          <button
            className="dashboard-card"
            key={action.eyebrow}
            onClick={() => onNavigate(action.route)}
            type="button"
          >
            <p className="empty-state__eyebrow">{action.eyebrow}</p>
            <h3>{action.title}</h3>
            <p>{action.body}</p>
          </button>
        ))}
      </section>

      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">Joined teams</p>
          <h3>Quick team entry points stay visible from dashboard.</h3>
          <p>
            Open a dedicated team detail destination directly from dashboard without changing the
            shared workspace-first model underneath.
          </p>
        </div>

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
          ) : (
            <div className="workspace-switcher__meta">
              <span className="workspace-badge workspace-badge--team">Joined teams</span>
              <span className="workspace-switcher__hint">{teamEmptyState}</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function DesktopTeamListPage({ onNavigate, teams }: DesktopTeamListPageProps) {
  return (
    <>
      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">Joined teams</p>
          <h3>Team workspaces</h3>
          <p>Open each shared workspace from its own desktop team detail destination.</p>
        </div>

        <div className="workspace-switcher__controls">
          <div className="workspace-switcher__meta">
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
              route={{ name: "join-team" }}
            >
              Join team
            </DesktopActionLink>
            <DesktopActionLink
              className="button-link"
              onNavigate={onNavigate}
              route={{ name: "create-team" }}
            >
              Create team
            </DesktopActionLink>
          </div>
        </div>
      </section>

      {teams.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No joined teams yet</p>
          <h3>Your teams will appear here.</h3>
          <p>Create a team or redeem an invite to populate this list.</p>
        </section>
      ) : (
        <section className="dashboard-grid">
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
      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">Join team</p>
          <h3>Join a shared workspace with an invite.</h3>
          <p>
            Paste an invite code or a dashboard invite link. After a successful join, desktop takes
            you straight into the dedicated team detail destination.
          </p>
        </div>

        <div className="workspace-switcher__controls">
          <div className="workspace-switcher__meta">
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
              Joined teams
            </DesktopActionLink>
          </div>
        </div>
      </section>

      <section className="team-join-panel">
        <div className="team-join-panel__copy">
          <p className="workspace-switcher__eyebrow">Invite code</p>
          <h3>Paste an invite to continue.</h3>
          <p>
            Invite acceptance stays in the signed-in flow so the team appears in dashboard and
            joined teams as soon as membership is granted.
          </p>
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
            <p className="team-join-panel__hint">
              Failed joins never reveal private team details. You will only see whether the invite
              can be used for your account.
            </p>
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
      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">Create team</p>
          <h3>Start a shared workspace from its own page.</h3>
          <p>
            Successful creation sends you straight to the new team detail destination while keeping
            dashboard and my workspace available from navigation.
          </p>
        </div>

        <div className="workspace-switcher__controls">
          <div className="workspace-switcher__meta">
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
              Joined teams
            </DesktopActionLink>
          </div>
        </div>
      </section>

      <form className="workspace-switcher__create" onSubmit={onSubmit}>
        <label className="workspace-switcher__field">
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
  activeDateViewLabel,
  activeTaskFilterLabel,
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
  return (
    <>
      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">{introEyebrow}</p>
          <h3>{introTitle}</h3>
          <p>{introBody}</p>
        </div>

        <div className="workspace-switcher__controls">
          <div className="workspace-switcher__meta">
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
              {workspace?.kind === "team" ? "Joined teams" : "Create team"}
            </DesktopActionLink>
            {workspace?.kind !== "team" ? (
              <DesktopActionLink
                className="button-link button-link--muted"
                onNavigate={onNavigate}
                route={{ name: "join-team" }}
              >
                Join team
              </DesktopActionLink>
            ) : null}
          </div>
        </div>
      </section>

      {workspace ? (
        <section className="workspace-switcher">
          <div className="workspace-switcher__copy">
            <p className="workspace-switcher__eyebrow">Workspace summary</p>
            <h3>{workspace.name}</h3>
            <p>
              {workspace.kind === "team"
                ? "Create, edit, complete, and delete actions apply to this shared team list."
                : "Create, edit, complete, and delete actions stay scoped to your personal list."}
            </p>
          </div>

          <div className="workspace-switcher__controls">
            <div className="workspace-switcher__meta">
              <span className={`workspace-badge workspace-badge--${workspace.kind}`}>
                {workspace.kind === "team" ? "Team workspace" : "Personal workspace"}
              </span>
              <span className="workspace-switcher__hint">
                Date-based views only include tasks that already have a due date.
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {invitePanel}

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

      {todoTitleError ? <p className="field-error field-error--spaced">{todoTitleError}</p> : null}

      {taskControls}
      {dateControls}
      {selectedDatePanel}
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

      <section className="workspace-switcher">
        <div className="workspace-switcher__copy">
          <p className="workspace-switcher__eyebrow">Current filters</p>
          <h3>
            {activeTaskFilterLabel} and {activeDateViewLabel}
          </h3>
          <p>
            This workspace keeps route state explicit and page-local filters in React state, just
            like the current desktop change requires.
          </p>
        </div>
      </section>
    </>
  );
}
