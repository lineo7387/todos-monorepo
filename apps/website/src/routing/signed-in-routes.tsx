import { Navigate, Route, Routes } from "react-router-dom";
import type { FormEvent } from "react";
import type { TodoAppState } from "todo-app";
import {
  getWorkspaceShellResource,
  getTeamSection,
  getWorkspaceRouteTitle,
  getWorkspaceSection,
  WorkspaceShellSignedInCreateTeamPage,
  WorkspaceShellSignedInDashboardPage,
  WorkspaceShellSignedInJoinTeamPage,
  WorkspaceShellSignedInTeamListPage,
  WorkspaceShellSignedInWorkspacePage,
  type WorkspaceShellJoinTeamFeedback,
} from "workspace-shell";

import { RouteLink } from "../pages/route-link.tsx";
import type { WebsiteWorkspace, WorkspaceDateView, WorkspaceTaskFilter } from "../pages/types.ts";
import { getWebsiteSignedInRoutePatterns } from "./website-route-adapter.ts";
import type { WebsiteRoute } from "./routes.ts";

type WebsiteTodoItem = TodoAppState["todos"][number];

const websiteSignedInRoutePaths = Object.fromEntries(
  getWebsiteSignedInRoutePatterns().map((routePattern) => [routePattern.key, routePattern.path]),
) as Record<ReturnType<typeof getWebsiteSignedInRoutePatterns>[number]["key"], string>;

function getComposerPlaceholder(
  workspace: WebsiteWorkspace | null,
  locale?: string | null,
): string {
  const resource = getWorkspaceShellResource(locale);

  if (!workspace) {
    return resource.pages.workspace.composerNoWorkspace;
  }

  return workspace.kind === "team"
    ? resource.pages.workspace.composerTeam
    : resource.pages.workspace.composerPersonal;
}

export interface WebsiteSignedInRoutesProps {
  canManageTodos: boolean;
  dateView: WorkspaceDateView;
  dateViewCounts: Record<WorkspaceDateView, number>;
  draftDueDate: string;
  draftTeamName: string;
  draftTitle: string;
  editingDueDate: string;
  editingTitle: string;
  editingTodoId: string | null;
  emptyStateCopy: {
    body: string;
    title: string;
  };
  filteredTodos: WebsiteTodoItem[];
  hasAnyTodos: boolean;
  isSubmitting: boolean;
  joinFeedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  joinInviteCode: string;
  locale?: string | null;
  markedDates: string[];
  onCancelEditing: () => void;
  onCopyTeamInviteCode: () => void;
  onCopyTeamInviteLink: () => void;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCreateTeamInvite: () => void;
  onCreateTeamSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDateViewChange: (view: WorkspaceDateView) => void;
  onDeleteTodo: (todoId: string) => void;
  onDismissJoinFeedback: () => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTeamNameChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onInviteCodeChange: (value: string) => void;
  onJoinTeamSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNavigate: (route: WebsiteRoute, options?: { replace?: boolean }) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: WebsiteTodoItem) => void;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  onToggleComplete: (todo: WebsiteTodoItem) => void;
  personalWorkspace: WebsiteWorkspace | null;
  route: WebsiteRoute;
  routedTeamWorkspace: WebsiteWorkspace | null;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: WebsiteTodoItem[];
  source: "link" | "manual";
  taskCounts: Record<WorkspaceTaskFilter, number>;
  taskFilter: WorkspaceTaskFilter;
  teamInviteCode: string;
  teamInviteExpiresAt: string | null;
  teamInviteLink: string | null;
  teamInviteMessage: string | null;
  teamWorkspaces: WebsiteWorkspace[];
  todoTitleError: string | null;
}

