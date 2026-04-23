import type { FormEvent } from "react";

export interface WorkspaceShellTodoEditorProps {
  canManageTodos: boolean;
  editingDueDate: string;
  editingTitle: string;
  onCancelEditing: () => void;
  onEditDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
}

export function WorkspaceShellTodoEditor({
  canManageTodos,
  editingDueDate,
  editingTitle,
  onCancelEditing,
  onEditDueDateChange,
  onEditTitleChange,
  onSaveEdit,
}: WorkspaceShellTodoEditorProps) {
  return (
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
  );
}
