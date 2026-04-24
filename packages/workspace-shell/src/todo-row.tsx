import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellTodoRowTodo {
  completed: boolean;
  dueDate: string | null;
  id: string;
  title: string;
  updatedAt: string;
}

export interface WorkspaceShellTodoRowProps<TTodo extends WorkspaceShellTodoRowTodo> {
  disabled: boolean;
  onDelete: (todoId: string) => void;
  onStartEdit: (todo: TTodo) => void;
  onToggleComplete: (todo: TTodo) => void;
  locale?: string | null;
  todo: TTodo;
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
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

export function WorkspaceShellTodoRow<TTodo extends WorkspaceShellTodoRowTodo>({
  disabled,
  onDelete,
  onStartEdit,
  onToggleComplete,
  locale,
  todo,
}: WorkspaceShellTodoRowProps<TTodo>) {
  const resource = getWorkspaceShellResource(locale);
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
          <span className="todo-card__eyebrow">
            {isOptimistic ? resource.pages.todo.syncing : resource.pages.todo.updated}
          </span>
          <span>
            {isOptimistic
              ? resource.pages.todo.waitingForSupabase
              : formatUpdatedAt(todo.updatedAt)}
          </span>
          {todo.dueDate ? (
            <span>{resource.pages.todo.due.replace("{{date}}", formatDueDate(todo.dueDate))}</span>
          ) : null}
        </div>
        <p>{todo.title}</p>
      </div>

      <div className="todo-card__actions">
        <button disabled={disabled} onClick={() => onStartEdit(todo)} type="button">
          {resource.actions.edit}
        </button>
        <button
          className="danger"
          disabled={disabled}
          onClick={() => onDelete(todo.id)}
          type="button"
        >
          {resource.actions.delete}
        </button>
      </div>
    </li>
  );
}
