import { describe, expect, test } from "vite-plus/test";

import { resolveDesktopRouteEffect } from "./route-effects.ts";
import {
  getDefaultDesktopRoute,
  getDesktopRouteHref,
  getDesktopRouteTitle,
  getDesktopTeamSection,
  getDesktopWorkspaceSection,
  isDesktopRouteActive,
  parseDesktopRoute,
} from "../routing/routes.ts";

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

  test("treats team detail pages as active within the joined teams navigation group", () => {
    expect(
      isDesktopRouteActive(
        { name: "team-detail", teamId: "team-1", section: "date" },
        { name: "team-list" },
      ),
    ).toBe(true);
    expect(
      isDesktopRouteActive(
        { name: "team-detail", teamId: "team-1", section: "invite" },
        { name: "team-detail", teamId: "team-1", section: "tasks" },
      ),
    ).toBe(true);
    expect(
      isDesktopRouteActive(
        { name: "team-detail", teamId: "team-1" },
        { name: "team-detail", teamId: "team-2" },
      ),
    ).toBe(false);
  });

  test("defaults workspace subsections to tasks when no explicit section is present", () => {
    expect(getDesktopWorkspaceSection({ name: "personal-workspace" })).toBe("tasks");
    expect(getDesktopWorkspaceSection({ name: "personal-workspace", section: "date" })).toBe(
      "date",
    );
    expect(getDesktopTeamSection({ name: "team-detail", teamId: "team-1" })).toBe("tasks");
    expect(
      getDesktopTeamSection({ name: "team-detail", teamId: "team-1", section: "invite" }),
    ).toBe("invite");
  });

  test("maps desktop paths onto the shared route contract", () => {
    expect(parseDesktopRoute("/")).toEqual({ name: "dashboard" });
    expect(parseDesktopRoute("/my-workspace/date")).toEqual({
      name: "personal-workspace",
      section: "date",
    });
    expect(parseDesktopRoute("/teams/team-1/invite")).toEqual({
      name: "team-detail",
      teamId: "team-1",
      section: "invite",
    });
  });

  test("serializes desktop route state into explicit paths", () => {
    expect(getDesktopRouteHref({ name: "dashboard" })).toBe("/");
    expect(getDesktopRouteHref({ name: "personal-workspace", section: "tasks" })).toBe(
      "/my-workspace/tasks",
    );
    expect(getDesktopRouteHref({ name: "team-detail", teamId: "team-1", section: "date" })).toBe(
      "/teams/team-1/date",
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
