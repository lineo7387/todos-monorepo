import type { DesktopRoute } from "./routes.ts";

export interface ResolveDesktopRouteEffectInput {
  activeWorkspaceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  personalWorkspaceId: string | null;
  route: DesktopRoute;
  routedTeamWorkspaceId: string | null;
}

export interface ResolveDesktopRouteEffectResult {
  redirectRoute: DesktopRoute | null;
  routeNotice: string | null;
  selectWorkspaceId: string | null;
}

export function resolveDesktopRouteEffect(
  input: ResolveDesktopRouteEffectInput,
): ResolveDesktopRouteEffectResult {
  if (!input.isAuthenticated) {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (input.route.name === "personal-workspace") {
    if (input.personalWorkspaceId && input.activeWorkspaceId !== input.personalWorkspaceId) {
      return {
        redirectRoute: null,
        routeNotice: null,
        selectWorkspaceId: input.personalWorkspaceId,
      };
    }

    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (input.route.name !== "team-detail") {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (!input.routedTeamWorkspaceId) {
    if (input.isLoading) {
      return {
        redirectRoute: null,
        routeNotice: null,
        selectWorkspaceId: null,
      };
    }

    return {
      redirectRoute: { name: "team-list" },
      routeNotice: "That team is not available in your current memberships.",
      selectWorkspaceId: null,
    };
  }

  if (input.activeWorkspaceId !== input.routedTeamWorkspaceId) {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: input.routedTeamWorkspaceId,
    };
  }

  return {
    redirectRoute: null,
    routeNotice: null,
    selectWorkspaceId: null,
  };
}
