import type { FormEvent } from "react";

import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellTaskComposerProps {
  canManageTodos: boolean;
  composerPlaceholder: string;
  draftDueDate: string;
  draftTitle: string;
  locale?: string | null;
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
  locale,
  onCreateSubmit,
  onDraftDueDateChange,
  onDraftTitleChange,
  todoTitleError,
}: WorkspaceShellTaskComposerProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <>
      <form className="composer" onSubmit={onCreateSubmit}>
        <label className="composer__field">
          <span>{resource.fields.newTask}</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTitleChange(event.currentTarget.value)}
            placeholder={composerPlaceholder}
            value={draftTitle}
          />
        </label>

        <label className="composer__field composer__field--date">
          <span>{resource.fields.dueDate}</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftDueDateChange(event.currentTarget.value)}
            type="date"
            value={draftDueDate}
          />
        </label>

        <div className="composer__quick-actions">
          <button disabled={!canManageTodos} onClick={() => onDraftDueDateChange("")} type="button">
            {resource.actions.noDate}
          </button>
        </div>

        <button disabled={!canManageTodos} type="submit">
          {resource.actions.addTask}
        </button>
      </form>

      {todoTitleError ? <p className="field-error field-error--spaced">{todoTitleError}</p> : null}
    </>
  );
}
