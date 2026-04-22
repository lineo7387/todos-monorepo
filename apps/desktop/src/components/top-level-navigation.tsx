import { isDesktopRouteActive, type DesktopRoute } from "../routing/routes.ts";
import { getWorkspaceShellResource, WorkspaceTopNavigation } from "workspace-shell";

export interface DesktopTopLevelNavigationProps {
  currentRoute: DesktopRoute;
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
  onNavigate,
  personalWorkspace,
  teams,
}: DesktopTopLevelNavigationProps) {
  const resource = getWorkspaceShellResource();

  return (
    <WorkspaceTopNavigation<DesktopRoute>
      emptyTeamsCopy="No joined teams yet. Create one or accept an invite."
      joinedTeamsCopy="Jump directly into a dedicated team detail page from anywhere in the signed-in flow."
      joinedTeamsLabel={resource.navigation.joinedTeams}
      navigationBody="Desktop should feel like the same product model as web, with dedicated destinations for dashboard, my workspace, joined teams, and team flows."
      navigationHeading={resource.navigation.heading}
      navigationSubtitle={resource.navigation.subtitle}
      primaryItems={[
        {
          description: "Overview and quick entry points",
          isActive: isDesktopRouteActive(currentRoute, { name: "dashboard" }),
          key: "dashboard",
          label: resource.destinations.dashboard.label,
          route: { name: "dashboard" } satisfies DesktopRoute,
        },
        {
          description: personalWorkspace?.name ?? "Personal tasks",
          isActive: isDesktopRouteActive(currentRoute, {
            name: "personal-workspace",
            section: "tasks",
          }),
          key: "personal-workspace",
          label: resource.destinations.personalWorkspace.label,
          route: { name: "personal-workspace", section: "tasks" } satisfies DesktopRoute,
        },
        {
          description: `${teams.length} team${teams.length === 1 ? "" : "s"}`,
          isActive: isDesktopRouteActive(currentRoute, { name: "team-list" }),
          key: "team-list",
          label: "Joined teams",
          route: { name: "team-list" } satisfies DesktopRoute,
        },
        {
          description: "Redeem an invite",
          isActive: isDesktopRouteActive(currentRoute, { name: "join-team" }),
          key: "join-team",
          label: resource.destinations.joinTeam.label,
          route: { name: "join-team" } satisfies DesktopRoute,
        },
        {
          description: "Start a shared workspace",
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
      teams={teams.map((team) => ({
        id: team.id,
        isActive: isDesktopRouteActive(currentRoute, team.route),
        name: team.name,
        route: team.route,
      }))}
    />
  );
}
