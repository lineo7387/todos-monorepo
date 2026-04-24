import type { FormEvent, ReactNode } from "react";

import type {
  WorkspaceDateView,
  WorkspaceTaskFilter,
  WorkspaceShellRoute,
  WorkspaceShellTeamSection,
  WorkspaceShellWorkspaceSection,
} from "./index.ts";
import { getWorkspaceShellResource } from "./index.ts";
import { WorkspaceShellCreateTeamPage } from "./create-team-page.tsx";
import { WorkspaceShellDashboardPage } from "./dashboard-page.tsx";
import {
  WorkspaceShellJoinTeamPage,
  type WorkspaceShellJoinTeamFeedback,
} from "./join-team-page.tsx";
import { WorkspaceShellRouteCard } from "./route-card.tsx";
import { WorkspaceShellTaskComposer } from "./task-composer.tsx";
import { WorkspaceShellTeamListPage } from "./team-list-page.tsx";
import { WorkspaceShellTodoEditor } from "./todo-editor.tsx";
import { WorkspaceShellTodoRow, type WorkspaceShellTodoRowTodo } from "./todo-row.tsx";
import {
  WorkspaceShellWorkspaceHeader,
  type WorkspaceShellHeaderWorkspace,
} from "./workspace-header.tsx";

export interface RenderWorkspaceShellRouteActionInput<TRoute> {
  children: ReactNode;
  className?: string;
  key: string;
  route: TRoute;
}

export interface WorkspaceShellSignedInTeam<TRoute> {
  id: string;
  name: string;
  route: TRoute;
}

export interface WorkspaceShellSignedInDashboardPageProps<TRoute> {
  locale?: string | null;
  personalWorkspaceName: string | null;
  renderRouteAction: (input: RenderWorkspaceShellRouteActionInput<TRoute>) => ReactNode;
  routes: {
    createTeam: TRoute;
    joinTeam: TRoute;
    personalWorkspace: TRoute;
    teamList: TRoute;
  };
  teamCount: number;
}

export function WorkspaceShellSignedInDashboardPage<TRoute>({
  locale,
  personalWorkspaceName,
  renderRouteAction,
  routes,
  teamCount,
}: WorkspaceShellSignedInDashboardPageProps<TRoute>) {
  const resource = getWorkspaceShellResource(locale);
  const joinedTeamsTitleTemplate = resource.pages.dashboard.actions.teamListTitle;
  const actions = [
    {
      body: resource.pages.dashboard.actions.personalWorkspaceBody,
      eyebrow: resource.destinations.personalWorkspace.label,
      route: routes.personalWorkspace,
      title:
        personalWorkspaceName ?? resource.pages.dashboard.actions.personalWorkspaceFallbackTitle,
    },
    {
      body: resource.pages.dashboard.actions.teamListBody,
      eyebrow: resource.navigation.joinedTeams,
      route: routes.teamList,
      title: joinedTeamsTitleTemplate
        .replace("{{count}}", String(teamCount))
        .replace("{{plural}}", teamCount === 1 ? "" : "s"),
    },
    {
      body: resource.pages.dashboard.actions.joinTeamBody,
      eyebrow: resource.destinations.joinTeam.label,
      route: routes.joinTeam,
      title: resource.pages.dashboard.actions.joinTeamTitle,
    },
    {
      body: resource.pages.dashboard.actions.createTeamBody,
      eyebrow: resource.destinations.createTeam.label,
      route: routes.createTeam,
      title: resource.pages.dashboard.actions.createTeamTitle,
    },
  ];
  const stats = [
    {
      label: resource.destinations.personalWorkspace.label,
      value: personalWorkspaceName ?? resource.pages.dashboard.stats.personalWorkspaceFallback,
    },
    {
      label: resource.navigation.joinedTeams,
      value: String(teamCount),
    },
    {
      label: resource.pages.dashboard.stats.nextFocusLabel,
      value: resource.pages.dashboard.stats.nextFocusValue,
    },
  ];

  return (
    <WorkspaceShellDashboardPage
      actions={actions as never}
      heroBody={resource.pages.dashboard.heroBody}
      renderActionCard={(action) =>
        renderRouteAction({
          children: (
            <WorkspaceShellRouteCard
              body={action.body}
              eyebrow={action.eyebrow}
              title={action.title}
            />
          ),
          className: `route-card ${action.route === routes.personalWorkspace ? "route-card--feature" : ""}`,
          key: action.eyebrow,
          route: action.route as TRoute,
        })
      }
      stats={stats}
    />
  );
}

