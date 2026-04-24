import { isDesktopRouteActive, type DesktopRoute } from "../routing/routes.ts";
import { getWorkspaceShellResource, WorkspaceTopNavigation } from "workspace-shell";

export interface DesktopTopLevelNavigationProps {
  currentRoute: DesktopRoute;
  locale?: string | null;
  onNavigate: (route: DesktopRoute) => void;
  personalWorkspace: {
    name: string;
  } | null;
  teams: Array<{
    id: string;
    name: string;
    route: DesktopRoute;
  }>;
}

export function DesktopTopLevelNavigation({
  currentRoute,
  locale,
  onNavigate,
  personalWorkspace,
  teams,
}: DesktopTopLevelNavigationProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <WorkspaceTopNavigation<DesktopRoute>
      emptyTeamsCopy={resource.navigation.emptyTeams}
      joinedTeamsCopy={resource.navigation.joinedTeamsBody}
      joinedTeamsLabel={resource.navigation.joinedTeams}
      navigationBody={resource.navigation.body}
      navigationHeading={resource.navigation.heading}
      navigationSubtitle={resource.navigation.subtitle}
      primaryItems={[
        {
          description: resource.navigation.primaryItems.dashboard,
          isActive: isDesktopRouteActive(currentRoute, { name: "dashboard" }),
          key: "dashboard",
          label: resource.destinations.dashboard.label,
          route: { name: "dashboard" } satisfies DesktopRoute,
        },
        {
          description:
            personalWorkspace?.name ?? resource.navigation.primaryItems.personalWorkspace,
          isActive: isDesktopRouteActive(currentRoute, {
            name: "personal-workspace",
            section: "tasks",
          }),
          key: "personal-workspace",
          label: resource.destinations.personalWorkspace.label,
          route: { name: "personal-workspace", section: "tasks" } satisfies DesktopRoute,
        },
        {
          description: resource.navigation.primaryItems.teamList,
          isActive: isDesktopRouteActive(currentRoute, { name: "team-list" }),
          key: "team-list",
          label: resource.destinations.teamList.label,
          route: { name: "team-list" } satisfies DesktopRoute,
        },
        {
          description: resource.navigation.primaryItems.joinTeam,
          isActive: isDesktopRouteActive(currentRoute, { name: "join-team" }),
          key: "join-team",
          label: resource.destinations.joinTeam.label,
          route: { name: "join-team" } satisfies DesktopRoute,
        },
        {
          description: resource.navigation.primaryItems.createTeam,
          isActive: isDesktopRouteActive(currentRoute, { name: "create-team" }),
          key: "create-team",
          label: resource.destinations.createTeam.label,
          route: { name: "create-team" } satisfies DesktopRoute,
        },
      ]}
      renderAction={({ children, className, key, route }) => (
        <button
          className={className}
          key={key}
          onClick={() => onNavigate(route)}
          role="listitem"
          type="button"
        >
          {children}
        </button>
      )}
      teamLabel={resource.navigation.teamLabel}
      teams={teams.map((team) => ({
        id: team.id,
        isActive: isDesktopRouteActive(currentRoute, team.route),
        name: team.name,
        route: team.route,
      }))}
    />
  );
}
