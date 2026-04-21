import { describe, expect, test } from "vite-plus/test";

import { deriveDesktopTaskView } from "./task-view.ts";

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

describe("deriveDesktopTaskView", () => {
  test("computes task-filter counts across the full workspace list", () => {
    expect(
      deriveDesktopTaskView(todos, "all", "all", "2026-04-21", "2026-04-21").taskCounts,
    ).toEqual({
      all: 4,
      active: 3,
      completed: 1,
    });
  });

  test("excludes undated tasks from due-today and upcoming date views", () => {
    const result = deriveDesktopTaskView(todos, "all", "upcoming", "2026-04-21", "2026-04-21");

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

  test("applies the task filter before computing date-view slices", () => {
    const result = deriveDesktopTaskView(
      todos,
      "completed",
      "upcoming",
      "2026-04-21",
      "2026-04-24",
    );

    expect(result.dateViewCounts).toEqual({
      all: 1,
      "due-today": 0,
      upcoming: 1,
    });
    expect(result.filteredTodos.map((todo) => todo.id)).toEqual(["todo-completed-upcoming"]);
  });

  test("keeps selected-day inspection scoped to dated tasks that survive the status filter", () => {
    const result = deriveDesktopTaskView(todos, "completed", "all", "2026-04-21", "2026-04-24");

    expect(result.selectedDateTodos.map((todo) => todo.id)).toEqual(["todo-completed-upcoming"]);
    expect(result.selectedDateTodos.every((todo) => todo.dueDate !== null)).toBe(true);
  });
});
