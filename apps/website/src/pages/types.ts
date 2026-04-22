import { createTodoAppViewModel, type TodoAppState } from "todo-app";

export type WebsiteTodoItem = TodoAppState["todos"][number];
export type WebsiteWorkspace = NonNullable<
  ReturnType<typeof createTodoAppViewModel>["activeWorkspace"]
>;
export type WorkspaceTaskFilter = "all" | "active" | "completed";
export type WorkspaceDateView = "all" | "due-today" | "upcoming";
