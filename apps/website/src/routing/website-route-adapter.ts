import {
  getWorkspaceShellSignedInRoutePatterns,
  type WorkspaceShellSignedInRoutePattern,
} from "workspace-shell";

export function getWebsiteSignedInRoutePatterns(): WorkspaceShellSignedInRoutePattern[] {
  return getWorkspaceShellSignedInRoutePatterns();
}
