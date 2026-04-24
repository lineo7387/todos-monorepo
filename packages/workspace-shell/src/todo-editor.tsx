import type { FormEvent } from "react";

import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellTodoEditorProps {
  canManageTodos: boolean;
  editingDueDate: string;
  editingTitle: string;
  locale?: string | null;
  onCancelEditing: () => void;
  onEditDueDateChange: (value: string) => void;
  onEditTitleChange: (value: string) => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
}

export function WorkspaceShellTodoEditor({
  canManageTodos,
  editingDueDate,
  editingTitle,
  locale,
  onCancelEditing,
  onEditDueDateChange,
  onEditTitleChange,
  onSaveEdit,
}: WorkspaceShellTodoEditorProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <form className="editor" onSubmit={onSaveEdit}>
      <label className="composer__field">
        <span>{resource.fields.editTask}</span>
        <input
          disabled={!canManageTodos}
          onChange={(event) => onEditTitleChange(event.currentTarget.value)}
          value={editingTitle}
        />
      </label>

      <label className="composer__field">
        <span>{resource.fields.dueDate}</span>
        <input
          disabled={!canManageTodos}
          onChange={(event) => onEditDueDateChange(event.currentTarget.value)}
          type="date"
          value={editingDueDate}
        />
      </label>

      <div className="editor__actions">
        <button disabled={!canManageTodos} type="submit">
          {resource.actions.save}
        </button>
        <button disabled={!canManageTodos} onClick={onCancelEditing} type="button">
          {resource.actions.cancel}
        </button>
      </div>
    </form>
  );
}
