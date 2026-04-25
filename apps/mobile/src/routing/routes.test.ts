import { describe, expect, test } from "vite-plus/test";
import { getWorkspaceShellResource } from "workspace-shell";

import { getMobileWorkspaceSection, getMobileWorkspaceSectionTabs } from "./routes.ts";

const resource = getWorkspaceShellResource("en");

describe("mobile workspace section routes", () => {
  test("builds route-backed personal workspace tabs", () => {
    const tabs = getMobileWorkspaceSectionTabs(
      { name: "personal-workspace", section: "date" },
      resource,
    );

    expect(tabs).toEqual([
      {
        active: false,
        label: "Tasks",
        route: { name: "personal-workspace", section: "tasks" },
        section: "tasks",
      },
      {
        active: true,
        label: "Date",
        route: { name: "personal-workspace", section: "date" },
        section: "date",
      },
    ]);
  });

  test("builds route-backed team workspace tabs including invite", () => {
    const tabs = getMobileWorkspaceSectionTabs(
      { name: "team-detail", teamId: "team-1", section: "invite" },
      resource,
    );

    expect(tabs).toEqual([
      {
        active: false,
        label: "Tasks",
        route: { name: "team-detail", teamId: "team-1", section: "tasks" },
        section: "tasks",
      },
      {
        active: false,
        label: "Date",
        route: { name: "team-detail", teamId: "team-1", section: "date" },
        section: "date",
      },
      {
        active: true,
        label: "Invite",
        route: { name: "team-detail", teamId: "team-1", section: "invite" },
        section: "invite",
      },
    ]);
  });

  test("resolves the default mobile section from shared routes", () => {
    expect(getMobileWorkspaceSection({ name: "dashboard" })).toBe("tasks");
    expect(getMobileWorkspaceSection({ name: "personal-workspace" })).toBe("tasks");
    expect(getMobileWorkspaceSection({ name: "team-detail", teamId: "team-1" })).toBe("tasks");
  });
});
