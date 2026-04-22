export const workspaceShellPageIds = {
  dashboard: "dashboard",
  personalWorkspace: "personal-workspace",
  teamList: "team-list",
  teamDetail: "team-detail",
  joinTeam: "join-team",
  createTeam: "create-team",
} as const;

export type WorkspaceShellPageId =
  (typeof workspaceShellPageIds)[keyof typeof workspaceShellPageIds];

export type WorkspaceShellWorkspaceSection = "tasks" | "date";
export type WorkspaceShellTeamSection = WorkspaceShellWorkspaceSection | "invite";
export type WorkspaceTaskFilter = "all" | "active" | "completed";
export type WorkspaceDateView = "all" | "due-today" | "upcoming";

export interface WorkspaceShellRouteParamMap {
  dashboard: Record<string, never>;
  "personal-workspace": {
    section?: WorkspaceShellWorkspaceSection;
  };
  "team-list": Record<string, never>;
  "team-detail": {
    teamId: string;
    section?: WorkspaceShellTeamSection;
  };
  "join-team": Record<string, never>;
  "create-team": Record<string, never>;
}

export type WorkspaceShellRoute =
  | { name: "dashboard" }
  | { name: "personal-workspace"; section?: WorkspaceShellWorkspaceSection }
  | { name: "team-list" }
  | { name: "team-detail"; teamId: string; section?: WorkspaceShellTeamSection }
  | { name: "join-team" }
  | { name: "create-team" };

export const workspaceShellTranslationNamespaces = {
  root: "workspace-shell",
  pages: "workspace-shell.pages",
  destinations: "workspace-shell.destinations",
  navigation: "workspace-shell.navigation",
  actions: "workspace-shell.actions",
  feedback: "workspace-shell.feedback",
  emptyStates: "workspace-shell.emptyStates",
  terms: "workspace-shell.terms",
} as const;

export const workspaceShellTranslationKeys = {
  terms: {
    dashboard: "workspace-shell.terms.dashboard",
    myWorkspace: "workspace-shell.terms.myWorkspace",
    team: "workspace-shell.terms.team",
  },
  destinations: {
    dashboard: {
      label: "workspace-shell.destinations.dashboard.label",
    },
    personalWorkspace: {
      label: "workspace-shell.destinations.personalWorkspace.label",
    },
    teamList: {
      label: "workspace-shell.destinations.teamList.label",
    },
    teamDetail: {
      label: "workspace-shell.destinations.teamDetail.label",
    },
    joinTeam: {
      label: "workspace-shell.destinations.joinTeam.label",
    },
    createTeam: {
      label: "workspace-shell.destinations.createTeam.label",
    },
  },
  navigation: {
    heading: "workspace-shell.navigation.heading",
    subtitle: "workspace-shell.navigation.subtitle",
    joinedTeams: "workspace-shell.navigation.joinedTeams",
  },
  feedback: {
    unavailableTeam: "workspace-shell.feedback.unavailableTeam",
    joinTeamSuccess: "workspace-shell.feedback.joinTeamSuccess",
    createInviteReady: "workspace-shell.feedback.createInviteReady",
  },
} as const;

export const workspaceShellLocales = ["en", "zh-CN"] as const;
export type WorkspaceShellLocale = (typeof workspaceShellLocales)[number];

export interface WorkspaceShellResources {
  terms: {
    dashboard: string;
    myWorkspace: string;
    team: string;
  };
  destinations: {
    dashboard: {
      label: string;
    };
    personalWorkspace: {
      label: string;
    };
    teamList: {
      label: string;
    };
    teamDetail: {
      label: string;
    };
    joinTeam: {
      label: string;
    };
    createTeam: {
      label: string;
    };
  };
  navigation: {
    heading: string;
    subtitle: string;
    joinedTeams: string;
  };
  feedback: {
    unavailableTeam: string;
    joinTeamSuccess: string;
    createInviteReady: string;
  };
}

export {
  WorkspaceShellCreateTeamPage,
  type WorkspaceShellCreateTeamPageProps,
} from "./create-team-page.tsx";

