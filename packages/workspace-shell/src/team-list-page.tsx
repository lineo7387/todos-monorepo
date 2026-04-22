import type { ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";

export interface WorkspaceShellTeamListPageTeam {
  id: string;
  name: string;
  route: WorkspaceShellRoute;
}

export interface WorkspaceShellTeamListPageProps {
  emptyStateBody: string;
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
  renderNavigationAction,
  renderTeamCard,
  teams,
  teamListBody,
}: WorkspaceShellTeamListPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <h2>Team workspaces</h2>
          <p>{teamListBody}</p>
        </div>

        <div className="page-intro__actions">
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: "Dashboard",
            route: { name: "dashboard" },
          })}
          {renderNavigationAction({
            className: "button-link",
            label: "Create team",
            route: { name: "create-team" },
          })}
        </div>
      </section>

      {teams.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No joined teams yet</p>
          <h3>Your teams will appear here.</h3>
          <p>{emptyStateBody}</p>
        </section>
      ) : (
        <section className="page-grid">{teams.map((team) => renderTeamCard(team))}</section>
      )}
    </>
  );
}