export interface WorkspaceShellSignedInTeamListPageProps<TRoute> {
  locale?: string | null;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  renderRouteAction: (input: RenderWorkspaceShellRouteActionInput<TRoute>) => ReactNode;
  teams: WorkspaceShellSignedInTeam<TRoute>[];
}

export function WorkspaceShellSignedInTeamListPage<TRoute>({
  locale,
  renderNavigationAction,
  renderRouteAction,
  teams,
}: WorkspaceShellSignedInTeamListPageProps<TRoute>) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <WorkspaceShellTeamListPage
      emptyStateBody={resource.pages.teamList.emptyBody}
      emptyStateEyebrow={resource.pages.teamList.emptyEyebrow}
      emptyStateTitle={resource.pages.teamList.emptyTitle}
      renderNavigationAction={renderNavigationAction}
      renderTeamCard={(team) =>
        renderRouteAction({
          children: (
            <WorkspaceShellRouteCard
              body={resource.pages.teamList.teamCardBody}
              eyebrow={resource.destinations.teamDetail.label}
              title={team.name}
            />
          ),
          className: "route-card",
          key: team.id,
          route: team.route as TRoute,
        })
      }
      teams={teams as Array<WorkspaceShellSignedInTeam<WorkspaceShellRoute>>}
      teamListBody={resource.pages.teamList.body}
    />
  );
}

export interface WorkspaceShellSignedInJoinTeamPageProps<TRoute> {
  feedback: WorkspaceShellJoinTeamFeedback | null;
  inputValue: string;
  isSubmitting: boolean;
  locale?: string | null;
  onDismissFeedback: () => void;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  renderRouteAction?: (input: RenderWorkspaceShellRouteActionInput<TRoute>) => ReactNode;
  source?: "link" | "manual";
  teamListRoute?: TRoute;
}

export function WorkspaceShellSignedInJoinTeamPage<TRoute>({
  feedback,
  inputValue,
  isSubmitting,
  locale,
  onDismissFeedback,
  onInputChange,
  onSubmit,
  renderNavigationAction,
  renderRouteAction,
  source = "manual",
  teamListRoute,
}: WorkspaceShellSignedInJoinTeamPageProps<TRoute>) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <WorkspaceShellJoinTeamPage
      feedback={feedback}
      heroBody={resource.pages.joinTeam.heroBody}
      inputValue={inputValue}
      inviteBody={resource.pages.joinTeam.inviteBody}
      inviteEyebrow={
        source === "link"
          ? resource.pages.joinTeam.inviteEyebrowLink
          : resource.pages.joinTeam.inviteEyebrowManual
      }
      inviteHeading={
        source === "link"
          ? resource.pages.joinTeam.inviteHeadingLink
          : resource.pages.joinTeam.inviteHeadingManual
      }
      isSubmitting={isSubmitting}
      locale={locale}
      onDismissFeedback={onDismissFeedback}
      onInputChange={onInputChange}
      onSubmit={onSubmit}
      renderNavigationAction={renderNavigationAction}
      trailingContent={
        renderRouteAction && teamListRoute ? (
          <section className="join-team-aside">
            <p className="page-eyebrow">{resource.pages.joinTeam.nextEyebrow}</p>
            <h3>{resource.pages.joinTeam.nextTitle}</h3>
            <p>{resource.pages.joinTeam.nextBody}</p>
            {renderRouteAction({
              children: resource.pages.joinTeam.browseTeams,
              className: "button-link button-link--muted",
              key: "browse-current-teams",
              route: teamListRoute,
            })}
          </section>
        ) : null
      }
    />
  );
}

export interface WorkspaceShellSignedInCreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  locale?: string | null;
  onDraftTeamNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
}

