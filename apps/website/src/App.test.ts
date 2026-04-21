import { describe, expect, test } from "vite-plus/test";

import {
  deriveWorkspaceTaskView,
  getJoinTeamSuccessOutcome,
  resolveWorkspaceRouteEffect,
} from "./App.tsx";

describe("resolveWorkspaceRouteEffect", () => {
  test("selects the personal workspace when the route targets my workspace", () => {
    expect(
      resolveWorkspaceRouteEffect({
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

  test("selects the team workspace when the route targets an available team", () => {
    expect(
      resolveWorkspaceRouteEffect({
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

  test("redirects unavailable team routes back to the team list once loading finishes", () => {
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
});

describe("getJoinTeamSuccessOutcome", () => {
  test("navigates to the joined team detail route and preserves the follow-up notice", () => {
    expect(
      getJoinTeamSuccessOutcome({
        id: "team-joined",
        kind: "team",
        name: "Research",
        teamId: "team-joined",
      }),
    ).toEqual({
      route: { name: "team-detail", teamId: "team-joined" },
      routeNotice:
        "You can now work in Research. My workspace stays available from the top navigation.",
    });
  });
});

describe("deriveWorkspaceTaskView", () => {
  const todos = [
    {
      id: "todo-undated-active",
      title: "Inbox task",
      completed: false,
      dueDate: null,
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
      workspace: {
        kind: "personal" as const,
        ownerUserId: "user-1",
      },
    },
    {
      id: "todo-due-today",
      title: "Ship release notes",
      completed: false,
      dueDate: "2026-04-21",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
      workspace: {
        kind: "personal" as const,
        ownerUserId: "user-1",
      },
    },
    {
      id: "todo-upcoming",
      title: "Prep planning",
      completed: false,
      dueDate: "2026-04-23",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
      workspace: {
        kind: "personal" as const,
        ownerUserId: "user-1",
      },
    },
    {
      id: "todo-completed-upcoming",
      title: "Archive notes",
      completed: true,
      dueDate: "2026-04-24",
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
      workspace: {
        kind: "personal" as const,
        ownerUserId: "user-1",
      },
    },
  ];

  test("computes status filter counts across all tasks", () => {
    expect(
      deriveWorkspaceTaskView({
        dateView: "all",
        selectedDate: "2026-04-21",
        taskFilter: "all",
        todayDateValue: "2026-04-21",
        todos,
      }).taskCounts,
    ).toEqual({
      all: 4,
      active: 3,
      completed: 1,
    });
  });

  test("excludes undated tasks from due-today and upcoming date views", () => {
    const result = deriveWorkspaceTaskView({
      dateView: "upcoming",
      selectedDate: "2026-04-21",
      taskFilter: "all",
      todayDateValue: "2026-04-21",
      todos,
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
    expect(result.filteredTodos.every((todo) => todo.dueDate !== null)).toBe(true);
  });

  test("applies the status filter before selected-date inspection and keeps undated tasks out", () => {
    const result = deriveWorkspaceTaskView({
      dateView: "all",
      selectedDate: "2026-04-24",
      taskFilter: "completed",
      todayDateValue: "2026-04-21",
      todos,
    });

    expect(result.dateViewCounts).toEqual({
      all: 1,
      "due-today": 0,
      upcoming: 1,
    });
    expect(result.selectedDateTodos.map((todo) => todo.id)).toEqual(["todo-completed-upcoming"]);
    expect(result.selectedDateTodos.every((todo) => todo.dueDate !== null)).toBe(true);
  });
});
