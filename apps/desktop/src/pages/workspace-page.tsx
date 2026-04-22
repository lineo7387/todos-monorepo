import type { FormEvent, ReactNode } from "react";

import {
  type DesktopRoute,
  type DesktopTeamSection,
  type DesktopWorkspaceSection,
} from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopWorkspacePageProps {
  section: DesktopWorkspaceSection | DesktopTeamSection;
  sectionRoutes: Array<{
    isActive: boolean;
    label: string;
    route: DesktopRoute;
  }>;
  canManageTodos: boolean;
  dateControls: ReactNode;
  emptyState: ReactNode;
  editingForm: ReactNode;
  emptyStateCopy: {
    body: string;
    title: string;
  };
  filteredTodoList: ReactNode;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  invitePanel: ReactNode;
  onCreateSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  selectedDatePanel: ReactNode;
  taskControls: ReactNode;
  todoTitleError: string | null;
  workspace: {
    kind: "personal" | "team";
    name: string;
  } | null;
  draftDueDate: string;
  draftTitle: string;
  composerPlaceholder: string;
}

export function DesktopWorkspacePage({
  section,
  sectionRoutes,
  canManageTodos,
  composerPlaceholder,
  dateControls,
  draftDueDate,
  draftTitle,
  editingForm,
  emptyState,
  emptyStateCopy,
  filteredTodoList,
  introBody,
  introEyebrow,
  introTitle,
  invitePanel,
  onCreateSubmit,
  onDraftDueDateChange,
  onDraftTitleChange,
  onNavigate,
  selectedDatePanel,
  taskControls,
  todoTitleError,
  workspace,
}: DesktopWorkspacePageProps) {
  const activeSection =
    workspace?.kind === "team"
      ? section === "date" || section === "invite"
        ? section
        : "tasks"
      : section === "date"
        ? "date"
        : "tasks";

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">{introEyebrow}</p>
          <h2>{introTitle}</h2>
          <p>{introBody}</p>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={workspace?.kind === "team" ? { name: "team-list" } : { name: "create-team" }}
          >
            {workspace?.kind === "team" ? "All teams" : "Create team"}
          </DesktopActionLink>
        </div>
      </section>

      <section className="workspace-summary">
        {workspace ? (
          <div className="workspace-summary__meta">
            <span className={`workspace-badge workspace-badge--${workspace.kind}`}>
              {workspace.kind === "team" ? "Team workspace" : "Personal workspace"}
            </span>
            <span className="workspace-switcher__hint">
              {workspace.kind === "team"
                ? "Create, edit, complete, and delete actions apply to this shared team list."
                : "Create, edit, complete, and delete actions stay scoped to your personal list."}
            </span>
          </div>
        ) : null}
      </section>

      <section className="workspace-subnav" aria-label="Workspace sections">
        {sectionRoutes.map((entry) => (
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

      {activeSection === "tasks" ? (
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

          {todoTitleError ? (
            <p className="field-error field-error--spaced">{todoTitleError}</p>
          ) : null}

          {taskControls}
          {editingForm}

          {filteredTodoList ?? (
            <section className="empty-state">
              <p className="empty-state__eyebrow">
                {workspace?.kind === "team" ? "Team workspace is empty" : "No tasks yet"}
              </p>
              <h3>{emptyStateCopy.title}</h3>
              <p>{emptyStateCopy.body}</p>
            </section>
          )}

          {emptyState}
        </>
      ) : null}

      {activeSection === "date" ? (
        <>
          {taskControls}
          {dateControls}
          {selectedDatePanel}
          {emptyState}
        </>
      ) : null}

      {activeSection === "invite" ? invitePanel : null}
    </>
  );
}
