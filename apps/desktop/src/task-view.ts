import type { TodoAppState } from "todo-app";

type DesktopTodoItem = TodoAppState["todos"][number];

export type DesktopTaskFilter = "all" | "active" | "completed";
export type DesktopDateView = "all" | "due-today" | "upcoming";

export function deriveDesktopTaskView(
  todos: DesktopTodoItem[],
  taskFilter: DesktopTaskFilter,
  dateView: DesktopDateView,
  todayDateValue: string,
  selectedDate: string,
) {
  const taskCounts = {
    all: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length,
  } satisfies Record<DesktopTaskFilter, number>;

  const statusFilteredTodos = todos.filter((todo) => {
    if (taskFilter === "active") {
      return !todo.completed;
    }

    if (taskFilter === "completed") {
      return todo.completed;
    }

    return true;
  });

  const dateViewCounts = {
    all: statusFilteredTodos.length,
    "due-today": statusFilteredTodos.filter((todo) => todo.dueDate === todayDateValue).length,
    upcoming: statusFilteredTodos.filter(
      (todo) => todo.dueDate !== null && todo.dueDate > todayDateValue,
    ).length,
  } satisfies Record<DesktopDateView, number>;

  const filteredTodos = statusFilteredTodos.filter((todo) => {
    if (dateView === "due-today") {
      return todo.dueDate === todayDateValue;
    }

    if (dateView === "upcoming") {
      return todo.dueDate !== null && todo.dueDate > todayDateValue;
    }

    return true;
  });

  const selectedDateTodos = statusFilteredTodos.filter((todo) => todo.dueDate === selectedDate);

  return {
    dateViewCounts,
    filteredTodos,
    selectedDateTodos,
    taskCounts,
  };
}
