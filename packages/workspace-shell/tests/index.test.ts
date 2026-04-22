import { describe, expect, test } from "vite-plus/test";

import {
  deriveWorkspaceTaskView,
  extractInviteCode,
  getCreateInviteSuccessOutcome,
  getDefaultWorkspaceRoute,
  getJoinInviteFailureFeedback,
  getJoinTeamSuccessOutcome,
  getWorkspaceShellResource,
  getTeamSection,
  getWorkspaceRouteTitle,
  getWorkspaceSection,
  isWorkspaceRouteActive,
  normalizeWorkspaceShellLocale,
  resolveWorkspaceRouteEffect,
  workspaceShellLocales,
  workspaceShellPageIds,
  workspaceShellResources,
  workspaceShellTranslationKeys,
  workspaceShellTranslationNamespaces,
} from "../src/index.ts";

const todos = [
  {
    id: "todo-undated-active",
    title: "Inbox task",
    completed: false,
    dueDate: null,
  },
  {
    id: "todo-due-today",
    title: "Ship release notes",
    completed: false,
    dueDate: "2026-04-21",
  },
  {
    id: "todo-upcoming",
    title: "Prep planning",
    completed: false,
    dueDate: "2026-04-23",
  },
  {
    id: "todo-completed-upcoming",
    title: "Archive notes",
    completed: true,
    dueDate: "2026-04-24",
  },
];

describe("workspace-shell route contract", () => {
  test("defines the canonical signed-in destinations and namespace contract", () => {
    expect(workspaceShellPageIds).toEqual({
      dashboard: "dashboard",
      personalWorkspace: "personal-workspace",
      teamList: "team-list",
      teamDetail: "team-detail",
      joinTeam: "join-team",
      createTeam: "create-team",
    });
    expect(workspaceShellTranslationNamespaces).toEqual({
      root: "workspace-shell",
      pages: "workspace-shell.pages",
      destinations: "workspace-shell.destinations",
      navigation: "workspace-shell.navigation",
      actions: "workspace-shell.actions",
      feedback: "workspace-shell.feedback",
      emptyStates: "workspace-shell.emptyStates",
      terms: "workspace-shell.terms",
    });
    expect(workspaceShellTranslationKeys.terms).toEqual({
      dashboard: "workspace-shell.terms.dashboard",
      myWorkspace: "workspace-shell.terms.myWorkspace",
      team: "workspace-shell.terms.team",
    });
  });

  test("shares titles, active-state grouping, and workspace sections", () => {
    expect(getDefaultWorkspaceRoute()).toEqual({ name: "dashboard" });
    expect(getWorkspaceRouteTitle({ name: "personal-workspace" })).toBe("My workspace");
    expect(getWorkspaceRouteTitle({ name: "personal-workspace" }, undefined, "zh-CN")).toBe(
      "我的工作区",
    );
    expect(
      isWorkspaceRouteActive(
        { name: "team-detail", teamId: "team-1", section: "date" },
        { name: "team-list" },
      ),
    ).toBe(true);
    expect(getWorkspaceSection({ name: "personal-workspace", section: "date" })).toBe("date");
    expect(getTeamSection({ name: "team-detail", teamId: "team-1", section: "invite" })).toBe(
      "invite",
    );
  });

  test("defines shared English and Chinese resource trees for core workspace terminology", () => {
    expect(workspaceShellLocales).toEqual(["en", "zh-CN"]);
    expect(workspaceShellResources.en.terms).toEqual({
      dashboard: "Dashboard",
      myWorkspace: "My workspace",
      team: "Team",
    });
    expect(workspaceShellResources["zh-CN"].terms).toEqual({
      dashboard: "仪表盘",
      myWorkspace: "我的工作区",
      team: "团队",
    });
    expect(getWorkspaceShellResource("zh").navigation.joinedTeams).toBe("已加入的团队");
    expect(normalizeWorkspaceShellLocale("en-US")).toBe("en");
  });
});

describe("workspace-shell pure helpers", () => {
  test("keeps workspace route resolution centralized", () => {
    expect(
      resolveWorkspaceRouteEffect({
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

  test("excludes undated tasks from date views while keeping all-task counts intact", () => {
    const result = deriveWorkspaceTaskView({
      dateView: "upcoming",
      selectedDate: "2026-04-24",
      taskFilter: "all",
      todayDateValue: "2026-04-21",
      todos,
    });

    expect(result.taskCounts).toEqual({
      all: 4,
      active: 3,
      completed: 1,
    });
    expect(result.dateViewCounts).toEqual({
      all: 4,
      "due-today": 1,
      upcoming: 2,
    });
    expect(result.filteredTodos.map((todo) => todo.id)).toEqual([
      "todo-upcoming",
      "todo-completed-upcoming",
    ]);
    expect(result.selectedDateTodos.map((todo) => todo.id)).toEqual(["todo-completed-upcoming"]);
  });

  test("shares join/create flow helpers across website and desktop surfaces", () => {
    expect(extractInviteCode("https://example.com/join?invite=team-token")).toBe("team-token");
    expect(
      getCreateInviteSuccessOutcome({
        token: "invite-token",
        expiresAt: "2026-04-28T00:00:00.000Z",
      }),
    ).toEqual({
      code: "invite-token",
      expiresAt: "2026-04-28T00:00:00.000Z",
      message:
        "Invite ready to share. Teammates can paste this code into the desktop or dashboard join flow.",
    });
    expect(
      getJoinTeamSuccessOutcome(
        {
          id: "team-joined",
          name: "Research",
          teamId: "team-joined",
        },
        {
          activeWorkspaceId: "personal:user-1",
          navigationLabel: "desktop navigation",
          teamSection: "tasks",
        },
      ),
    ).toEqual({
      route: { name: "team-detail", teamId: "team-joined", section: "tasks" },
      routeNotice:
        "You can now work in Research. My workspace stays available from desktop navigation.",
      selectWorkspaceId: "team-joined",
    });
    expect(
      getJoinInviteFailureFeedback({
        error: new Error("fallback error"),
        lastError: "That invite is no longer active.",
        lastErrorKind: "notice",
      }),
    ).toEqual({
      kind: "notice",
      message: "That invite is no longer active.",
    });
  });
});
