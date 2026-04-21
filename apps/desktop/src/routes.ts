export type DesktopRoute =
  | { name: "dashboard" }
  | { name: "personal-workspace" }
  | { name: "team-list" }
  | { name: "team-detail"; teamId: string }
  | { name: "join-team" }
  | { name: "create-team" };

export function getDefaultDesktopRoute(): DesktopRoute {
  return { name: "dashboard" };
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
