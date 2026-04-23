import { Navigate, Route, Routes } from "react-router-dom";
import type { FormEvent } from "react";
import type { TodoAppState } from "todo-app";

import { CreateTeamPage } from "../pages/create-team-page.tsx";
import { DashboardPage } from "../pages/dashboard-page.tsx";
import { JoinTeamPage } from "../pages/join-team-page.tsx";
import { TeamListPage } from "../pages/team-list-page.tsx";
import { WorkspacePage } from "../pages/workspace-page.tsx";
import type { WebsiteWorkspace, WorkspaceDateView, WorkspaceTaskFilter } from "../pages/types.ts";
import { getWebsiteSignedInRoutePatterns } from "./website-route-adapter.ts";
import type { WebsiteRoute } from "./routes.ts";

type WebsiteTodoItem = TodoAppState["todos"][number];

const websiteSignedInRoutePaths = Object.fromEntries(
  getWebsiteSignedInRoutePatterns().map((routePattern) => [routePattern.key, routePattern.path]),
) as Record<ReturnType<typeof getWebsiteSignedInRoutePatterns>[number]["key"], string>;

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
  joinFeedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  joinInviteCode: string;
  onCancelEditing: () => void;
  onCreateSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateTeamInvite: () => void;
  onCreateTeamSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDateViewChange: (view: WorkspaceDateView) => void;
  onDeleteTodo: (todoId: string) => void;
  onDismissJoinFeedback: () => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTeamNameChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onInviteCodeChange: (value: string) => void;
  onJoinTeamSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onNavigate: (route: WebsiteRoute, options?: { replace?: boolean }) => void;
  onCopyTeamInviteCode: () => void;
  onCopyTeamInviteLink: () => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: WebsiteTodoItem) => void;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  onToggleComplete: (todo: WebsiteTodoItem) => void;
  personalWorkspace: WebsiteWorkspace | null;
  routedTeamWorkspace: WebsiteWorkspace | null;
  route: WebsiteRoute;
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
  isSubmitting: boolean;
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
  joinFeedback,
  joinInviteCode,
  onCancelEditing,
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
  onCopyTeamInviteCode,
  onCopyTeamInviteLink,
  onSaveEdit,
  onSelectedDateChange,
  onStartEdit,
  onTaskFilterChange,
  onToggleComplete,
  personalWorkspace,
  routedTeamWorkspace,
  route,
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
  isSubmitting,
}: WebsiteSignedInRoutesProps) {
  return (
    <Routes>
      <Route
        element={
          <DashboardPage
            onNavigate={onNavigate}
            personalWorkspace={personalWorkspace}
            teamCount={teamWorkspaces.length}
          />
        }
        path={websiteSignedInRoutePaths.dashboard}
      />
      <Route
        element={
          <WorkspacePage
            activeDateViewLabel={
              dateView === "due-today"
                ? "due today"
                : dateView === "upcoming"
                  ? "upcoming"
                  : "all tasks"
            }
            activeTaskFilterLabel={
              taskFilter === "active" ? "Active" : taskFilter === "completed" ? "Completed" : "All"
            }
            canManageTodos={canManageTodos}
            dateView={dateView}
            dateViewCounts={dateViewCounts}
            draftDueDate={draftDueDate}
            draftTitle={draftTitle}
            editingDueDate={editingDueDate}
            editingTitle={editingTitle}
            editingTodoId={editingTodoId}
            emptyStateCopy={emptyStateCopy}
            hasAnyTodos={hasAnyTodos}
            onCancelEditing={onCancelEditing}
            onCopyTeamInviteCode={onCopyTeamInviteCode}
            onCopyTeamInviteLink={onCopyTeamInviteLink}
            onCreateSubmit={onCreateSubmit}
            onCreateTeamInvite={() => {}}
            onDateViewChange={onDateViewChange}
            onDeleteTodo={onDeleteTodo}
            onDraftDueDateChange={onDraftDueDateChange}
            onDraftTitleChange={onDraftTitleChange}
            onEditDueDateChange={onEditDueDateChange}
            onEditTitleChange={onEditTitleChange}
            onNavigate={onNavigate}
            onSaveEdit={onSaveEdit}
            onSelectedDateChange={onSelectedDateChange}
            onStartEdit={onStartEdit}
            onTaskFilterChange={onTaskFilterChange}
            onToggleComplete={onToggleComplete}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateTaskCount={selectedDateTodos.length}
            selectedDateTodos={selectedDateTodos}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            teamInviteCode=""
            teamInviteExpiresAt={null}
            teamInviteLink={null}
            teamInviteMessage={null}
            todoTitleError={todoTitleError}
            todos={filteredTodos}
            workspace={personalWorkspace}
          />
        }
        path={websiteSignedInRoutePaths["personal-workspace"]}
      />
      <Route
        element={<TeamListPage onNavigate={onNavigate} teams={teamWorkspaces} />}
        path={websiteSignedInRoutePaths["team-list"]}
      />
      <Route
        element={
          <WorkspacePage
            activeDateViewLabel={
              dateView === "due-today"
                ? "due today"
                : dateView === "upcoming"
                  ? "upcoming"
                  : "all tasks"
            }
            activeTaskFilterLabel={
              taskFilter === "active" ? "Active" : taskFilter === "completed" ? "Completed" : "All"
            }
            canManageTodos={canManageTodos}
            dateView={dateView}
            dateViewCounts={dateViewCounts}
            draftDueDate={draftDueDate}
            draftTitle={draftTitle}
            editingDueDate={editingDueDate}
            editingTitle={editingTitle}
            editingTodoId={editingTodoId}
            emptyStateCopy={emptyStateCopy}
            hasAnyTodos={hasAnyTodos}
            onCancelEditing={onCancelEditing}
            onCopyTeamInviteCode={onCopyTeamInviteCode}
            onCopyTeamInviteLink={onCopyTeamInviteLink}
            onCreateSubmit={onCreateSubmit}
            onCreateTeamInvite={onCreateTeamInvite}
            onDateViewChange={onDateViewChange}
            onDeleteTodo={onDeleteTodo}
            onDraftDueDateChange={onDraftDueDateChange}
            onDraftTitleChange={onDraftTitleChange}
            onEditDueDateChange={onEditDueDateChange}
            onEditTitleChange={onEditTitleChange}
            onNavigate={onNavigate}
            onSaveEdit={onSaveEdit}
            onSelectedDateChange={onSelectedDateChange}
            onStartEdit={onStartEdit}
            onTaskFilterChange={onTaskFilterChange}
            onToggleComplete={onToggleComplete}
            selectedDate={selectedDate}
            selectedDateLabel={selectedDateLabel}
            selectedDateTaskCount={selectedDateTodos.length}
            selectedDateTodos={selectedDateTodos}
            taskCounts={taskCounts}
            taskFilter={taskFilter}
            teamInviteCode={teamInviteCode}
            teamInviteExpiresAt={teamInviteExpiresAt}
            teamInviteLink={teamInviteLink}
            teamInviteMessage={teamInviteMessage}
            todoTitleError={todoTitleError}
            todos={filteredTodos}
            workspace={routedTeamWorkspace}
          />
        }
        path={websiteSignedInRoutePaths["team-detail"]}
      />
      <Route
        element={
          <JoinTeamPage
            feedback={joinFeedback}
            inviteCode={joinInviteCode}
            isSubmitting={isSubmitting}
            onDismissFeedback={onDismissJoinFeedback}
            onInviteCodeChange={onInviteCodeChange}
            onNavigate={onNavigate}
            onSubmit={onJoinTeamSubmit}
            source={source}
          />
        }
        path={websiteSignedInRoutePaths["join-team"]}
      />
      <Route
        element={
          <CreateTeamPage
            canManageTodos={canManageTodos}
            draftTeamName={draftTeamName}
            onDraftTeamNameChange={onDraftTeamNameChange}
            onNavigate={onNavigate}
            onSubmit={onCreateTeamSubmit}
          />
        }
        path={websiteSignedInRoutePaths["create-team"]}
      />
      <Route element={<Navigate replace to={route.name === "dashboard" ? "/" : "/"} />} path="*" />
    </Routes>
  );
}
