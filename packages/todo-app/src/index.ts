export type {
  TodoAppController,
  TodoAppDependencies,
  TodoAppErrorKind,
  TodoAppSignInFieldErrors,
  TodoAppState,
  TodoAppStateListener,
  TodoAppStatus,
  TodoAppViewModel,
  TodoMutationKind,
} from "./state.ts";
export {
  createTodoAppController,
  createTodoAppViewModel,
  validateSignInFields,
  validateTodoDueDate,
  validateTodoDraft,
} from "./state.ts";

export const todoAppPackage = {
  name: "todo-app",
  responsibility:
    "Shared application state flow, optimistic mutation orchestration, and view-model helpers.",
  plannedTasks: ["3.1", "3.2", "3.3", "3.4", "4.1"],
} as const;

export const todoSharedPackageLayout = ["todo-domain", "todo-data", "todo-app"] as const;