export {
  WorkspaceShellDashboardPage,
  type WorkspaceShellDashboardAction,
  type WorkspaceShellDashboardPageProps,
  type WorkspaceShellDashboardStat,
} from "./dashboard-page.tsx";

export {
  WorkspaceShellJoinTeamPage,
  type WorkspaceShellJoinTeamFeedback,
  type WorkspaceShellJoinTeamPageProps,
} from "./join-team-page.tsx";

export {
  WorkspaceShellTeamListPage,
  type WorkspaceShellTeamListPageProps,
  type WorkspaceShellTeamListPageTeam,
} from "./team-list-page.tsx";

export {
  WorkspaceShellTaskComposer,
  type WorkspaceShellTaskComposerProps,
} from "./task-composer.tsx";

export {
  WorkspaceShellWorkspaceHeader,
  type WorkspaceShellHeaderWorkspace,
  type WorkspaceShellWorkspaceHeaderProps,
} from "./workspace-header.tsx";

export {
  WorkspaceTopNavigation,
  type RenderWorkspaceTopNavigationActionInput,
  type WorkspaceTopNavigationItem,
  type WorkspaceTopNavigationProps,
  type WorkspaceTopNavigationTeam,
} from "./top-level-navigation.tsx";

export const workspaceShellResources: Record<WorkspaceShellLocale, WorkspaceShellResources> = {
  en: {
    terms: {
      dashboard: "Dashboard",
      myWorkspace: "My workspace",
      team: "Team",
    },
    destinations: {
      dashboard: {
        label: "Dashboard",
      },
      personalWorkspace: {
        label: "My workspace",
      },
      teamList: {
        label: "Teams",
      },
      teamDetail: {
        label: "Team detail",
      },
      joinTeam: {
        label: "Join team",
      },
      createTeam: {
        label: "Create team",
      },
    },
    navigation: {
      heading: "Workspace navigation",
      subtitle: "Move between dashboard, my workspace, and team actions.",
      joinedTeams: "Joined teams",
    },
    feedback: {
      unavailableTeam: "That team is not available in your current memberships.",
      joinTeamSuccess:
        "You can now work in {{teamName}}. My workspace stays available from {{navigationLabel}}.",
      createInviteReady:
        "Invite ready to share. Teammates can paste this code into the {{joinSurface}}.",
    },
  },
  "zh-CN": {
    terms: {
      dashboard: "仪表盘",
      myWorkspace: "我的工作区",
      team: "团队",
    },
    destinations: {
      dashboard: {
        label: "仪表盘",
      },
      personalWorkspace: {
        label: "我的工作区",
      },
      teamList: {
        label: "团队",
      },
      teamDetail: {
        label: "团队详情",
      },
      joinTeam: {
        label: "加入团队",
      },
      createTeam: {
        label: "创建团队",
      },
    },
    navigation: {
      heading: "工作区导航",
      subtitle: "在仪表盘、我的工作区和团队操作之间切换。",
      joinedTeams: "已加入的团队",
    },
    feedback: {
      unavailableTeam: "当前成员关系中没有这个团队。",
      joinTeamSuccess:
        "你现在可以在 {{teamName}} 中协作。你仍可从 {{navigationLabel}} 进入我的工作区。",
      createInviteReady: "邀请已准备好分享。队友可以在 {{joinSurface}} 中粘贴这段邀请码。",
    },
  },
} as const;

export interface ResolveWorkspaceRouteEffectInput {
  activeWorkspaceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  personalWorkspaceId: string | null;
  route: WorkspaceShellRoute;
  routedTeamWorkspaceId: string | null;
}

export interface ResolveWorkspaceRouteEffectResult {
  redirectRoute: WorkspaceShellRoute | null;
  routeNotice: string | null;
  selectWorkspaceId: string | null;
}

type TodoLike = {
  completed: boolean;
  dueDate: string | null;
};

export interface DeriveWorkspaceTaskViewInput<TTodo extends TodoLike> {
  dateView: WorkspaceDateView;
  selectedDate: string;
  taskFilter: WorkspaceTaskFilter;
  todayDateValue: string;
  todos: readonly TTodo[];
}

