import type { TodoAppState } from "todo-app";
import {
  deriveWorkspaceTaskView,
  type WorkspaceDateView,
  type WorkspaceTaskFilter,
} from "workspace-shell";

type DesktopTodoItem = TodoAppState["todos"][number];

export type DesktopTaskFilter = WorkspaceTaskFilter;
export type DesktopDateView = WorkspaceDateView;

export function deriveDesktopTaskView(
  todos: DesktopTodoItem[],
  taskFilter: DesktopTaskFilter,
  dateView: DesktopDateView,
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
