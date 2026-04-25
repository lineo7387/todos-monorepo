import {
  getWorkspaceShellRouteHref,
  parseWorkspaceShellRoute,
  type WorkspaceShellRoute,
} from "workspace-shell";

export type WebsiteRoute = WorkspaceShellRoute;

export function parseWebsiteRoute(pathname: string): WebsiteRoute {
  return parseWorkspaceShellRoute(pathname, { includeWorkspaceSections: true });
}

export function getWebsiteRouteHref(route: WebsiteRoute): string {
  return getWorkspaceShellRouteHref(route, { includeDefaultWorkspaceSection: true });
}
