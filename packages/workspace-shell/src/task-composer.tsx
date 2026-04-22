import type { FormEvent } from "react";

export interface WorkspaceShellTaskComposerProps {
  canManageTodos: boolean;
  composerPlaceholder: string;
  draftDueDate: string;
  draftTitle: string;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  todoTitleError: string | null;
}

export function WorkspaceShellTaskComposer({
  canManageTodos,
  composerPlaceholder,
  draftDueDate,
  draftTitle,
  onCreateSubmit,
  onDraftDueDateChange,
  onDraftTitleChange,
  todoTitleError,
}: WorkspaceShellTaskComposerProps) {
  return (
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
    </>
  );
}
