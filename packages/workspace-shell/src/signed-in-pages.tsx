import type { FormEvent, ReactNode } from "react";
import { DayPicker } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type {
  WorkspaceShellResources,
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
      eyebrow={resource.destinations.dashboard.label}
      heroBody={resource.pages.dashboard.heroBody}
      heading={resource.pages.dashboard.heading}
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
      locale={locale}
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

export interface WorkspaceShellSelectedDateTodo extends WorkspaceShellTodoRowTodo {}

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
  TSelectedTodo extends TTodo,
> {
  canManageTodos: boolean;
  composerPlaceholder: string;
  dateView: WorkspaceDateView;
  dateViewCounts: Record<WorkspaceDateView, number>;
  markedDates?: string[];
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

function parseDateValueAsLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatLocalDateValue(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTaskFilterLabel(
  filter: WorkspaceTaskFilter,
  resource: WorkspaceShellResources,
): string {
  return resource.pages.workspace.taskFilterLabels[filter];
}

function getDateViewLabel(view: WorkspaceDateView, resource: WorkspaceShellResources): string {
  return resource.pages.workspace.dateViewLabels[view];
}

function getWorkspaceIntroBody(
  workspace: WorkspaceShellHeaderWorkspace | null,
  resource: WorkspaceShellResources,
): string {
  if (!workspace) {
    return resource.pages.workspace.noWorkspaceIntroBody;
  }

  return workspace.kind === "team"
    ? resource.pages.workspace.teamIntroBody
    : resource.pages.workspace.personalIntroBody;
}

function renderWorkspaceEmptyState(
  activeDateViewLabel: string,
  activeTaskFilterLabel: string,
  emptyStateCopy: {
    body: string;
    title: string;
  },
  hasAnyTodos: boolean,
  resource: WorkspaceShellResources,
  workspace: WorkspaceShellHeaderWorkspace | null,
  todosLength: number,
) {
  if (!hasAnyTodos) {
    return (
      <section className="empty-state">
        <p className="empty-state__eyebrow">
          {workspace?.kind === "team"
            ? resource.pages.workspace.emptyTeamEyebrow
            : resource.pages.workspace.emptyPersonalEyebrow}
        </p>
        <h3>{emptyStateCopy.title}</h3>
        <p>{emptyStateCopy.body}</p>
      </section>
    );
  }

  if (todosLength === 0) {
    return (
      <section className="empty-state">
        <p className="empty-state__eyebrow">{resource.pages.workspace.emptyMatchEyebrow}</p>
        <h3>
          {resource.pages.workspace.emptyMatchTitle
            .replace("{{taskFilter}}", activeTaskFilterLabel)
            .replace("{{dateView}}", activeDateViewLabel.toLowerCase())}
        </h3>
        <p>{resource.pages.workspace.emptyMatchBody}</p>
      </section>
    );
  }

  return null;
}

function WorkspaceShellSectionNavigation<TRoute>({
  ariaLabel,
  onNavigate,
  routes,
}: {
  ariaLabel: string;
  onNavigate: (route: TRoute) => void;
  routes: WorkspaceShellSectionRoute<TRoute>[];
}) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <section className="workspace-subnav" aria-label={ariaLabel}>
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
  resource,
  taskCounts,
  taskFilter,
  todoCount,
}: {
  canManageTodos: boolean;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  resource: WorkspaceShellResources;
  taskCounts: Record<WorkspaceTaskFilter, number>;
  taskFilter: WorkspaceTaskFilter;
  todoCount: number;
}) {
  return (
    <section className="task-filter-panel" aria-label={resource.pages.workspace.filterPanelLabel}>
      <div>
        <p className="page-eyebrow">{resource.pages.workspace.filterPanelLabel}</p>
        <h3>{resource.pages.workspace.filterPanelHeading}</h3>
        <p>{resource.pages.workspace.filterPanelBody}</p>
      </div>
      <div
        className="task-filter-group"
        aria-label={resource.pages.workspace.filterPanelLabel}
        role="tablist"
      >
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
            <span>{getTaskFilterLabel(filter, resource)}</span>
            <strong>{taskCounts[filter]}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkspaceShellDateViewPanel({
  markedDates,
  onSelectedDateChange,
  resource,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
}: {
  markedDates: string[];
  onSelectedDateChange: (value: string) => void;
  resource: WorkspaceShellResources;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: WorkspaceShellSelectedDateTodo[];
}) {
  const selectedDay = parseDateValueAsLocalDate(selectedDate);
  const markedDays = markedDates.map(parseDateValueAsLocalDate);
  const chartData = (["all", "active", "completed"] as const).map((filter) => ({
    count:
      filter === "all"
        ? selectedDateTodos.length
        : selectedDateTodos.filter((todo) =>
            filter === "active" ? !todo.completed : todo.completed,
          ).length,
    label: getTaskFilterLabel(filter, resource),
  }));

  return (
    <section className="date-section-panel" aria-label={resource.pages.workspace.datePanelLabel}>
      <div>
        <p className="page-eyebrow">{resource.pages.workspace.datePanelLabel}</p>
        <h3>{resource.pages.workspace.datePanelHeading}</h3>
        <p>{resource.pages.workspace.datePanelBody}</p>
      </div>
      <div className="date-section-panel__grid">
        <div className="date-calendar-shell">
          <DayPicker
            mode="single"
            navLayout="after"
            modifiers={{ due: markedDays }}
            modifiersClassNames={{ due: "rdp-due" }}
            onSelect={(day) => {
              if (day) {
                onSelectedDateChange(formatLocalDateValue(day));
              }
            }}
            selected={selectedDay}
          />
        </div>
        <div className="date-summary-chart">
          <div className="date-summary-chart__plot">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} />
                <YAxis allowDecimals={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f4f46" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="date-summary-chart__caption">{selectedDateLabel}</p>
        </div>
      </div>
    </section>
  );
}

function WorkspaceShellSelectedDatePanel<TTodo extends WorkspaceShellTodoRowTodo>({
  canManageTodos,
  editingPanel,
  locale,
  onDeleteTodo,
  onSelectedDateChange,
  onStartEdit,
  onToggleComplete,
  resource,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  taskFilter,
}: {
  canManageTodos: boolean;
  editingPanel?: ReactNode;
  locale?: string | null;
  onDeleteTodo: (todoId: string) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: TTodo) => void;
  onToggleComplete: (todo: TTodo) => void;
  resource: WorkspaceShellResources;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: TTodo[];
  taskFilter: WorkspaceTaskFilter;
}) {
  return (
    <section
      className="selected-date-panel"
      aria-label={resource.pages.workspace.selectedDateLabel}
    >
      <div className="selected-date-panel__header">
        <div>
          <p className="page-eyebrow">{resource.pages.workspace.selectedDateLabel}</p>
          <h3>{resource.pages.workspace.datePanelHeading}</h3>
          <p className="selected-date-panel__body">
            {resource.pages.workspace.selectedDateBody
              .replace("{{selectedDateLabel}}", selectedDateLabel)
              .replace("{{taskFilter}}", getTaskFilterLabel(taskFilter, resource).toLowerCase())}
          </p>
        </div>

        <label className="composer__field selected-date-panel__field">
          <span>{resource.fields.selectedDate}</span>
          <input
            onChange={(event) => onSelectedDateChange(event.currentTarget.value)}
            type="date"
            value={selectedDate}
          />
        </label>
      </div>

      <div className="selected-date-panel__summary">
        <span>
          {resource.pages.workspace.selectedDateSummary
            .replace("{{count}}", String(selectedDateTodos.length))
            .replace("{{plural}}", selectedDateTodos.length === 1 ? "" : "s")}
        </span>
        <strong>{selectedDateLabel}</strong>
      </div>

      {editingPanel}

      {selectedDateTodos.length === 0 ? (
        <p className="selected-date-panel__empty">
          {resource.pages.workspace.selectedDateEmpty.replace(
            "{{taskFilter}}",
            getTaskFilterLabel(taskFilter, resource).toLowerCase(),
          )}
        </p>
      ) : (
        <ul className="selected-date-list">
          {selectedDateTodos.map((todo) => (
            <WorkspaceShellTodoRow
              disabled={!canManageTodos}
              key={todo.id}
              locale={locale}
              onDelete={onDeleteTodo}
              onStartEdit={onStartEdit}
              onToggleComplete={onToggleComplete}
              todo={todo}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function WorkspaceShellTeamInvitePanel({
  canManageTodos,
  invite,
  resource,
  workspaceName,
}: {
  canManageTodos: boolean;
  invite: WorkspaceShellTeamInvitePanelState;
  resource: WorkspaceShellResources;
  workspaceName: string;
}) {
  return (
    <section className="invite-panel">
      <div className="invite-panel__header">
        <div>
          <p className="page-eyebrow">{resource.pages.workspace.invitePanelLabel}</p>
          <h3>
            {resource.pages.workspace.invitePanelHeading.replace(
              "{{workspaceName}}",
              workspaceName,
            )}
          </h3>
          <p className="invite-panel__body">{resource.pages.workspace.invitePanelBody}</p>
        </div>
        <button disabled={!canManageTodos} onClick={invite.onCreateInvite} type="button">
          {resource.actions.createInvite}
        </button>
      </div>

      {invite.message ? <p className="info-banner info-banner--embed">{invite.message}</p> : null}

      {invite.code ? (
        <div className="invite-results">
          <label className="composer__field">
            <span>{resource.fields.inviteCode}</span>
            <div className="inline-copy-field">
              <input readOnly value={invite.code} />
              {invite.onCopyCode ? (
                <button onClick={invite.onCopyCode} type="button">
                  {resource.actions.copyCode}
                </button>
              ) : null}
            </div>
          </label>

          {invite.link ? (
            <label className="composer__field">
              <span>{resource.fields.joinLink}</span>
              <div className="inline-copy-field">
                <input readOnly value={invite.link} />
                {invite.onCopyLink ? (
                  <button onClick={invite.onCopyLink} type="button">
                    {resource.actions.copyLink}
                  </button>
                ) : null}
              </div>
            </label>
          ) : null}

          <div className="workspace-summary__meta">
            <span className="workspace-badge workspace-badge--team">
              {resource.pages.workspace.shareLabel}
            </span>
            <span className="workspace-switcher__hint">{resource.pages.workspace.shareHint}</span>
          </div>

          {invite.expiresAt ? (
            <p className="invite-panel__meta">
              {resource.pages.workspace.inviteExpires.replace(
                "{{expiresAt}}",
                formatDateTime(invite.expiresAt),
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function WorkspaceShellSignedInWorkspacePage<
  TRoute,
  TTodo extends WorkspaceShellTodoRowTodo,
  TSelectedTodo extends TTodo,
>({
  canManageTodos,
  composerPlaceholder,
  dateView,
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
  markedDates = [],
  renderNavigationAction,
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
    getDateViewLabel(dateView, resource),
    getTaskFilterLabel(taskFilter, resource),
    emptyStateCopy,
    hasAnyTodos,
    resource,
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
            locale={locale}
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
        resource={resource}
        workspaceName={workspace.name}
      />
    ) : null;

  return (
    <>
      <WorkspaceShellWorkspaceHeader
        introBody={getWorkspaceIntroBody(workspace, resource)}
        introEyebrow={
          workspace?.kind === "team"
            ? resource.destinations.teamDetail.label
            : resource.destinations.personalWorkspace.label
        }
        introTitle={routeTitle}
        locale={locale}
        renderNavigationAction={renderNavigationAction}
        workspace={workspace}
      />

      {layout === "sectioned" && sectionRoutes.length > 0 ? (
        <WorkspaceShellSectionNavigation
          ariaLabel={resource.pages.workspace.filterPanelLabel}
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
            locale={locale}
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
              locale={locale}
              onCancelEditing={onCancelEditing}
              onEditDueDateChange={onEditDueDateChange}
              onEditTitleChange={onEditTitleChange}
              onSaveEdit={onSaveEdit}
            />
          ) : null}

          <WorkspaceShellTaskFilterPanel
            canManageTodos={canManageTodos}
            onTaskFilterChange={onTaskFilterChange}
            resource={resource}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            todoCount={hasAnyTodos ? todos.length : 0}
          />

          {layout === "combined" ? (
            <>
              <WorkspaceShellDateViewPanel
                markedDates={markedDates}
                onSelectedDateChange={onSelectedDateChange}
                resource={resource}
                selectedDate={selectedDate}
                selectedDateLabel={selectedDateLabel}
                selectedDateTodos={selectedDateTodos}
              />
              <WorkspaceShellSelectedDatePanel
                canManageTodos={canManageTodos}
                editingPanel={
                  editingTodoId ? (
                    <WorkspaceShellTodoEditor
                      canManageTodos={canManageTodos}
                      editingDueDate={editingDueDate}
                      editingTitle={editingTitle}
                      locale={locale}
                      onCancelEditing={onCancelEditing}
                      onEditDueDateChange={onEditDueDateChange}
                      onEditTitleChange={onEditTitleChange}
                      onSaveEdit={onSaveEdit}
                    />
                  ) : null
                }
                locale={locale}
                onDeleteTodo={onDeleteTodo}
                onSelectedDateChange={onSelectedDateChange}
                onStartEdit={onStartEdit}
                onToggleComplete={onToggleComplete}
                resource={resource}
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
            resource={resource}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            todoCount={hasAnyTodos ? todos.length : 0}
          />
          <WorkspaceShellDateViewPanel
            markedDates={markedDates}
            onSelectedDateChange={onSelectedDateChange}
            resource={resource}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateTodos={selectedDateTodos}
          />
          <WorkspaceShellSelectedDatePanel
            canManageTodos={canManageTodos}
            editingPanel={
              editingTodoId ? (
                <WorkspaceShellTodoEditor
                  canManageTodos={canManageTodos}
                  editingDueDate={editingDueDate}
                  editingTitle={editingTitle}
                  locale={locale}
                  onCancelEditing={onCancelEditing}
                  onEditDueDateChange={onEditDueDateChange}
                  onEditTitleChange={onEditTitleChange}
                  onSaveEdit={onSaveEdit}
                />
              ) : null
            }
            locale={locale}
            onDeleteTodo={onDeleteTodo}
            onSelectedDateChange={onSelectedDateChange}
            onStartEdit={onStartEdit}
            onToggleComplete={onToggleComplete}
            resource={resource}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateTodos={selectedDateTodos}
            taskFilter={taskFilter}
          />
        </>
      ) : null}

      {layout === "sectioned" && activeSection === "invite" ? invitePanel : null}
    </>
  );
}
