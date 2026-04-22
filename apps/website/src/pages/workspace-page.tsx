import type { FormEvent } from "react";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";
import type {
  WebsiteTodoItem,
  WebsiteWorkspace,
  WorkspaceDateView,
  WorkspaceTaskFilter,
} from "./types.ts";

export interface WorkspacePageProps {
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTaskCount: number;
  selectedDateTodos: WebsiteTodoItem[];
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
  activeDateViewLabel: string;
  activeTaskFilterLabel: string;
  dateView: WorkspaceDateView;
  dateViewCounts: Record<WorkspaceDateView, number>;
  hasAnyTodos: boolean;
  taskCounts: Record<WorkspaceTaskFilter, number>;
  taskFilter: WorkspaceTaskFilter;
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
  onDateViewChange: (view: WorkspaceDateView) => void;
  onNavigate: (route: WebsiteRoute) => void;
  onSelectedDateChange: (value: string) => void;
  onTaskFilterChange: (filter: WorkspaceTaskFilter) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onStartEdit: (todo: WebsiteTodoItem) => void;
  onCancelEditing: () => void;
  onCopyTeamInviteCode: () => void;
  onCopyTeamInviteLink: () => void;
  onDeleteTodo: (todoId: string) => void;
  onToggleComplete: (todo: WebsiteTodoItem) => void;
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

function getTaskFilterLabel(filter: WorkspaceTaskFilter): string {
  switch (filter) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "all":
      return "All";
  }
}

function getDateViewLabel(view: WorkspaceDateView): string {
  switch (view) {
    case "due-today":
      return "Due today";
    case "upcoming":
      return "Upcoming";
    case "all":
      return "All tasks";
  }
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

export function WorkspacePage({
  selectedDate,
  selectedDateLabel,
  selectedDateTaskCount,
  selectedDateTodos,
  canManageTodos,
  draftTitle,
  draftDueDate,
  editingTodoId,
  editingTitle,
  editingDueDate,
  emptyStateCopy,
  activeDateViewLabel,
  activeTaskFilterLabel,
  dateView,
  dateViewCounts,
  hasAnyTodos,
  taskCounts,
  taskFilter,
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
  onDateViewChange,
  onNavigate,
  onSelectedDateChange,
  onTaskFilterChange,
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

      <section className="task-filter-panel" aria-label="Task filters">
        <div>
          <p className="page-eyebrow">Task filter</p>
          <h3>Focus this workspace by status.</h3>
        </div>
        <div className="task-filter-group" role="tablist" aria-label="Filter tasks by status">
          {(["all", "active", "completed"] as const).map((filter) => (
            <button
              aria-selected={taskFilter === filter}
              className={`task-filter-chip ${taskFilter === filter ? "is-active" : ""}`}
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

      <section className="task-filter-panel" aria-label="Date views">
        <div>
          <p className="page-eyebrow">Date view</p>
          <h3>Browse dated tasks without turning this into a full calendar.</h3>
        </div>
        <div className="task-filter-group" role="tablist" aria-label="Filter tasks by due date">
          {(["all", "due-today", "upcoming"] as const).map((view) => (
            <button
              aria-selected={dateView === view}
              className={`task-filter-chip ${dateView === view ? "is-active" : ""}`}
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

      <section className="selected-date-panel" aria-label="Selected date inspection">
        <div className="selected-date-panel__header">
          <div>
            <p className="page-eyebrow">Selected day</p>
            <h3>Inspect one day without opening a full calendar.</h3>
            <p className="selected-date-panel__body">
              View tasks due on {selectedDateLabel} for this workspace. This day view follows the
              current status filter and only includes tasks that already have a due date.
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
            {selectedDateTaskCount} task{selectedDateTaskCount === 1 ? "" : "s"}
          </span>
          <strong>{selectedDateLabel}</strong>
        </div>

        {selectedDateTodos.length === 0 ? (
          <p className="selected-date-panel__empty">
            No {activeTaskFilterLabel.toLowerCase()} tasks are due on this day.
          </p>
        ) : (
          <ul className="selected-date-list">
            {selectedDateTodos.map((todo) => (
              <li className="selected-date-list__item" key={todo.id}>
                <div>
                  <p>{todo.title}</p>
                  <span>{todo.completed ? "Completed" : "Active"}</span>
                </div>
                {todo.dueDate ? <strong>{formatDueDate(todo.dueDate)}</strong> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasAnyTodos ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">
            {workspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
          </p>
          <h3>{emptyStateCopy.title}</h3>
          <p>{emptyStateCopy.body}</p>
        </section>
      ) : todos.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No matching tasks</p>
          <h3>
            {activeTaskFilterLabel} tasks in {activeDateViewLabel.toLowerCase()} are clear right
            now.
          </h3>
          <p>
            Switch task filters or date views to review the rest of this workspace. Date-based views
            only include tasks that already have a due date.
          </p>
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
