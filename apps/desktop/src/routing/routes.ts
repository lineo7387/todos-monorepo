import {
  getDefaultWorkspaceRoute,
  getTeamSection,
  getWorkspaceRouteTitle,
  getWorkspaceSection,
  isWorkspaceRouteActive,
  type WorkspaceShellRoute,
  type WorkspaceShellTeamSection,
  type WorkspaceShellWorkspaceSection,
} from "workspace-shell";

export type DesktopWorkspaceSection = WorkspaceShellWorkspaceSection;
export type DesktopTeamSection = WorkspaceShellTeamSection;
export type DesktopRoute = WorkspaceShellRoute;

export const getDefaultDesktopRoute = getDefaultWorkspaceRoute;
export const isDesktopRouteActive = isWorkspaceRouteActive;
export const getDesktopWorkspaceSection = getWorkspaceSection;
export const getDesktopTeamSection = getTeamSection;
export const getDesktopRouteTitle = getWorkspaceRouteTitle;

export function parseDesktopRoute(pathname: string): DesktopRoute {
  if (pathname === "/my-workspace" || pathname === "/my-workspace/tasks") {
    return { name: "personal-workspace", section: "tasks" };
  }

  if (pathname === "/my-workspace/date") {
    return { name: "personal-workspace", section: "date" };
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
    const [teamId, section] = pathname.slice("/teams/".length).split("/").filter(Boolean);

    if (teamId) {
      if (section === "date") {
        return { name: "team-detail", teamId, section: "date" };
      }

      if (section === "invite") {
        return { name: "team-detail", teamId, section: "invite" };
      }

      return { name: "team-detail", teamId, section: "tasks" };
    }
  }

  return { name: "dashboard" };
}

export function getDesktopRouteHref(route: DesktopRoute): string {
  switch (route.name) {
    case "dashboard":
      return "/";
    case "personal-workspace":
      return route.section === "date" ? "/my-workspace/date" : "/my-workspace/tasks";
    case "team-list":
      return "/teams";
    case "team-detail":
      if (route.section === "date") {
        return `/teams/${route.teamId}/date`;
      }

      if (route.section === "invite") {
        return `/teams/${route.teamId}/invite`;
      }

      return `/teams/${route.teamId}/tasks`;
    case "join-team":
      return "/teams/join";
    case "create-team":
      return "/teams/new";
  }

  return "/";
}
