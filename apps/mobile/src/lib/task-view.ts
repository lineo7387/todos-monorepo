import type { TodoAppState } from "todo-app";
import {
  deriveWorkspaceTaskView,
  type WorkspaceDateView,
  type WorkspaceTaskFilter,
} from "workspace-shell";

type MobileTodoItem = TodoAppState["todos"][number];

export type MobileTaskFilter = WorkspaceTaskFilter;
export type MobileDateView = WorkspaceDateView;

export function getCurrentDateValue(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function formatSelectedDateLabel(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function deriveMobileTaskView(
  todos: MobileTodoItem[],
  taskFilter: MobileTaskFilter,
  dateView: MobileDateView,
  todayDateValue: string,
  selectedDate: string,
) {
  return deriveWorkspaceTaskView({
    dateView,
    selectedDate,
    taskFilter,
    todayDateValue,
    todos,
  });
}