export function WebsiteSignedInRoutes({
  canManageTodos,
  dateView,
  dateViewCounts,
  draftDueDate,
  draftTeamName,
  draftTitle,
  editingDueDate,
  editingTitle,
  editingTodoId,
  emptyStateCopy,
  filteredTodos,
  hasAnyTodos,
  isSubmitting,
  joinFeedback,
  joinInviteCode,
  locale,
  markedDates,
  onCancelEditing,
  onCopyTeamInviteCode,
  onCopyTeamInviteLink,
  onCreateSubmit,
  onCreateTeamInvite,
  onCreateTeamSubmit,
  onDateViewChange,
  onDeleteTodo,
  onDismissJoinFeedback,
  onDraftDueDateChange,
  onDraftTeamNameChange,
  onDraftTitleChange,
  onEditDueDateChange,
  onEditTitleChange,
  onInviteCodeChange,
  onJoinTeamSubmit,
  onNavigate,
  onSaveEdit,
  onSelectedDateChange,
  onStartEdit,
  onTaskFilterChange,
  onToggleComplete,
  personalWorkspace,
  route,
  routedTeamWorkspace,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  source,
  taskCounts,
  taskFilter,
  teamInviteCode,
  teamInviteExpiresAt,
  teamInviteLink,
  teamInviteMessage,
  teamWorkspaces,
  todoTitleError,
}: WebsiteSignedInRoutesProps) {
  const resource = getWorkspaceShellResource(locale);
  const personalWorkspaceSection = getWorkspaceSection(route);
  const teamDetailSection = getTeamSection(route);
  const personalWorkspaceElement = (
    <WorkspaceShellSignedInWorkspacePage
      canManageTodos={canManageTodos}
      composerPlaceholder={getComposerPlaceholder(personalWorkspace, locale)}
      dateView={dateView}
      dateViewCounts={dateViewCounts}
      draftDueDate={draftDueDate}
      draftTitle={draftTitle}
      editingDueDate={editingDueDate}
      editingTitle={editingTitle}
      editingTodoId={editingTodoId}
      emptyStateCopy={emptyStateCopy}
      hasAnyTodos={hasAnyTodos}
      layout="sectioned"
      locale={locale}
      markedDates={markedDates}
      onCancelEditing={onCancelEditing}
      onCreateSubmit={onCreateSubmit}
      onDateViewChange={onDateViewChange}
      onDeleteTodo={onDeleteTodo}
      onDraftDueDateChange={onDraftDueDateChange}
      onDraftTitleChange={onDraftTitleChange}
      onEditDueDateChange={onEditDueDateChange}
      onEditTitleChange={onEditTitleChange}
      onSaveEdit={onSaveEdit}
      onSectionNavigate={onNavigate}
      onSelectedDateChange={onSelectedDateChange}
      onStartEdit={onStartEdit}
      onTaskFilterChange={onTaskFilterChange}
      onToggleComplete={onToggleComplete}
      renderNavigationAction={({ className, label, route }) => (
        <RouteLink className={className} onNavigate={onNavigate} route={route as WebsiteRoute}>
          {label}
        </RouteLink>
      )}
      routeTitle={getWorkspaceRouteTitle({ name: "personal-workspace" }, undefined, locale)}
      section={personalWorkspaceSection}
      sectionRoutes={[
        {
          isActive: personalWorkspaceSection === "tasks",
          label: resource.pages.workspace.sectionLabels.tasks,
          route: { name: "personal-workspace", section: "tasks" },
        },
        {
          isActive: personalWorkspaceSection === "date",
          label: resource.pages.workspace.sectionLabels.date,
          route: { name: "personal-workspace", section: "date" },
        },
      ]}
      selectedDate={selectedDate}
      selectedDateLabel={selectedDateLabel}
      selectedDateTodos={selectedDateTodos}
      taskCounts={taskCounts}
      taskFilter={taskFilter}
      todoTitleError={todoTitleError}
      todos={filteredTodos}
      workspace={personalWorkspace}
    />
  );
  const teamWorkspaceElement = (
    <WorkspaceShellSignedInWorkspacePage
      canManageTodos={canManageTodos}
      composerPlaceholder={getComposerPlaceholder(routedTeamWorkspace, locale)}
      dateView={dateView}
      dateViewCounts={dateViewCounts}
      draftDueDate={draftDueDate}
      draftTitle={draftTitle}
      editingDueDate={editingDueDate}
      editingTitle={editingTitle}
      editingTodoId={editingTodoId}
      emptyStateCopy={emptyStateCopy}
      hasAnyTodos={hasAnyTodos}
      layout="sectioned"
      locale={locale}
      markedDates={markedDates}
      onCancelEditing={onCancelEditing}
      onCreateSubmit={onCreateSubmit}
      onDateViewChange={onDateViewChange}
      onDeleteTodo={onDeleteTodo}
      onDraftDueDateChange={onDraftDueDateChange}
      onDraftTitleChange={onDraftTitleChange}
      onEditDueDateChange={onEditDueDateChange}
      onEditTitleChange={onEditTitleChange}
      onSaveEdit={onSaveEdit}
      onSectionNavigate={onNavigate}
      onSelectedDateChange={onSelectedDateChange}
      onStartEdit={onStartEdit}
      onTaskFilterChange={onTaskFilterChange}
      onToggleComplete={onToggleComplete}
      renderNavigationAction={({ className, label, route }) => (
        <RouteLink className={className} onNavigate={onNavigate} route={route as WebsiteRoute}>
          {label}
        </RouteLink>
      )}
      routeTitle={getWorkspaceRouteTitle(route, routedTeamWorkspace?.name, locale)}
      section={teamDetailSection}
      sectionRoutes={
        route.name === "team-detail" && routedTeamWorkspace?.kind === "team"
          ? [
              {
                isActive: teamDetailSection === "tasks",
                label: resource.pages.workspace.sectionLabels.tasks,
                route: { name: "team-detail", teamId: route.teamId, section: "tasks" },
              },
              {
                isActive: teamDetailSection === "date",
                label: resource.pages.workspace.sectionLabels.date,
                route: { name: "team-detail", teamId: route.teamId, section: "date" },
              },
              {
                isActive: teamDetailSection === "invite",
                label: resource.pages.workspace.sectionLabels.invite,
                route: { name: "team-detail", teamId: route.teamId, section: "invite" },
              },
            ]
          : []
      }
      selectedDate={selectedDate}
      selectedDateLabel={selectedDateLabel}
      selectedDateTodos={selectedDateTodos}
      taskCounts={taskCounts}
      taskFilter={taskFilter}
      teamInvite={{
        code: teamInviteCode,
        expiresAt: teamInviteExpiresAt,
        link: teamInviteLink,
        message: teamInviteMessage,
        onCopyCode: onCopyTeamInviteCode,
        onCopyLink: onCopyTeamInviteLink,
        onCreateInvite: onCreateTeamInvite,
      }}
      todoTitleError={todoTitleError}
      todos={filteredTodos}
      workspace={routedTeamWorkspace}
    />
  );

  return (
    <Routes>
      <Route
        element={
          <WorkspaceShellSignedInDashboardPage
            locale={locale}
            personalWorkspaceName={personalWorkspace?.name ?? null}
            renderRouteAction={({ children, className, key, route }) => (
              <RouteLink
                className={className}
                key={key}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {children}
              </RouteLink>
            )}
            routes={{
              createTeam: { name: "create-team" } satisfies WebsiteRoute,
              joinTeam: { name: "join-team" } satisfies WebsiteRoute,
              personalWorkspace: { name: "personal-workspace" } satisfies WebsiteRoute,
              teamList: { name: "team-list" } satisfies WebsiteRoute,
            }}
            teamCount={teamWorkspaces.length}
          />
        }
        path={websiteSignedInRoutePaths.dashboard}
      />
      <Route
        element={personalWorkspaceElement}
        path={websiteSignedInRoutePaths["personal-workspace"]}
      />
      <Route
        element={personalWorkspaceElement}
        path={websiteSignedInRoutePaths["personal-workspace-tasks"]}
      />
      <Route
        element={personalWorkspaceElement}
        path={websiteSignedInRoutePaths["personal-workspace-date"]}
      />
      <Route
        element={
          <WorkspaceShellSignedInTeamListPage
            locale={locale}
            renderNavigationAction={({ className, label, route }) => (
              <RouteLink
                className={className}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {label}
              </RouteLink>
            )}
            renderRouteAction={({ children, className, key, route }) => (
              <RouteLink
                className={className}
                key={key}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {children}
              </RouteLink>
            )}
            teams={teamWorkspaces.map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
              route: { name: "team-detail", teamId: workspace.teamId ?? workspace.id },
            }))}
          />
        }
        path={websiteSignedInRoutePaths["team-list"]}
      />
      <Route element={teamWorkspaceElement} path={websiteSignedInRoutePaths["team-detail"]} />
      <Route element={teamWorkspaceElement} path={websiteSignedInRoutePaths["team-detail-tasks"]} />
      <Route element={teamWorkspaceElement} path={websiteSignedInRoutePaths["team-detail-date"]} />
      <Route
        element={teamWorkspaceElement}
        path={websiteSignedInRoutePaths["team-detail-invite"]}
      />
      <Route
        element={
          <WorkspaceShellSignedInJoinTeamPage
            feedback={joinFeedback as WorkspaceShellJoinTeamFeedback | null}
            inputValue={joinInviteCode}
            isSubmitting={isSubmitting}
            locale={locale}
            onDismissFeedback={onDismissJoinFeedback}
            onInputChange={onInviteCodeChange}
            onSubmit={onJoinTeamSubmit}
            renderNavigationAction={({ className, label, route }) => (
              <RouteLink
                className={className}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {label}
              </RouteLink>
            )}
            renderRouteAction={({ children, className, key, route }) => (
              <RouteLink
                className={className}
                key={key}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {children}
              </RouteLink>
            )}
            source={source}
            teamListRoute={{ name: "team-list" } satisfies WebsiteRoute}
          />
        }
        path={websiteSignedInRoutePaths["join-team"]}
      />
      <Route
        element={
          <WorkspaceShellSignedInCreateTeamPage
            canManageTodos={canManageTodos}
            draftTeamName={draftTeamName}
            locale={locale}
            onDraftTeamNameChange={onDraftTeamNameChange}
            onSubmit={onCreateTeamSubmit}
            renderNavigationAction={({ className, label, route }) => (
              <RouteLink
                className={className}
                onNavigate={onNavigate}
                route={route as WebsiteRoute}
              >
                {label}
              </RouteLink>
            )}
          />
        }
        path={websiteSignedInRoutePaths["create-team"]}
      />
      <Route element={<Navigate replace to={route.name === "dashboard" ? "/" : "/"} />} path="*" />
    </Routes>
  );
}
