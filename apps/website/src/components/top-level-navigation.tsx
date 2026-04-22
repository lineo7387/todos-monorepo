import type { MouseEvent, ReactNode } from "react";
import {
  getWorkspaceShellResource,
  isWorkspaceRouteActive,
  WorkspaceTopNavigation,
} from "workspace-shell";

import type { WebsiteWorkspace } from "../pages/types.ts";
import { getWebsiteRouteHref, type WebsiteRoute } from "../routing/routes.ts";

export interface TopLevelNavigationProps {
  currentRoute: WebsiteRoute;
  onNavigate: (route: WebsiteRoute) => void;
  personalWorkspace: WebsiteWorkspace | null;
  teams: WebsiteWorkspace[];
}

interface RouteLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate: (route: WebsiteRoute) => void;
  route: WebsiteRoute;
}

function RouteLink({ children, className, onNavigate, route }: RouteLinkProps) {
  const href = getWebsiteRouteHref(route);

  return (
    <a
      className={className}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {children}
    </a>
  );
}

export function TopLevelNavigation({
  currentRoute,
  onNavigate,
  personalWorkspace,
  teams,
}: TopLevelNavigationProps) {
  const resource = getWorkspaceShellResource();

  return (
    <WorkspaceTopNavigation<WebsiteRoute>
      emptyTeamsCopy="No joined teams yet. Create one or accept an invite."
      joinedTeamsCopy="Jump directly into a dedicated team detail page from anywhere in the signed-in flow."
      joinedTeamsLabel={resource.navigation.joinedTeams}
      navigationBody="The app now keeps the workspace model route-driven, with joined teams available as dedicated destinations."
      navigationHeading={resource.navigation.heading}
      navigationSubtitle="Move between dashboard, your workspace, and team actions."
      primaryItems={[
        {
          description: "Overview and quick entry points",
          isActive: isWorkspaceRouteActive(currentRoute, { name: "dashboard" }),
          key: "dashboard",
          label: resource.destinations.dashboard.label,
          route: { name: "dashboard" } satisfies WebsiteRoute,
        },
        {
          description: personalWorkspace?.name ?? "Personal tasks",
          isActive: isWorkspaceRouteActive(currentRoute, { name: "personal-workspace" }),
          key: "personal-workspace",
          label: resource.destinations.personalWorkspace.label,
          route: { name: "personal-workspace" } satisfies WebsiteRoute,
        },
        {
          description: `${teams.length} team${teams.length === 1 ? "" : "s"}`,
          isActive: isWorkspaceRouteActive(currentRoute, { name: "team-list" }),
          key: "team-list",
          label: "Joined teams",
          route: { name: "team-list" } satisfies WebsiteRoute,
        },
        {
          description: "Redeem an invite",
          isActive: isWorkspaceRouteActive(currentRoute, { name: "join-team" }),
          key: "join-team",
          label: resource.destinations.joinTeam.label,
          route: { name: "join-team" } satisfies WebsiteRoute,
        },
        {
          description: "Start a shared workspace",
          isActive: isWorkspaceRouteActive(currentRoute, { name: "create-team" }),
          key: "create-team",
          label: resource.destinations.createTeam.label,
          route: { name: "create-team" } satisfies WebsiteRoute,
        },
      ]}
      renderAction={({ children, className, key, route }) => (
        <RouteLink className={className} key={key} onNavigate={onNavigate} route={route}>
          {children}
        </RouteLink>
      )}
      teams={teams.map((team) => {
        const route = {
          name: "team-detail",
          teamId: team.teamId ?? team.id,
        } satisfies WebsiteRoute;

        return {
          id: team.id,
          isActive: isWorkspaceRouteActive(currentRoute, route),
          name: team.name,
          route,
        };
      })}
    />
  );
}
