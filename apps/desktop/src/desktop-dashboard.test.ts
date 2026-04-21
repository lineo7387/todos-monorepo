import { describe, expect, test } from "vite-plus/test";

import { deriveDesktopDashboard } from "./desktop-dashboard.ts";

describe("deriveDesktopDashboard", () => {
  test("derives dashboard summaries and team quick links from available workspaces", () => {
    const result = deriveDesktopDashboard({
      activeWorkspaceId: "team-2",
      personalWorkspace: {
        id: "personal:user-1",
        kind: "personal",
        name: "My workspace",
      },
      teamWorkspaces: [
        {
          id: "team-1",
          kind: "team",
          name: "Design",
          teamId: "team-1",
        },
        {
          id: "team-2",
          kind: "team",
          name: "Research",
          teamId: "team-2",
        },
      ],
    });

    expect(result.stats).toEqual([
      { label: "My workspace", value: "My workspace" },
      { label: "Joined teams", value: "2" },
      { label: "Active workspace", value: "Research" },
    ]);
    expect(result.actions.map((action) => action.route)).toEqual([
      { name: "personal-workspace" },
      { name: "team-list" },
      { name: "join-team" },
      { name: "create-team" },
    ]);
    expect(result.teamEntries).toEqual([
      {
        id: "team-1",
        isActive: false,
        route: { name: "team-detail", teamId: "team-1" },
        title: "Design",
      },
      {
        id: "team-2",
        isActive: true,
        route: { name: "team-detail", teamId: "team-2" },
        title: "Research",
      },
    ]);
  });

  test("keeps dashboard copy safe when no joined teams are available yet", () => {
    const result = deriveDesktopDashboard({
      activeWorkspaceId: null,
      personalWorkspace: null,
      teamWorkspaces: [],
    });

    expect(result.stats).toEqual([
      { label: "My workspace", value: "Ready" },
      { label: "Joined teams", value: "0" },
      { label: "Active workspace", value: "Dashboard" },
    ]);
    expect(result.teamEntries).toEqual([]);
    expect(result.teamEmptyState).toBe(
      "No joined teams yet. Create one or accept an invite from dashboard.",
    );
    expect(result.actions[1]?.title).toBe("0 joined teams");
  });
});