export function WorkspaceShellSignedInCreateTeamPage({
  canManageTodos,
  draftTeamName,
  locale,
  onDraftTeamNameChange,
  onSubmit,
  renderNavigationAction,
}: WorkspaceShellSignedInCreateTeamPageProps) {
  return (
    <WorkspaceShellCreateTeamPage
      canManageTodos={canManageTodos}
      draftTeamName={draftTeamName}
      locale={locale}
      onDraftTeamNameChange={onDraftTeamNameChange}
      onSubmit={onSubmit}
      renderNavigationAction={renderNavigationAction}
    />
  );
}

export interface WorkspaceShellSectionRoute<TRoute> {
  isActive: boolean;
  label: string;
  route: TRoute;
}

export interface WorkspaceShellSelectedDateTodo {
  completed: boolean;
  dueDate: string | null;
  id: string;
  title: string;
}

export interface WorkspaceShellTeamInvitePanelState {
  code: string;
  expiresAt: string | null;
  link: string | null;
  message: string | null;
  onCopyCode?: () => void;
  onCopyLink?: () => void;
  onCreateInvite: () => void;
}

export interface WorkspaceShellSignedInWorkspacePageProps<
  TRoute,
  TTodo extends WorkspaceShellTodoRowTodo,
  TSelectedTodo extends WorkspaceShellSelectedDateTodo,
> {
  canManageTodos: boolean;
  composerPlaceholder: string;
  dateView: WorkspaceDateView;
  dateViewCounts: Record<WorkspaceDateView, number>;
  draftDueDate: string;
  draftTitle: string;
  editingDueDate: string;
  editingTitle: string;
  editingTodoId: string | null;
  emptyStateCopy: {
    body: string;
    title: string;
  };
  hasAnyTodos: boolean;
  layout: "combined" | "sectioned";
  locale?: string | null;
  onCancelEditing: () => void;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDateViewChange: (view: WorkspaceDateView) => void;
  onDeleteTodo: (todoId: string) => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: TTodo) => void;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  onToggleComplete: (todo: TTodo) => void;
  onSectionNavigate?: (route: TRoute) => void;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  renderSelectedDateAction?: (todo: TSelectedTodo) => ReactNode;
  routeTitle: string;
  section: WorkspaceShellWorkspaceSection | WorkspaceShellTeamSection;
  sectionRoutes?: WorkspaceShellSectionRoute<TRoute>[];
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: TSelectedTodo[];
  taskCounts: Record<WorkspaceTaskFilter, number>;
  taskFilter: WorkspaceTaskFilter;
  teamInvite?: WorkspaceShellTeamInvitePanelState | null;
  todos: TTodo[];
  todoTitleError: string | null;
  workspace: WorkspaceShellHeaderWorkspace | null;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getTaskFilterLabel(filter: WorkspaceTaskFilter): string {
  switch (filter) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    default:
      return "All";
  }
}

function getDateViewLabel(view: WorkspaceDateView): string {
  switch (view) {
    case "due-today":
      return "Due today";
    case "upcoming":
      return "Upcoming";
    default:
      return "All tasks";
  }
}

function getWorkspaceIntroBody(workspace: WorkspaceShellHeaderWorkspace | null): string {
  if (!workspace) {
    return "We could not resolve the workspace from the current route.";
  }

  return workspace.kind === "team"
    ? "Shared tasks stay in sync for every member of this team workspace."
    : "These tasks belong to your personal workspace and follow your account across clients.";
}

