export type WebsiteRoute =
  | { name: "dashboard" }
  | { name: "personal-workspace" }
  | { name: "team-list" }
  | { name: "team-detail"; teamId: string }
  | { name: "join-team" }
  | { name: "create-team" };

export function parseWebsiteRoute(pathname: string): WebsiteRoute {
  if (pathname === "/my-workspace") {
    return { name: "personal-workspace" };
  }

  if (pathname === "/teams") {
    return { name: "team-list" };
  }

  if (pathname === "/teams/new") {
    return { name: "create-team" };
  }

  if (pathname === "/teams/join") {
    return { name: "join-team" };
  }

  if (pathname.startsWith("/teams/")) {
    const teamId = pathname.slice("/teams/".length).trim();

    if (teamId.length > 0) {
      return { name: "team-detail", teamId };
    }
  }

  return { name: "dashboard" };
}

export function getWebsiteRouteHref(route: WebsiteRoute): string {
  switch (route.name) {
    case "dashboard":
      return "/";
    case "personal-workspace":
      return "/my-workspace";
    case "team-list":
      return "/teams";
    case "team-detail":
      return `/teams/${route.teamId}`;
    case "join-team":
      return "/teams/join";
    case "create-team":
      return "/teams/new";
  }
}
