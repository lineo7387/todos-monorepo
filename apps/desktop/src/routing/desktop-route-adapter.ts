import {
  getWorkspaceShellSignedInRoutePatterns,
  type WorkspaceShellSignedInRoutePattern,
} from "workspace-shell";

export function getDesktopSignedInRoutePatterns(): WorkspaceShellSignedInRoutePattern[] {
  return getWorkspaceShellSignedInRoutePatterns({ includeWorkspaceSections: true });
}
