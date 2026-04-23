import {
  getDefaultWorkspaceRoute,
  getWorkspaceRouteTitle,
  isWorkspaceRouteActive,
  type WorkspaceShellRoute,
} from "workspace-shell";

export type MobileRoute = WorkspaceShellRoute;

export const getDefaultMobileRoute = getDefaultWorkspaceRoute;
export const getMobileRouteTitle = getWorkspaceRouteTitle;
export const isMobileRouteActive = isWorkspaceRouteActive;
