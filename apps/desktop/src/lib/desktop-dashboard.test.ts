import { describe, expect, test } from "vite-plus/test";

import { deriveDesktopDashboard } from "./desktop-dashboard.ts";

describe("deriveDesktopDashboard", () => {
  test("derives dashboard summaries and team quick links from available workspaces", () => {
    const result = deriveDesktopDashboard({
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
    ]);
    expect(result.actions.map((action) => action.route)).toEqual([
      { name: "personal-workspace", section: "tasks" },
      { name: "team-list" },
      { name: "join-team" },
      { name: "create-team" },
    ]);
    expect(result.actions[1]?.title).toBe("2 joined teams");
  });

  test("keeps dashboard copy safe when no joined teams are available yet", () => {
    const result = deriveDesktopDashboard({
      personalWorkspace: null,
      teamWorkspaces: [],
    });

    expect(result.stats).toEqual([
      { label: "My workspace", value: "Ready" },
      { label: "Joined teams", value: "0" },
    ]);
    expect(result.actions[1]?.title).toBe("0 joined teams");
  });
});
