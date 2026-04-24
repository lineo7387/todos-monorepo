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

export type WorkspaceShellSignedInRouteKey =
  | "dashboard"
  | "personal-workspace"
  | "personal-workspace-tasks"
  | "personal-workspace-date"
  | "team-list"
  | "team-detail"
  | "team-detail-tasks"
  | "team-detail-date"
  | "team-detail-invite"
  | "join-team"
  | "create-team";

export interface WorkspaceShellSignedInRoutePattern {
  key: WorkspaceShellSignedInRouteKey;
  pageId: WorkspaceShellPageId;
  path: string;
}

export interface WorkspaceShellRouteHrefOptions {
  includeDefaultWorkspaceSection?: boolean;
}

export interface ParseWorkspaceShellRouteOptions {
  includeWorkspaceSections?: boolean;
}

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
    emptyTeams: string;
    joinedTeamsBody: string;
    body: string;
    teamLabel: string;
    primaryItems: {
      dashboard: string;
      personalWorkspace: string;
      teamList: string;
      joinTeam: string;
      createTeam: string;
    };
  };
  feedback: {
    unavailableTeam: string;
    joinTeamSuccess: string;
    createInviteReady: string;
  };
  pages: {
    dashboard: {
      heroBody: string;
      actions: {
        personalWorkspaceBody: string;
        personalWorkspaceFallbackTitle: string;
        teamListBody: string;
        teamListTitle: string;
        joinTeamBody: string;
        joinTeamTitle: string;
        createTeamBody: string;
        createTeamTitle: string;
      };
      stats: {
        personalWorkspaceFallback: string;
        nextFocusLabel: string;
        nextFocusValue: string;
      };
    };
    teamList: {
      body: string;
      emptyBody: string;
      emptyEyebrow: string;
      emptyTitle: string;
      teamCardBody: string;
    };
    joinTeam: {
      heroBody: string;
      inviteBody: string;
      inviteEyebrowLink: string;
      inviteEyebrowManual: string;
      inviteHeadingLink: string;
      inviteHeadingManual: string;
      nextBody: string;
      nextEyebrow: string;
      nextTitle: string;
      browseTeams: string;
    };
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

export { WorkspaceShellRouteCard, type WorkspaceShellRouteCardProps } from "./route-card.tsx";

export { WorkspaceShellTodoEditor, type WorkspaceShellTodoEditorProps } from "./todo-editor.tsx";

export {
  WorkspaceShellTaskComposer,
  type WorkspaceShellTaskComposerProps,
} from "./task-composer.tsx";

export {
  WorkspaceShellTodoRow,
  type WorkspaceShellTodoRowProps,
  type WorkspaceShellTodoRowTodo,
} from "./todo-row.tsx";

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
export {
  WorkspaceShellSignedInCreateTeamPage,
  WorkspaceShellSignedInDashboardPage,
  WorkspaceShellSignedInJoinTeamPage,
  WorkspaceShellSignedInTeamListPage,
  WorkspaceShellSignedInWorkspacePage,
  type RenderWorkspaceShellRouteActionInput,
  type WorkspaceShellSectionRoute,
  type WorkspaceShellSelectedDateTodo,
  type WorkspaceShellSignedInCreateTeamPageProps,
  type WorkspaceShellSignedInDashboardPageProps,
  type WorkspaceShellSignedInJoinTeamPageProps,
  type WorkspaceShellSignedInTeam,
  type WorkspaceShellSignedInTeamListPageProps,
  type WorkspaceShellSignedInWorkspacePageProps,
  type WorkspaceShellTeamInvitePanelState,
} from "./signed-in-pages.tsx";

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
      emptyTeams: "No joined teams yet. Create one or accept an invite.",
      joinedTeamsBody:
        "Jump directly into a dedicated team detail page from anywhere in the signed-in flow.",
      body: "The app keeps the workspace model route-driven, with joined teams available as dedicated destinations.",
      teamLabel: "Team",
      primaryItems: {
        dashboard: "Overview and quick entry points",
        personalWorkspace: "Personal tasks",
        teamList: "Joined teams",
        joinTeam: "Redeem an invite",
        createTeam: "Start a shared workspace",
      },
    },
    feedback: {
      unavailableTeam: "That team is not available in your current memberships.",
      joinTeamSuccess:
        "You can now work in {{teamName}}. My workspace stays available from {{navigationLabel}}.",
      createInviteReady:
        "Invite ready to share. Teammates can paste this code into the {{joinSurface}}.",
    },
    pages: {
      dashboard: {
        heroBody:
          "Signed-in workspace navigation now lands on a dedicated dashboard so each destination can keep its own stable page boundary.",
        actions: {
          personalWorkspaceBody: "Open your personal task list as its own focused page.",
          personalWorkspaceFallbackTitle: "Personal workspace",
          teamListBody: "Browse current memberships and jump to a dedicated team detail page.",
          teamListTitle: "{{count}} joined team{{plural}}",
          joinTeamBody:
            "Use a dedicated join surface instead of layering flows into one workspace screen.",
          joinTeamTitle: "Accept an invite",
          createTeamBody:
            "Create a team from its own page and continue into the resulting detail view.",
          createTeamTitle: "Start a shared workspace",
        },
        stats: {
          personalWorkspaceFallback: "Ready",
          nextFocusLabel: "Next focus",
          nextFocusValue: "Join and create flows",
        },
      },
      teamList: {
        body: "Open each shared workspace from its own dedicated destination.",
        emptyBody: "Create a team or redeem an invite to populate this list.",
        emptyEyebrow: "No joined teams yet",
        emptyTitle: "Your teams will appear here.",
        teamCardBody: "Open the dedicated page for this shared workspace.",
      },
      joinTeam: {
        heroBody:
          "Open a shared invite link or paste the invite code directly. After a successful join, the shared shell takes you straight into the team detail page.",
        inviteBody:
          "Invite acceptance stays inside the signed-in flow so the shared workspace appears in dashboard and team navigation as soon as membership is granted.",
        inviteEyebrowLink: "Invite link opened",
        inviteEyebrowManual: "Invite code",
        inviteHeadingLink: "We prefilled the invite for you.",
        inviteHeadingManual: "Paste an invite to continue.",
        nextBody:
          "The join action redeems the invite, refreshes your joined teams, and lands you in the target workspace while keeping your personal workspace available in navigation.",
        nextEyebrow: "What happens next",
        nextTitle: "Membership sync keeps the workspace list current.",
        browseTeams: "Browse current teams",
      },
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
      emptyTeams: "还没有加入团队。你可以创建一个团队或接受邀请。",
      joinedTeamsBody: "在已登录流程的任意位置直接进入专用团队详情页。",
      body: "应用会保持由路由驱动的工作区模型，并把已加入团队作为专用目的地。",
      teamLabel: "团队",
      primaryItems: {
        dashboard: "总览和快速入口",
        personalWorkspace: "个人任务",
        teamList: "已加入团队",
        joinTeam: "兑换邀请",
        createTeam: "创建共享工作区",
      },
    },
    feedback: {
      unavailableTeam: "当前成员关系中没有这个团队。",
      joinTeamSuccess:
        "你现在可以在 {{teamName}} 中协作。你仍可从 {{navigationLabel}} 进入我的工作区。",
      createInviteReady: "邀请已准备好分享。队友可以在 {{joinSurface}} 中粘贴这段邀请码。",
    },
    pages: {
      dashboard: {
        heroBody: "已登录的工作区导航会先进入专用仪表盘，让每个目的地都有稳定的页面边界。",
        actions: {
          personalWorkspaceBody: "打开专用的个人任务列表页面。",
          personalWorkspaceFallbackTitle: "个人工作区",
          teamListBody: "浏览当前成员关系，并进入专用团队详情页。",
          teamListTitle: "{{count}} 个已加入团队",
          joinTeamBody: "使用专用加入入口，而不是把流程叠在同一个工作区页面里。",
          joinTeamTitle: "接受邀请",
          createTeamBody: "从专用页面创建团队，并继续进入新团队详情页。",
          createTeamTitle: "开始共享工作区",
        },
        stats: {
          personalWorkspaceFallback: "已就绪",
          nextFocusLabel: "下一步",
          nextFocusValue: "加入和创建流程",
        },
      },
      teamList: {
        body: "从专用目的地打开每个共享工作区。",
        emptyBody: "创建团队或兑换邀请后，这里会出现团队列表。",
        emptyEyebrow: "还没有加入团队",
        emptyTitle: "你的团队会显示在这里。",
        teamCardBody: "打开这个共享工作区的专用页面。",
      },
      joinTeam: {
        heroBody:
          "打开共享邀请链接，或直接粘贴邀请码。成功加入后，共享 shell 会直接进入团队详情页。",
        inviteBody:
          "邀请接受流程保留在已登录流程中，成员关系生效后共享工作区会出现在仪表盘和团队导航里。",
        inviteEyebrowLink: "已打开邀请链接",
        inviteEyebrowManual: "邀请码",
        inviteHeadingLink: "我们已经为你填入邀请。",
        inviteHeadingManual: "粘贴邀请以继续。",
        nextBody:
          "加入操作会兑换邀请、刷新已加入团队，并进入目标工作区，同时个人工作区仍保留在导航中。",
        nextEyebrow: "接下来",
        nextTitle: "成员同步会保持工作区列表最新。",
        browseTeams: "浏览当前团队",
      },
    },
  },
} as const;

