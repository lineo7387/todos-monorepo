import type { FormEvent, ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";
import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellCreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  locale?: string | null;
  onDraftTeamNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
}

export function WorkspaceShellCreateTeamPage({
  canManageTodos,
  draftTeamName,
  locale,
  onDraftTeamNameChange,
  onSubmit,
  renderNavigationAction,
}: WorkspaceShellCreateTeamPageProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">{resource.destinations.createTeam.label}</p>
          <h2>{resource.pages.createTeam.heading}</h2>
          <p>{resource.pages.createTeam.body}</p>
        </div>

        <div className="page-intro__actions">
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.dashboard.label,
            route: { name: "dashboard" },
          })}
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.teamList.label,
            route: { name: "team-list" },
          })}
        </div>
      </section>

      <form className="standalone-form" onSubmit={onSubmit}>
        <label className="composer__field">
          <span>{resource.fields.teamName}</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTeamNameChange(event.currentTarget.value)}
            placeholder={resource.fields.teamNamePlaceholder}
            value={draftTeamName}
          />
        </label>

        <button disabled={!canManageTodos} type="submit">
          {resource.actions.createTeam}
        </button>
      </form>
    </>
  );
}
