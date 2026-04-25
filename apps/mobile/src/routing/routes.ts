import {
  getDefaultWorkspaceRoute,
  getTeamSection,
  getWorkspaceSection,
  getWorkspaceRouteTitle,
  isWorkspaceRouteActive,
  workspaceShellPersonalSections,
  workspaceShellTeamSections,
  type WorkspaceShellRoute,
  type WorkspaceShellTeamSection,
  type WorkspaceShellResources,
  type WorkspaceShellWorkspaceSection,
} from "workspace-shell";

export type MobileRoute = WorkspaceShellRoute;

export const getDefaultMobileRoute = getDefaultWorkspaceRoute;
export const getMobileRouteTitle = getWorkspaceRouteTitle;
export const isMobileRouteActive = isWorkspaceRouteActive;

export interface MobileWorkspaceSectionTab {
  active: boolean;
  label: string;
  route: MobileRoute;
  section: WorkspaceShellTeamSection;
}

export function getMobileWorkspaceSection(route: MobileRoute): WorkspaceShellTeamSection {
  return route.name === "team-detail" ? getTeamSection(route) : getWorkspaceSection(route);
}

export function getMobileWorkspaceSectionTabs(
  route: MobileRoute,
  resource: WorkspaceShellResources,
): MobileWorkspaceSectionTab[] {
  if (route.name === "team-detail") {
    const activeSection = getTeamSection(route);

    return workspaceShellTeamSections.map((section) => ({
      active: activeSection === section,
      label: resource.pages.workspace.sectionLabels[section],
      route: { name: "team-detail", teamId: route.teamId, section },
      section,
    }));
  }

  if (route.name === "personal-workspace") {
    const activeSection = getWorkspaceSection(route);

    return workspaceShellPersonalSections.map((section) => ({
      active: activeSection === section,
      label: resource.pages.workspace.sectionLabels[section],
      route: {
        name: "personal-workspace",
        section: section as WorkspaceShellWorkspaceSection,
      },
      section,
    }));
  }

  return [];
}
