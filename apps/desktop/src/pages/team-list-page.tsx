import {
  WorkspaceShellRouteCard,
  WorkspaceShellTeamListPage,
  type WorkspaceShellTeamListPageTeam,
} from "workspace-shell";

import type { DesktopRoute } from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopTeamListPageProps {
  onNavigate: (route: DesktopRoute) => void;
  teams: Array<{
    id: string;
    name: string;
    route: DesktopRoute;
  }>;
}

export function DesktopTeamListPage({ onNavigate, teams }: DesktopTeamListPageProps) {
  return (
    <WorkspaceShellTeamListPage
      emptyStateBody="Create a team or redeem an invite to populate this list."
      renderNavigationAction={({ className, label, route }) => (
        <DesktopActionLink
          className={className}
          onNavigate={onNavigate}
          route={route as DesktopRoute}
        >
          {label}
        </DesktopActionLink>
      )}
      renderTeamCard={(team) => (
        <button
          className="route-card"
          key={team.id}
          onClick={() => onNavigate(team.route as DesktopRoute)}
          type="button"
        >
          <WorkspaceShellRouteCard
            body="Open the dedicated desktop page for this shared workspace."
            eyebrow="Team detail"
            title={team.name}
          />
        </button>
      )}
      teams={teams as WorkspaceShellTeamListPageTeam[]}
      teamListBody="Open each shared workspace from its own desktop team detail destination."
    />
  );
}
