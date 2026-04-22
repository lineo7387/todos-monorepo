export type DesktopWorkspaceSection = "tasks" | "date";
export type DesktopTeamSection = DesktopWorkspaceSection | "invite";

export type DesktopRoute =
  | { name: "dashboard" }
  | { name: "personal-workspace"; section?: DesktopWorkspaceSection }
  | { name: "team-list" }
  | { name: "team-detail"; teamId: string; section?: DesktopTeamSection }
  | { name: "join-team" }
  | { name: "create-team" };

export function getDefaultDesktopRoute(): DesktopRoute {
  return { name: "dashboard" };
}

export function isDesktopRouteActive(currentRoute: DesktopRoute, route: DesktopRoute): boolean {
  if (route.name === "team-list") {
    return currentRoute.name === "team-list" || currentRoute.name === "team-detail";
  }

  if (route.name === "team-detail") {
    return currentRoute.name === "team-detail" && currentRoute.teamId === route.teamId;
  }

  return currentRoute.name === route.name;
}

export function getDesktopWorkspaceSection(route: DesktopRoute): DesktopWorkspaceSection {
  if (route.name === "personal-workspace" || route.name === "team-detail") {
    return route.section === "date" ? "date" : "tasks";
  }

  return "tasks";
}

export function getDesktopTeamSection(route: DesktopRoute): DesktopTeamSection {
  if (route.name === "team-detail") {
    if (route.section === "date" || route.section === "invite") {
      return route.section;
    }
  }

  return "tasks";
}

export function getDesktopRouteTitle(route: DesktopRoute, teamName?: string): string {
  switch (route.name) {
    case "dashboard":
      return "Dashboard";
    case "personal-workspace":
      return "My workspace";
    case "team-list":
      return "Teams";
    case "team-detail":
      return teamName ? teamName : "Team detail";
    case "join-team":
      return "Join team";
    case "create-team":
      return "Create team";
  }
}
