import type { ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";
import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellTeamListPageTeam {
  id: string;
  name: string;
  route: WorkspaceShellRoute;
}

export interface WorkspaceShellTeamListPageProps {
  emptyStateBody: string;
  emptyStateEyebrow: string;
  emptyStateTitle: string;
  locale?: string | null;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  renderTeamCard: (team: WorkspaceShellTeamListPageTeam) => ReactNode;
  teams: WorkspaceShellTeamListPageTeam[];
  teamListBody: string;
}

export function WorkspaceShellTeamListPage({
  emptyStateBody,
  emptyStateEyebrow,
  emptyStateTitle,
  locale,
  renderNavigationAction,
  renderTeamCard,
  teams,
  teamListBody,
}: WorkspaceShellTeamListPageProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">{resource.navigation.joinedTeams}</p>
          <h2>{resource.pages.teamList.heading}</h2>
          <p>{teamListBody}</p>
        </div>

        <div className="page-intro__actions">
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.dashboard.label,
            route: { name: "dashboard" },
          })}
          {renderNavigationAction({
            className: "button-link",
            label: resource.destinations.createTeam.label,
            route: { name: "create-team" },
          })}
        </div>
      </section>

      {teams.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">{emptyStateEyebrow}</p>
          <h3>{emptyStateTitle}</h3>
          <p>{emptyStateBody}</p>
        </section>
      ) : (
        <section className="page-grid">{teams.map((team) => renderTeamCard(team))}</section>
      )}
    </>
  );
}
