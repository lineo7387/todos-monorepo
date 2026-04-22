import { WorkspaceShellTeamListPage, type WorkspaceShellTeamListPageTeam } from "workspace-shell";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";
import type { WebsiteWorkspace } from "./types.ts";

export interface TeamListPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  teams: WebsiteWorkspace[];
}

export function TeamListPage({ onNavigate, teams }: TeamListPageProps) {
  return (
    <WorkspaceShellTeamListPage
      emptyStateBody="Create a team or redeem an invite to populate this list."
      renderNavigationAction={({ className, label, route }) => (
        <RouteLink className={className} onNavigate={onNavigate} route={route as WebsiteRoute}>
          {label}
        </RouteLink>
      )}
      renderTeamCard={(team) => (
        <RouteLink
          className="route-card"
          key={team.id}
          onNavigate={onNavigate}
          route={team.route as WebsiteRoute}
        >
          <p className="page-eyebrow">Team detail</p>
          <h3>{team.name}</h3>
          <p>Open the dedicated page for this shared workspace.</p>
        </RouteLink>
      )}
      teams={
        teams.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
          route: { name: "team-detail", teamId: workspace.teamId ?? workspace.id },
        })) as WorkspaceShellTeamListPageTeam[]
      }
      teamListBody="Open each shared workspace from its own URL-backed detail page."
    />
  );
}
