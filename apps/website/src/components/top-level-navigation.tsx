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
  locale?: string | null;
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
  locale,
  onNavigate,
  personalWorkspace,
  teams,
}: TopLevelNavigationProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <WorkspaceTopNavigation<WebsiteRoute>
      emptyTeamsCopy={resource.navigation.emptyTeams}
      joinedTeamsCopy={resource.navigation.joinedTeamsBody}
      joinedTeamsLabel={resource.navigation.joinedTeams}
      navigationBody={resource.navigation.body}
      navigationHeading={resource.navigation.heading}
      navigationSubtitle={resource.navigation.subtitle}
      primaryItems={[
        {
          description: resource.navigation.primaryItems.dashboard,
          isActive: isWorkspaceRouteActive(currentRoute, { name: "dashboard" }),
          key: "dashboard",
          label: resource.destinations.dashboard.label,
          route: { name: "dashboard" } satisfies WebsiteRoute,
        },
        {
          description:
            personalWorkspace?.name ?? resource.navigation.primaryItems.personalWorkspace,
          isActive: isWorkspaceRouteActive(currentRoute, { name: "personal-workspace" }),
          key: "personal-workspace",
          label: resource.destinations.personalWorkspace.label,
          route: { name: "personal-workspace", section: "tasks" } satisfies WebsiteRoute,
        },
        {
          description: resource.navigation.primaryItems.teamList,
          isActive: isWorkspaceRouteActive(currentRoute, { name: "team-list" }),
          key: "team-list",
          label: resource.destinations.teamList.label,
          route: { name: "team-list" } satisfies WebsiteRoute,
        },
        {
          description: resource.navigation.primaryItems.joinTeam,
          isActive: isWorkspaceRouteActive(currentRoute, { name: "join-team" }),
          key: "join-team",
          label: resource.destinations.joinTeam.label,
          route: { name: "join-team" } satisfies WebsiteRoute,
        },
        {
          description: resource.navigation.primaryItems.createTeam,
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
      teamLabel={resource.navigation.teamLabel}
      teams={teams.map((team) => {
        const route = {
          name: "team-detail",
          teamId: team.teamId ?? team.id,
          section: "tasks",
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