function renderWorkspaceEmptyState(
  activeDateViewLabel: string,
  activeTaskFilterLabel: string,
  emptyStateCopy: {
    body: string;
    title: string;
  },
  hasAnyTodos: boolean,
  workspace: WorkspaceShellHeaderWorkspace | null,
  todosLength: number,
) {
  if (!hasAnyTodos) {
    return (
      <section className="empty-state">
        <p className="empty-state__eyebrow">
          {workspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
        </p>
        <h3>{emptyStateCopy.title}</h3>
        <p>{emptyStateCopy.body}</p>
      </section>
    );
  }

  if (todosLength === 0) {
    return (
      <section className="empty-state">
        <p className="empty-state__eyebrow">No matching tasks</p>
        <h3>
          {activeTaskFilterLabel} tasks in {activeDateViewLabel.toLowerCase()} are clear right now.
        </h3>
        <p>
          Switch task filters or date views to review the rest of this workspace. Date-based views
          only include tasks that already have a due date.
        </p>
      </section>
    );
  }

  return null;
}

function WorkspaceShellSectionNavigation<TRoute>({
  onNavigate,
  routes,
}: {
  onNavigate: (route: TRoute) => void;
  routes: WorkspaceShellSectionRoute<TRoute>[];
}) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <section className="workspace-subnav" aria-label="Workspace sections">
      {routes.map((entry) => (
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
  );
}

function WorkspaceShellTaskFilterPanel({
  canManageTodos,
  onTaskFilterChange,
  taskCounts,
  taskFilter,
  todoCount,
}: {
  canManageTodos: boolean;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  taskCounts: Record<WorkspaceTaskFilter, number>;
  taskFilter: WorkspaceTaskFilter;
  todoCount: number;
}) {
  return (
    <section className="task-filter-panel" aria-label="Task filters">
      <div>
        <p className="page-eyebrow">Task filter</p>
        <h3>Focus this workspace by status.</h3>
        <p>
          Narrow this workspace to all, active, or completed tasks without changing shared state.
        </p>
      </div>
      <div className="task-filter-group" aria-label="Filter tasks by status" role="tablist">
        {(["all", "active", "completed"] as const).map((filter) => (
          <button
            aria-selected={taskFilter === filter}
            className={`task-filter-chip ${taskFilter === filter ? "is-active" : ""}`}
            disabled={!canManageTodos && todoCount === 0}
            key={filter}
            onClick={() => onTaskFilterChange(filter)}
            role="tab"
            type="button"
          >
            <span>{getTaskFilterLabel(filter)}</span>
            <strong>{taskCounts[filter]}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkspaceShellDateViewPanel({
  canManageTodos,
  dateView,
  dateViewCounts,
  onDateViewChange,
  todoCount,
}: {
  canManageTodos: boolean;
  dateView: WorkspaceDateView;
  dateViewCounts: Record<WorkspaceDateView, number>;
  onDateViewChange: (view: WorkspaceDateView) => void;
  todoCount: number;
}) {
  return (
    <section className="task-filter-panel" aria-label="Date views">
      <div>
        <p className="page-eyebrow">Date view</p>
        <h3>Browse dated tasks without turning this into a full calendar.</h3>
        <p>Only tasks with a due date appear in date-based views for this workspace.</p>
      </div>
      <div className="task-filter-group" aria-label="Filter tasks by due date" role="tablist">
        {(["all", "due-today", "upcoming"] as const).map((view) => (
          <button
            aria-selected={dateView === view}
            className={`task-filter-chip ${dateView === view ? "is-active" : ""}`}
            disabled={!canManageTodos && todoCount === 0}
            key={view}
            onClick={() => onDateViewChange(view)}
            role="tab"
            type="button"
          >
            <span>{getDateViewLabel(view)}</span>
            <strong>{dateViewCounts[view]}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkspaceShellSelectedDatePanel<TTodo extends WorkspaceShellSelectedDateTodo>({
  onSelectedDateChange,
  renderSelectedDateAction,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  taskFilter,
}: {
  onSelectedDateChange: (value: string) => void;
  renderSelectedDateAction?: (todo: TTodo) => ReactNode;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: TTodo[];
  taskFilter: WorkspaceTaskFilter;
}) {
  return (
    <section className="selected-date-panel" aria-label="Selected date inspection">
      <div className="selected-date-panel__header">
        <div>
          <p className="page-eyebrow">Selected day</p>
          <h3>Inspect one day without opening a full calendar.</h3>
          <p className="selected-date-panel__body">
            View tasks due on {selectedDateLabel} for this workspace. This day view follows the
            current {getTaskFilterLabel(taskFilter).toLowerCase()} filter and only includes tasks
            that already have a due date.
          </p>
        </div>

        <label className="composer__field selected-date-panel__field">
          <span>Selected date</span>
          <input
            onChange={(event) => onSelectedDateChange(event.currentTarget.value)}
            type="date"
            value={selectedDate}
          />
        </label>
      </div>

      <div className="selected-date-panel__summary">
        <span>
          {selectedDateTodos.length} task{selectedDateTodos.length === 1 ? "" : "s"}
        </span>
        <strong>{selectedDateLabel}</strong>
      </div>

      {selectedDateTodos.length === 0 ? (
        <p className="selected-date-panel__empty">
          No {getTaskFilterLabel(taskFilter).toLowerCase()} tasks are due on this day.
        </p>
      ) : (
        <ul className="selected-date-list">
          {selectedDateTodos.map((todo) => (
            <li className="selected-date-list__item" key={todo.id}>
              <div>
                <p>{todo.title}</p>
                <span>
                  {todo.completed ? "Completed" : "Active"}
                  {todo.dueDate ? `, due ${formatDueDate(todo.dueDate)}` : ""}
                </span>
              </div>
              {renderSelectedDateAction ? renderSelectedDateAction(todo) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WorkspaceShellTeamInvitePanel({
  canManageTodos,
  invite,
  workspaceName,
}: {
  canManageTodos: boolean;
  invite: WorkspaceShellTeamInvitePanelState;
  workspaceName: string;
}) {
  return (
    <section className="invite-panel">
      <div className="invite-panel__header">
        <div>
          <p className="page-eyebrow">Invite teammates</p>
          <h3>Generate a reusable invite for {workspaceName}.</h3>
          <p className="invite-panel__body">
            Create a reusable invite for this team workspace without leaving the shared signed-in
            flow.
          </p>
        </div>
        <button disabled={!canManageTodos} onClick={invite.onCreateInvite} type="button">
          Create invite
        </button>
      </div>

      {invite.message ? <p className="info-banner info-banner--embed">{invite.message}</p> : null}

      {invite.code ? (
        <div className="invite-results">
          <label className="composer__field">
            <span>Invite code</span>
            <div className="inline-copy-field">
              <input readOnly value={invite.code} />
              {invite.onCopyCode ? (
                <button onClick={invite.onCopyCode} type="button">
                  Copy code
                </button>
              ) : null}
            </div>
          </label>

          {invite.link ? (
            <label className="composer__field">
              <span>Join link</span>
              <div className="inline-copy-field">
                <input readOnly value={invite.link} />
                {invite.onCopyLink ? (
                  <button onClick={invite.onCopyLink} type="button">
                    Copy link
                  </button>
                ) : null}
              </div>
            </label>
          ) : null}

          <div className="workspace-summary__meta">
            <span className="workspace-badge workspace-badge--team">How to share</span>
            <span className="workspace-switcher__hint">
              Share this code in the join team flow so new members land on the same team detail
              page.
            </span>
          </div>

          {invite.expiresAt ? (
            <p className="invite-panel__meta">Invite expires {formatDateTime(invite.expiresAt)}.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function WorkspaceShellSignedInWorkspacePage<
  TRoute,
  TTodo extends WorkspaceShellTodoRowTodo,
  TSelectedTodo extends WorkspaceShellSelectedDateTodo,
>({
  canManageTodos,
  composerPlaceholder,
  dateView,
  dateViewCounts,
  draftDueDate,
  draftTitle,
  editingDueDate,
  editingTitle,
  editingTodoId,
  emptyStateCopy,
  hasAnyTodos,
  layout,
  locale,
  onCancelEditing,
  onCreateSubmit,
  onDateViewChange,
  onDeleteTodo,
  onDraftDueDateChange,
  onDraftTitleChange,
  onEditDueDateChange,
  onEditTitleChange,
  onSaveEdit,
  onSectionNavigate,
  onSelectedDateChange,
  onStartEdit,
  onTaskFilterChange,
  onToggleComplete,
  renderNavigationAction,
  renderSelectedDateAction,
  routeTitle,
  section,
  sectionRoutes = [],
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  taskCounts,
  taskFilter,
  teamInvite = null,
  todos,
  todoTitleError,
  workspace,
}: WorkspaceShellSignedInWorkspacePageProps<TRoute, TTodo, TSelectedTodo>) {
  const resource = getWorkspaceShellResource(locale);
  const activeSection =
    workspace?.kind === "team"
      ? section === "date" || section === "invite"
        ? section
        : "tasks"
      : section === "date"
        ? "date"
        : "tasks";
  const taskEmptyState = renderWorkspaceEmptyState(
    getDateViewLabel(dateView),
    getTaskFilterLabel(taskFilter),
    emptyStateCopy,
    hasAnyTodos,
    workspace,
    todos.length,
  );
  const todoList =
    todos.length > 0 ? (
      <ul className="todo-list">
        {todos.map((todo) => (
          <WorkspaceShellTodoRow
            disabled={!canManageTodos}
            key={todo.id}
            onDelete={onDeleteTodo}
            onStartEdit={onStartEdit}
            onToggleComplete={onToggleComplete}
            todo={todo}
          />
        ))}
      </ul>
    ) : null;
  const invitePanel =
    teamInvite && workspace?.kind === "team" ? (
      <WorkspaceShellTeamInvitePanel
        canManageTodos={canManageTodos}
        invite={teamInvite}
        workspaceName={workspace.name}
      />
    ) : null;

  return (
    <>
      <WorkspaceShellWorkspaceHeader
        introBody={getWorkspaceIntroBody(workspace)}
        introEyebrow={
          workspace?.kind === "team"
            ? resource.destinations.teamDetail.label
            : resource.destinations.personalWorkspace.label
        }
        introTitle={routeTitle}
        renderNavigationAction={renderNavigationAction}
        workspace={workspace}
      />

      {layout === "sectioned" && sectionRoutes.length > 0 ? (
        <WorkspaceShellSectionNavigation
          onNavigate={onSectionNavigate ?? (() => {})}
          routes={sectionRoutes}
        />
      ) : null}

      {(layout === "combined" || activeSection === "tasks") && invitePanel && layout === "combined"
        ? invitePanel
        : null}

      {layout === "combined" || activeSection === "tasks" ? (
        <>
          <WorkspaceShellTaskComposer
            canManageTodos={canManageTodos}
            composerPlaceholder={composerPlaceholder}
            draftDueDate={draftDueDate}
            draftTitle={draftTitle}
            onCreateSubmit={onCreateSubmit}
            onDraftDueDateChange={onDraftDueDateChange}
            onDraftTitleChange={onDraftTitleChange}
            todoTitleError={todoTitleError}
          />

          {editingTodoId ? (
            <WorkspaceShellTodoEditor
              canManageTodos={canManageTodos}
              editingDueDate={editingDueDate}
              editingTitle={editingTitle}
              onCancelEditing={onCancelEditing}
              onEditDueDateChange={onEditDueDateChange}
              onEditTitleChange={onEditTitleChange}
              onSaveEdit={onSaveEdit}
            />
          ) : null}

          <WorkspaceShellTaskFilterPanel
            canManageTodos={canManageTodos}
            onTaskFilterChange={onTaskFilterChange}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            todoCount={hasAnyTodos ? todos.length : 0}
          />

          {layout === "combined" ? (
            <>
              <WorkspaceShellDateViewPanel
                canManageTodos={canManageTodos}
                dateView={dateView}
                dateViewCounts={dateViewCounts}
                onDateViewChange={onDateViewChange}
                todoCount={hasAnyTodos ? todos.length : 0}
              />
              <WorkspaceShellSelectedDatePanel
                onSelectedDateChange={onSelectedDateChange}
                renderSelectedDateAction={renderSelectedDateAction}
                selectedDate={selectedDate}
                selectedDateLabel={selectedDateLabel}
                selectedDateTodos={selectedDateTodos}
                taskFilter={taskFilter}
              />
            </>
          ) : null}

          {todoList ?? taskEmptyState}
        </>
      ) : null}

      {layout === "sectioned" && activeSection === "date" ? (
        <>
          <WorkspaceShellTaskFilterPanel
            canManageTodos={canManageTodos}
            onTaskFilterChange={onTaskFilterChange}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            todoCount={hasAnyTodos ? todos.length : 0}
          />
          <WorkspaceShellDateViewPanel
            canManageTodos={canManageTodos}
            dateView={dateView}
            dateViewCounts={dateViewCounts}
            onDateViewChange={onDateViewChange}
            todoCount={hasAnyTodos ? todos.length : 0}
          />
          <WorkspaceShellSelectedDatePanel
            onSelectedDateChange={onSelectedDateChange}
            renderSelectedDateAction={renderSelectedDateAction}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateTodos={selectedDateTodos}
            taskFilter={taskFilter}
          />
          {taskEmptyState}
        </>
      ) : null}

      {layout === "sectioned" && activeSection === "invite" ? invitePanel : null}
    </>
  );
}