const baseSignedInRoutePatterns: WorkspaceShellSignedInRoutePattern[] = [
  {
    key: "dashboard",
    pageId: workspaceShellPageIds.dashboard,
    path: "/",
  },
  {
    key: "personal-workspace",
    pageId: workspaceShellPageIds.personalWorkspace,
    path: "/my-workspace",
  },
  {
    key: "team-list",
    pageId: workspaceShellPageIds.teamList,
    path: "/teams",
  },
  {
    key: "team-detail",
    pageId: workspaceShellPageIds.teamDetail,
    path: "/teams/:teamId",
  },
  {
    key: "join-team",
    pageId: workspaceShellPageIds.joinTeam,
    path: "/teams/join",
  },
  {
    key: "create-team",
    pageId: workspaceShellPageIds.createTeam,
    path: "/teams/new",
  },
];

const workspaceSectionRoutePatterns: WorkspaceShellSignedInRoutePattern[] = [
  {
    key: "personal-workspace-tasks",
    pageId: workspaceShellPageIds.personalWorkspace,
    path: "/my-workspace/tasks",
  },
  {
    key: "personal-workspace-date",
    pageId: workspaceShellPageIds.personalWorkspace,
    path: "/my-workspace/date",
  },
  {
    key: "team-detail-tasks",
    pageId: workspaceShellPageIds.teamDetail,
    path: "/teams/:teamId/tasks",
  },
  {
    key: "team-detail-date",
    pageId: workspaceShellPageIds.teamDetail,
    path: "/teams/:teamId/date",
  },
  {
    key: "team-detail-invite",
    pageId: workspaceShellPageIds.teamDetail,
    path: "/teams/:teamId/invite",
  },
];