export interface DeriveWorkspaceTaskViewResult<TTodo extends TodoLike> {
  dateViewCounts: Record<WorkspaceDateView, number>;
  filteredTodos: TTodo[];
  selectedDateTodos: TTodo[];
  taskCounts: Record<WorkspaceTaskFilter, number>;
}

type WorkspaceSummary = {
  id: string;
  name: string;
  teamId?: string | null;
};

export interface JoinTeamSuccessOutcome {
  route: WorkspaceShellRoute;
  routeNotice: string;
  selectWorkspaceId?: string | null;
}

type InviteRecord = {
  token: string;
  expiresAt: string;
};

type JoinInviteFailureInput = {
  error: unknown;
  lastError: string | null;
  lastErrorKind: string | null;
};

function interpolateTemplate(template: string, values: Record<string, string>): string {
  return template.replaceAll(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}

export function normalizeWorkspaceShellLocale(
  locale: string | null | undefined,
): WorkspaceShellLocale {
  if (!locale) {
    return "en";
  }

  if (locale === "zh-CN" || locale.toLowerCase() === "zh-cn" || locale.toLowerCase() === "zh") {
    return "zh-CN";
  }

  return "en";
}

export function getWorkspaceShellResource(locale?: string | null): WorkspaceShellResources {
  return workspaceShellResources[normalizeWorkspaceShellLocale(locale)];
}

export function getDefaultWorkspaceRoute(): WorkspaceShellRoute {
  return { name: "dashboard" };
}

export function isWorkspaceRouteActive(
  currentRoute: WorkspaceShellRoute,
  route: WorkspaceShellRoute,
): boolean {
  if (route.name === "team-list") {
    return currentRoute.name === "team-list" || currentRoute.name === "team-detail";
  }

  if (route.name === "team-detail") {
    return currentRoute.name === "team-detail" && currentRoute.teamId === route.teamId;
  }

  return currentRoute.name === route.name;
}

export function getWorkspaceSection(route: WorkspaceShellRoute): WorkspaceShellWorkspaceSection {
  if (route.name === "personal-workspace" || route.name === "team-detail") {
    return route.section === "date" ? "date" : "tasks";
  }

  return "tasks";
}

export function getTeamSection(route: WorkspaceShellRoute): WorkspaceShellTeamSection {
  if (route.name === "team-detail") {
    if (route.section === "date" || route.section === "invite") {
      return route.section;
    }
  }

  return "tasks";
}

export function getWorkspaceRouteTitle(
  route: WorkspaceShellRoute,
  teamName?: string,
  locale?: string | null,
): string {
  const resource = getWorkspaceShellResource(locale);

  switch (route.name) {
    case "dashboard":
      return resource.destinations.dashboard.label;
    case "personal-workspace":
      return resource.destinations.personalWorkspace.label;
    case "team-list":
      return resource.destinations.teamList.label;
    case "team-detail":
      return teamName ? teamName : resource.destinations.teamDetail.label;
    case "join-team":
      return resource.destinations.joinTeam.label;
    case "create-team":
      return resource.destinations.createTeam.label;
  }
}

export function resolveWorkspaceRouteEffect(
  input: ResolveWorkspaceRouteEffectInput,
): ResolveWorkspaceRouteEffectResult {
  if (!input.isAuthenticated) {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (input.route.name === "personal-workspace") {
    if (input.personalWorkspaceId && input.activeWorkspaceId !== input.personalWorkspaceId) {
      return {
        redirectRoute: null,
        routeNotice: null,
        selectWorkspaceId: input.personalWorkspaceId,
      };
    }

    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (input.route.name !== "team-detail") {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: null,
    };
  }

  if (!input.routedTeamWorkspaceId) {
    if (input.isLoading) {
      return {
        redirectRoute: null,
        routeNotice: null,
        selectWorkspaceId: null,
      };
    }

    return {
      redirectRoute: { name: "team-list" },
      routeNotice: getWorkspaceShellResource().feedback.unavailableTeam,
      selectWorkspaceId: null,
    };
  }

  if (input.activeWorkspaceId !== input.routedTeamWorkspaceId) {
    return {
      redirectRoute: null,
      routeNotice: null,
      selectWorkspaceId: input.routedTeamWorkspaceId,
    };
  }

  return {
    redirectRoute: null,
    routeNotice: null,
    selectWorkspaceId: null,
  };
}

export function deriveWorkspaceTaskView<TTodo extends TodoLike>(
  input: DeriveWorkspaceTaskViewInput<TTodo>,
): DeriveWorkspaceTaskViewResult<TTodo> {
  const taskCounts = {
    all: input.todos.length,
    active: input.todos.filter((todo) => !todo.completed).length,
    completed: input.todos.filter((todo) => todo.completed).length,
  } satisfies Record<WorkspaceTaskFilter, number>;

  const statusFilteredTodos = input.todos.filter((todo) => {
    if (input.taskFilter === "active") {
      return !todo.completed;
    }

    if (input.taskFilter === "completed") {
      return todo.completed;
    }

    return true;
  });

  const dateViewCounts = {
    all: statusFilteredTodos.length,
    "due-today": statusFilteredTodos.filter((todo) => todo.dueDate === input.todayDateValue).length,
    upcoming: statusFilteredTodos.filter(
      (todo) => todo.dueDate !== null && todo.dueDate > input.todayDateValue,
    ).length,
  } satisfies Record<WorkspaceDateView, number>;

  const filteredTodos = statusFilteredTodos.filter((todo) => {
    if (input.dateView === "due-today") {
      return todo.dueDate === input.todayDateValue;
    }

    if (input.dateView === "upcoming") {
      return todo.dueDate !== null && todo.dueDate > input.todayDateValue;
    }

    return true;
  });

  const selectedDateTodos = statusFilteredTodos.filter(
    (todo) => todo.dueDate === input.selectedDate,
  );

  return {
    dateViewCounts,
    filteredTodos,
    selectedDateTodos,
    taskCounts,
  };
}

export function extractInviteCode(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return "";
  }

  try {
    const url = new URL(trimmedValue);
    const inviteCode = url.searchParams.get("invite");

    return inviteCode?.trim() || trimmedValue;
  } catch {
    return trimmedValue;
  }
}

export function getCreateInviteSuccessOutcome(
  invite: InviteRecord,
  joinSurface = "desktop or dashboard join flow",
) {
  const template = getWorkspaceShellResource().feedback.createInviteReady;

  return {
    code: invite.token,
    expiresAt: invite.expiresAt,
    message: interpolateTemplate(template, { joinSurface }),
  };
}

export function getJoinTeamSuccessOutcome<TWorkspace extends WorkspaceSummary>(
  workspace: TWorkspace,
  options?: {
    activeWorkspaceId?: string | null;
    navigationLabel?: string;
    teamSection?: WorkspaceShellTeamSection;
  },
): JoinTeamSuccessOutcome {
  const template = getWorkspaceShellResource().feedback.joinTeamSuccess;
  const outcome: JoinTeamSuccessOutcome = {
    route: {
      name: "team-detail",
      teamId: workspace.teamId ?? workspace.id,
      ...(options?.teamSection ? { section: options.teamSection } : {}),
    } satisfies WorkspaceShellRoute,
    routeNotice: interpolateTemplate(template, {
      teamName: workspace.name,
      navigationLabel: options?.navigationLabel ?? "the top navigation",
    }),
  };

  if (options && "activeWorkspaceId" in options) {
    outcome.selectWorkspaceId = options.activeWorkspaceId === workspace.id ? null : workspace.id;
  }

  return outcome;
}

export function getJoinInviteFailureFeedback(input: JoinInviteFailureInput) {
  return {
    kind: input.lastErrorKind === "notice" ? "notice" : "error",
    message:
      input.lastError ??
      (input.error instanceof Error && input.error.message.length > 0
        ? input.error.message
        : "We couldn't accept that invite. Check the code and try again."),
  } as const;
}
