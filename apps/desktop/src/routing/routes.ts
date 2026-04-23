import {
  getDefaultWorkspaceRoute,
  getTeamSection,
  getWorkspaceShellRouteHref,
  getWorkspaceRouteTitle,
  getWorkspaceSection,
  isWorkspaceRouteActive,
  parseWorkspaceShellRoute,
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
  return parseWorkspaceShellRoute(pathname, { includeWorkspaceSections: true });
}

export function getDesktopRouteHref(route: DesktopRoute): string {
  return getWorkspaceShellRouteHref(route, { includeDefaultWorkspaceSection: true });
}
