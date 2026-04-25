import { describe, expect, test } from "vite-plus/test";

import {
  deriveWorkspaceTaskView,
  extractInviteCode,
  getCreateInviteSuccessOutcome,
  getDefaultWorkspaceRoute,
  getJoinInviteFailureFeedback,
  getJoinTeamSuccessOutcome,
  getWorkspaceShellSignedInRoutePatterns,
  getWorkspaceShellResource,
  getWorkspaceShellRouteHref,
  getTeamSection,
  getWorkspaceRouteTitle,
  getWorkspaceSection,
  isWorkspaceRouteActive,
  normalizeWorkspaceShellLocale,
  parseWorkspaceShellRoute,
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

function flattenStringLeaves(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") {
    return { [prefix]: value };
  }

  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>((paths, [key, childValue]) => {
    return {
      ...paths,
      ...flattenStringLeaves(childValue, prefix ? `${prefix}.${key}` : key),
    };
  }, {});
}

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

  test("serializes shared route hrefs for web and desktop adapters", () => {
    expect(getWorkspaceShellRouteHref({ name: "dashboard" })).toBe("/");
    expect(getWorkspaceShellRouteHref({ name: "personal-workspace" })).toBe("/my-workspace");
    expect(
      getWorkspaceShellRouteHref(
        { name: "personal-workspace", section: "tasks" },
        { includeDefaultWorkspaceSection: true },
      ),
    ).toBe("/my-workspace/tasks");
    expect(getWorkspaceShellRouteHref({ name: "team-detail", teamId: "team-1" })).toBe(
      "/teams/team-1",
    );
    expect(
      getWorkspaceShellRouteHref(
        { name: "team-detail", teamId: "team-1", section: "invite" },
        { includeDefaultWorkspaceSection: true },
      ),
    ).toBe("/teams/team-1/invite");
    expect(getWorkspaceShellRouteHref({ name: "join-team" })).toBe("/teams/join");
    expect(getWorkspaceShellRouteHref({ name: "create-team" })).toBe("/teams/new");
  });

  test("parses shared route paths for web and desktop adapters", () => {
    expect(parseWorkspaceShellRoute("/")).toEqual({ name: "dashboard" });
    expect(parseWorkspaceShellRoute("/my-workspace")).toEqual({ name: "personal-workspace" });
    expect(parseWorkspaceShellRoute("/teams/team-1")).toEqual({
      name: "team-detail",
      teamId: "team-1",
    });
    expect(parseWorkspaceShellRoute("/teams/join")).toEqual({ name: "join-team" });
    expect(parseWorkspaceShellRoute("/teams/new")).toEqual({ name: "create-team" });
    expect(
      parseWorkspaceShellRoute("/my-workspace/date", { includeWorkspaceSections: true }),
    ).toEqual({
      name: "personal-workspace",
      section: "date",
    });
    expect(
      parseWorkspaceShellRoute("/teams/team-1/invite", { includeWorkspaceSections: true }),
    ).toEqual({
      name: "team-detail",
      teamId: "team-1",
      section: "invite",
    });
  });

  test("exposes shared signed-in route patterns for client adapters", () => {
    expect(getWorkspaceShellSignedInRoutePatterns()).toEqual([
      { key: "dashboard", pageId: "dashboard", path: "/" },
      { key: "personal-workspace", pageId: "personal-workspace", path: "/my-workspace" },
      { key: "team-list", pageId: "team-list", path: "/teams" },
      { key: "team-detail", pageId: "team-detail", path: "/teams/:teamId" },
      { key: "join-team", pageId: "join-team", path: "/teams/join" },
      { key: "create-team", pageId: "create-team", path: "/teams/new" },
    ]);
    expect(
      getWorkspaceShellSignedInRoutePatterns({ includeWorkspaceSections: true }).map(
        (routePattern) => routePattern.key,
      ),
    ).toEqual([
      "dashboard",
      "personal-workspace",
      "team-list",
      "team-detail",
      "join-team",
      "create-team",
      "personal-workspace-tasks",
      "personal-workspace-date",
      "team-detail-tasks",
      "team-detail-date",
      "team-detail-invite",
    ]);
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
    expect(getWorkspaceShellResource("zh").navigation.primaryItems.joinTeam).toBe("兑换邀请");
    expect(getWorkspaceShellResource("zh").pages.teamList.emptyTitle).toBe(
      "你的团队会显示在这里。",
    );
    expect(getWorkspaceShellResource("zh").actions.createInvite).toBe("创建邀请");
    expect(getWorkspaceShellResource("zh").fields.dueDatePlaceholder).toBe("截止日期 (YYYY-MM-DD)");
    expect(getWorkspaceShellResource("zh").pages.workspace.taskFilterLabels.active).toBe("进行中");
    expect(getWorkspaceShellResource("zh").pages.workspace.sectionLabels.invite).toBe("邀请");
    expect(getWorkspaceShellResource("zh").pages.todo.waitingForSupabase).toBe("等待 Supabase");
    expect(normalizeWorkspaceShellLocale("en-US")).toBe("en");
  });

  test("keeps localization resources structurally aligned and covers declared translation keys", () => {
    const englishResourcePaths = flattenStringLeaves(workspaceShellResources.en);
    const chineseResourcePaths = flattenStringLeaves(workspaceShellResources["zh-CN"]);
    const declaredTranslationPaths = Object.values(
      flattenStringLeaves(workspaceShellTranslationKeys),
    ).map((key) => key.replace("workspace-shell.", ""));

    expect(Object.keys(chineseResourcePaths).sort()).toEqual(
      Object.keys(englishResourcePaths).sort(),
    );

    for (const locale of workspaceShellLocales) {
      const resourcePaths = flattenStringLeaves(getWorkspaceShellResource(locale));

      for (const path of declaredTranslationPaths) {
        expect(resourcePaths[path], `${locale} is missing ${path}`).toEqual(expect.any(String));
        expect(
          resourcePaths[path].length,
          `${locale} has an empty value for ${path}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  test("keeps route labels, empty states, join/create feedback, and core terms aligned by locale", () => {
    const routeSamples = [
      { route: { name: "dashboard" } as const, resourceKey: "dashboard" },
      { route: { name: "personal-workspace" } as const, resourceKey: "personalWorkspace" },
      { route: { name: "team-list" } as const, resourceKey: "teamList" },
      { route: { name: "team-detail", teamId: "team-1" } as const, resourceKey: "teamDetail" },
      { route: { name: "join-team" } as const, resourceKey: "joinTeam" },
      { route: { name: "create-team" } as const, resourceKey: "createTeam" },
    ] as const;

    for (const locale of workspaceShellLocales) {
      const resource = getWorkspaceShellResource(locale);

      expect(resource.destinations.dashboard.label).toBe(resource.terms.dashboard);
      expect(resource.destinations.personalWorkspace.label).toBe(resource.terms.myWorkspace);
      expect(resource.navigation.teamLabel).toBe(resource.terms.team);

      for (const sample of routeSamples) {
        expect(getWorkspaceRouteTitle(sample.route, undefined, locale)).toBe(
          resource.destinations[sample.resourceKey].label,
        );
      }

      expect(
        [
          resource.pages.workspace.emptyNoWorkspaceTitle,
          resource.pages.workspace.emptyPersonalTitle,
          resource.pages.workspace.emptyTeamTitle,
          resource.pages.workspace.emptyMatchTitle,
          resource.pages.teamList.emptyTitle,
          resource.pages.teamList.dashboardEmptyTitle,
        ].every((value) => value.length > 0),
      ).toBe(true);
      expect(
        getCreateInviteSuccessOutcome(
          {
            token: "invite-token",
            expiresAt: "2026-04-28T00:00:00.000Z",
          },
          locale === "en" ? "desktop or dashboard join flow" : "桌面端或仪表盘加入流程",
          locale,
        ).message,
      ).toBe(
        resource.feedback.createInviteReady.replace(
          "{{joinSurface}}",
          locale === "en" ? "desktop or dashboard join flow" : "桌面端或仪表盘加入流程",
        ),
      );
      expect(
        getJoinTeamSuccessOutcome(
          {
            id: "team-joined",
            name: locale === "en" ? "Research" : "研究团队",
            teamId: "team-joined",
          },
          {
            locale,
            navigationLabel: locale === "en" ? "shared navigation" : "共享导航",
          },
        ).routeNotice,
      ).toBe(
        resource.feedback.joinTeamSuccess
          .replace("{{teamName}}", locale === "en" ? "Research" : "研究团队")
          .replace("{{navigationLabel}}", locale === "en" ? "shared navigation" : "共享导航"),
      );
    }
  });
});

describe("workspace-shell pure helpers", () => {
  test("keeps workspace route resolution centralized", () => {
    expect(
      resolveWorkspaceRouteEffect({
        activeWorkspaceId: "personal:user-1",
        isAuthenticated: true,
        isLoading: false,
        locale: "zh-CN",
        personalWorkspaceId: "personal:user-1",
        route: { name: "team-detail", teamId: "missing-team" },
        routedTeamWorkspaceId: null,
      }),
    ).toEqual({
      redirectRoute: { name: "team-list" },
      routeNotice: "当前成员关系中没有这个团队。",
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
      getCreateInviteSuccessOutcome(
        {
          token: "invite-token",
          expiresAt: "2026-04-28T00:00:00.000Z",
        },
        "桌面端加入流程",
        "zh-CN",
      ).message,
    ).toBe("邀请已准备好分享。队友可以在 桌面端加入流程 中粘贴这段邀请码。");
    expect(
      getJoinTeamSuccessOutcome(
        {
          id: "team-joined",
          name: "Research",
          teamId: "team-joined",
        },
        {
          activeWorkspaceId: "personal:user-1",
          locale: "zh-CN",
          navigationLabel: "桌面导航",
          teamSection: "tasks",
        },
      ),
    ).toEqual({
      route: { name: "team-detail", teamId: "team-joined", section: "tasks" },
      routeNotice: "你现在可以在 Research 中协作。你仍可从 桌面导航 进入我的工作区。",
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