export interface GetWorkspaceShellSignedInRoutePatternsOptions {
  includeWorkspaceSections?: boolean;
}

export function getWorkspaceShellSignedInRoutePatterns(
  options: GetWorkspaceShellSignedInRoutePatternsOptions = {},
): WorkspaceShellSignedInRoutePattern[] {
  return options.includeWorkspaceSections
    ? [...baseSignedInRoutePatterns, ...workspaceSectionRoutePatterns]
    : [...baseSignedInRoutePatterns];
}

export interface ResolveWorkspaceRouteEffectInput {
  activeWorkspaceId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  locale?: string | null;
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

export function getWorkspaceShellRouteHref(
  route: WorkspaceShellRoute,
  options?: WorkspaceShellRouteHrefOptions,
): string {
  switch (route.name) {
    case "dashboard":
      return "/";
    case "personal-workspace":
      if (route.section === "date") {
        return "/my-workspace/date";
      }

      return options?.includeDefaultWorkspaceSection ? "/my-workspace/tasks" : "/my-workspace";
    case "team-list":
      return "/teams";
    case "team-detail":
      if (route.section === "date") {
        return `/teams/${route.teamId}/date`;
      }

      if (route.section === "invite") {
        return `/teams/${route.teamId}/invite`;
      }

      return options?.includeDefaultWorkspaceSection
        ? `/teams/${route.teamId}/tasks`
        : `/teams/${route.teamId}`;
    case "join-team":
      return "/teams/join";
    case "create-team":
      return "/teams/new";
  }
}

export function parseWorkspaceShellRoute(
  pathname: string,
  options?: ParseWorkspaceShellRouteOptions,
): WorkspaceShellRoute {
  if (
    pathname === "/my-workspace" ||
    (options?.includeWorkspaceSections && pathname === "/my-workspace/tasks")
  ) {
    return options?.includeWorkspaceSections
      ? { name: "personal-workspace", section: "tasks" }
      : { name: "personal-workspace" };
  }

  if (options?.includeWorkspaceSections && pathname === "/my-workspace/date") {
    return { name: "personal-workspace", section: "date" };
  }

  if (pathname === "/teams") {
    return { name: "team-list" };
  }

  if (pathname === "/teams/new") {
    return { name: "create-team" };
  }

  if (pathname === "/teams/join") {
    return { name: "join-team" };
  }

  if (pathname.startsWith("/teams/")) {
    const [teamId, section] = pathname.slice("/teams/".length).split("/").filter(Boolean);

    if (teamId) {
      if (options?.includeWorkspaceSections && section === "date") {
        return { name: "team-detail", teamId, section: "date" };
      }

      if (options?.includeWorkspaceSections && section === "invite") {
        return { name: "team-detail", teamId, section: "invite" };
      }

      return options?.includeWorkspaceSections
        ? { name: "team-detail", teamId, section: "tasks" }
        : { name: "team-detail", teamId };
    }
  }

  return getDefaultWorkspaceRoute();
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
      routeNotice: getWorkspaceShellResource(input.locale).feedback.unavailableTeam,
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
  locale?: string | null,
) {
  const template = getWorkspaceShellResource(locale).feedback.createInviteReady;

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
    locale?: string | null;
    navigationLabel?: string;
    teamSection?: WorkspaceShellTeamSection;
  },
): JoinTeamSuccessOutcome {
  const template = getWorkspaceShellResource(options?.locale).feedback.joinTeamSuccess;
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
