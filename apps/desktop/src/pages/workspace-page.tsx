import type { FormEvent, ReactNode } from "react";
import {
  WorkspaceShellTaskComposer,
  WorkspaceShellWorkspaceHeader,
  type WorkspaceShellHeaderWorkspace,
} from "workspace-shell";

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
      <WorkspaceShellWorkspaceHeader
        introBody={introBody}
        introEyebrow={introEyebrow}
        introTitle={introTitle}
        renderNavigationAction={({ className, label, route }) => (
          <DesktopActionLink
            className={className}
            onNavigate={onNavigate}
            route={route as DesktopRoute}
          >
            {label}
          </DesktopActionLink>
        )}
        workspace={workspace as WorkspaceShellHeaderWorkspace | null}
      />

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
          <WorkspaceShellTaskComposer
            canManageTodos={canManageTodos}
            composerPlaceholder={composerPlaceholder}
            draftDueDate={draftDueDate}
            draftTitle={draftTitle}
            onCreateSubmit={onCreateSubmit}
            onDraftDueDateChange={onDraftDueDateChange}
            onDraftTitleChange={onDraftTitleChange}
            todoTitleError={todoTitleError}
          />

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
