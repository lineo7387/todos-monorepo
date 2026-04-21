import { describe, expect, test } from "vite-plus/test";

import { resolveDesktopRouteEffect } from "./route-effects.ts";
import { getDefaultDesktopRoute, getDesktopRouteTitle } from "./routes.ts";

describe("desktop routes", () => {
  test("uses dashboard as the signed-in default route", () => {
    expect(getDefaultDesktopRoute()).toEqual({ name: "dashboard" });
  });

  test("matches the shared destination labels used by web", () => {
    expect(getDesktopRouteTitle({ name: "dashboard" })).toBe("Dashboard");
    expect(getDesktopRouteTitle({ name: "personal-workspace" })).toBe("My workspace");
    expect(getDesktopRouteTitle({ name: "team-list" })).toBe("Teams");
    expect(getDesktopRouteTitle({ name: "join-team" })).toBe("Join team");
    expect(getDesktopRouteTitle({ name: "create-team" })).toBe("Create team");
    expect(getDesktopRouteTitle({ name: "team-detail", teamId: "team-1" }, "Research")).toBe(
      "Research",
    );
  });
});

describe("resolveDesktopRouteEffect", () => {
  test("selects my workspace when the route targets the personal destination", () => {
    expect(
      resolveDesktopRouteEffect({
        activeWorkspaceId: "team-1",
        isAuthenticated: true,
        isLoading: false,
        personalWorkspaceId: "personal:user-1",
        route: { name: "personal-workspace" },
        routedTeamWorkspaceId: null,
      }),
    ).toEqual({
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: "personal:user-1",
    });
  });

  test("selects the joined team workspace for a team detail route", () => {
    expect(
      resolveDesktopRouteEffect({
        activeWorkspaceId: "personal:user-1",
        isAuthenticated: true,
        isLoading: false,
        personalWorkspaceId: "personal:user-1",
        route: { name: "team-detail", teamId: "team-1" },
        routedTeamWorkspaceId: "team-1",
      }),
    ).toEqual({
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: "team-1",
    });
  });

  test("waits during loading when a routed team is not yet available", () => {
    expect(
      resolveDesktopRouteEffect({
        activeWorkspaceId: "personal:user-1",
        isAuthenticated: true,
        isLoading: true,
        personalWorkspaceId: "personal:user-1",
        route: { name: "team-detail", teamId: "missing-team" },
        routedTeamWorkspaceId: null,
      }),
    ).toEqual({
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    });
  });

  test("redirects unavailable team detail routes back to the team list", () => {
    expect(
      resolveDesktopRouteEffect({
        activeWorkspaceId: "personal:user-1",
        isAuthenticated: true,
        isLoading: false,
        personalWorkspaceId: "personal:user-1",
        route: { name: "team-detail", teamId: "missing-team" },
        routedTeamWorkspaceId: null,
      }),
    ).toEqual({
      redirectRoute: { name: "team-list" },
      routeNotice: "That team is not available in your current memberships.",
      selectWorkspaceId: null,
    });
  });
});
