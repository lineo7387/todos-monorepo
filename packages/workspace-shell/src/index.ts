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

export const workspaceShellPersonalSections = ["tasks", "date"] as const;
export const workspaceShellTeamSections = ["tasks", "date", "invite"] as const;

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
    joinInviteFailure: "workspace-shell.feedback.joinInviteFailure",
    copyInviteCodeSuccess: "workspace-shell.feedback.copyInviteCodeSuccess",
    copyInviteLinkSuccess: "workspace-shell.feedback.copyInviteLinkSuccess",
    copyInviteFailure: "workspace-shell.feedback.copyInviteFailure",
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
    joinInviteFailure: string;
    copyInviteCodeSuccess: string;
    copyInviteLinkSuccess: string;
    copyInviteFailure: string;
  };
  actions: {
    addTask: string;
    browseTeams: string;
    cancel: string;
    copyCode: string;
    copyLink: string;
    createInvite: string;
    createTeam: string;
    delete: string;
    dismiss: string;
    edit: string;
    joinTeam: string;
    joiningTeam: string;
    languageToggle: string;
    noDate: string;
    refresh: string;
    save: string;
    signOut: string;
  };
  fields: {
    dueDate: string;
    dueDatePlaceholder: string;
    editTask: string;
    inviteCode: string;
    inviteCodeOrLinkPlaceholder: string;
    joinLink: string;
    newTask: string;
    selectedDate: string;
    selectedDatePlaceholder: string;
    teamName: string;
    teamNamePlaceholder: string;
    updateTaskTitlePlaceholder: string;
  };
  pages: {
    dashboard: {
      heading: string;
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
      dashboardEmptyBody: string;
      dashboardEmptyEyebrow: string;
      dashboardEmptyTitle: string;
      emptyBody: string;
      emptyEyebrow: string;
      emptyTitle: string;
      heading: string;
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
    createTeam: {
      body: string;
      heading: string;
      mobileBody: string;
      mobileHeading: string;
    };
    workspace: {
      allTeams: string;
      composerNoWorkspace: string;
      composerPersonal: string;
      composerTeam: string;
      datePanelBody: string;
      datePanelHeading: string;
      datePanelLabel: string;
      emptyMatchBody: string;
      emptyMatchEyebrow: string;
      emptyMatchTitle: string;
      emptyNoWorkspaceBody: string;
      emptyNoWorkspaceEyebrow: string;
      emptyNoWorkspaceTitle: string;
      emptyPersonalBody: string;
      emptyPersonalEyebrow: string;
      emptyPersonalTitle: string;
      emptyTeamBody: string;
      emptyTeamEyebrow: string;
      emptyTeamTitle: string;
      filterPanelBody: string;
      filterPanelHeading: string;
      filterPanelLabel: string;
      inviteExpires: string;
      invitePanelBody: string;
      invitePanelHeading: string;
      invitePanelLabel: string;
      noAvailableWorkspace: string;
      noWorkspaceDescription: string;
      noWorkspaceIntroBody: string;
      personalIntroBody: string;
      personalList: string;
      personalWorkspaceBadge: string;
      selectedDateBody: string;
      selectedDateEmpty: string;
      selectedDateLabel: string;
      selectedDateSummary: string;
      shareHint: string;
      shareLabel: string;
      sectionLabels: Record<WorkspaceShellTeamSection, string>;
      taskFilterLabels: Record<WorkspaceTaskFilter, string>;
      dateViewLabels: Record<WorkspaceDateView, string>;
      teamDetail: string;
      teamIntroBody: string;
      teamWorkspaceBadge: string;
    };
    todo: {
      due: string;
      syncing: string;
      updated: string;
      waitingForSupabase: string;
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
      joinInviteFailure: "We couldn't accept that invite. Check the code and try again.",
      copyInviteCodeSuccess: "Invite code copied.",
      copyInviteLinkSuccess: "Invite link copied.",
      copyInviteFailure: "Copy failed. You can still select the value and copy it manually.",
    },
    actions: {
      addTask: "Add task",
      browseTeams: "Browse current teams",
      cancel: "Cancel",
      copyCode: "Copy code",
      copyLink: "Copy link",
      createInvite: "Create invite",
      createTeam: "Create team",
      delete: "Delete",
      dismiss: "Dismiss",
      edit: "Edit",
      joinTeam: "Join team",
      joiningTeam: "Joining team...",
      languageToggle: "中文",
      noDate: "No date",
      refresh: "Refresh",
      save: "Save",
      signOut: "Sign out",
    },
    fields: {
      dueDate: "Due date",
      dueDatePlaceholder: "Due date (YYYY-MM-DD)",
      editTask: "Edit task",
      inviteCode: "Invite code",
      inviteCodeOrLinkPlaceholder: "Invite code or link",
      joinLink: "Join link",
      newTask: "New task",
      selectedDate: "Selected date",
      selectedDatePlaceholder: "Selected date (YYYY-MM-DD)",
      teamName: "Team name",
      teamNamePlaceholder: "Product Ops",
      updateTaskTitlePlaceholder: "Update task title",
    },
    pages: {
      dashboard: {
        heading: "Keep your workspaces moving from one place.",
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
        dashboardEmptyBody:
          "The dedicated join team and create team screens are now part of the mobile shell.",
        dashboardEmptyEyebrow: "No teams yet",
        dashboardEmptyTitle: "Join or create a team from its own destination.",
        emptyBody: "Create a team or redeem an invite to populate this list.",
        emptyEyebrow: "No joined teams yet",
        emptyTitle: "Your teams will appear here.",
        heading: "Team workspaces",
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
      createTeam: {
        body: "Successful creation sends you straight into the new team detail destination so the signed-in flow stays aligned across web and desktop.",
        heading: "Start a shared workspace from its own page.",
        mobileBody:
          "Create a team from its own mobile destination, then continue directly into team detail.",
        mobileHeading: "Create a shared workspace",
      },
      workspace: {
        allTeams: "All teams",
        composerNoWorkspace: "Select a workspace before adding a task",
        composerPersonal: "Add a task for yourself",
        composerTeam: "Add a task for this team",
        datePanelBody: "Only tasks with a due date appear in date-based views for this workspace.",
        datePanelHeading: "Browse dated tasks without turning this into a full calendar.",
        datePanelLabel: "Date view",
        emptyMatchBody:
          "Switch task filters or date views to review the rest of this workspace. Date-based views only include tasks that already have a due date.",
        emptyMatchEyebrow: "No matching tasks",
        emptyMatchTitle: "{{taskFilter}} tasks in {{dateView}} are clear right now.",
        emptyNoWorkspaceBody:
          "Once a workspace is available, new tasks and refresh actions will target that scope.",
        emptyNoWorkspaceEyebrow: "No workspace",
        emptyNoWorkspaceTitle: "Choose a workspace to begin.",
        emptyPersonalBody:
          "New personal tasks will appear here and persist for this account across app restarts.",
        emptyPersonalEyebrow: "No tasks yet",
        emptyPersonalTitle: "Create your first synced todo.",
        emptyTeamBody:
          "New team tasks will persist in Supabase and become visible to every member.",
        emptyTeamEyebrow: "Team workspace is empty",
        emptyTeamTitle: "Start the shared list for {{workspaceName}}.",
        filterPanelBody:
          "Narrow this workspace to all, active, or completed tasks without changing shared state.",
        filterPanelHeading: "Focus this workspace by status.",
        filterPanelLabel: "Task filter",
        inviteExpires: "Invite expires {{expiresAt}}.",
        invitePanelBody:
          "Create a reusable invite for this team workspace without leaving the shared signed-in flow.",
        invitePanelHeading: "Generate a reusable invite for {{workspaceName}}.",
        invitePanelLabel: "Invite teammates",
        noAvailableWorkspace: "No workspace available",
        noWorkspaceDescription: "No personal or team workspace is available for this account yet.",
        noWorkspaceIntroBody: "We could not resolve the workspace from the current route.",
        personalIntroBody:
          "These tasks belong to your personal workspace and follow your account across clients.",
        personalList: "Personal list",
        personalWorkspaceBadge: "Personal workspace",
        selectedDateBody:
          "View tasks due on {{selectedDateLabel}} for this workspace. This day view follows the current {{taskFilter}} filter and only includes tasks that already have a due date.",
        selectedDateEmpty: "No {{taskFilter}} tasks are due on this day.",
        selectedDateLabel: "Selected day",
        selectedDateSummary: "{{count}} task{{plural}}",
        shareHint:
          "Share this code in the join team flow so new members land on the same team detail page.",
        shareLabel: "How to share",
        sectionLabels: {
          tasks: "Tasks",
          date: "Date",
          invite: "Invite",
        },
        taskFilterLabels: {
          all: "All",
          active: "Active",
          completed: "Completed",
        },
        dateViewLabels: {
          all: "All tasks",
          "due-today": "Due today",
          upcoming: "Upcoming",
        },
        teamDetail: "Team detail",
        teamIntroBody: "Shared tasks stay in sync for every member of this team workspace.",
        teamWorkspaceBadge: "Team workspace",
      },
      todo: {
        due: "Due {{date}}",
        syncing: "Syncing",
        updated: "Updated",
        waitingForSupabase: "Waiting for Supabase",
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
      joinInviteFailure: "无法接受该邀请。请检查邀请码后重试。",
      copyInviteCodeSuccess: "邀请码已复制。",
      copyInviteLinkSuccess: "邀请链接已复制。",
      copyInviteFailure: "复制失败。你仍可以手动选择并复制该值。",
    },
    actions: {
      addTask: "添加任务",
      browseTeams: "浏览当前团队",
      cancel: "取消",
      copyCode: "复制邀请码",
      copyLink: "复制链接",
      createInvite: "创建邀请",
      createTeam: "创建团队",
      delete: "删除",
      dismiss: "关闭",
      edit: "编辑",
      joinTeam: "加入团队",
      joiningTeam: "正在加入团队...",
      languageToggle: "English",
      noDate: "不设日期",
      refresh: "刷新",
      save: "保存",
      signOut: "退出登录",
    },
    fields: {
      dueDate: "截止日期",
      dueDatePlaceholder: "截止日期 (YYYY-MM-DD)",
      editTask: "编辑任务",
      inviteCode: "邀请码",
      inviteCodeOrLinkPlaceholder: "邀请码或链接",
      joinLink: "加入链接",
      newTask: "新任务",
      selectedDate: "选中日期",
      selectedDatePlaceholder: "选中日期 (YYYY-MM-DD)",
      teamName: "团队名称",
      teamNamePlaceholder: "产品运营",
      updateTaskTitlePlaceholder: "更新任务标题",
    },
    pages: {
      dashboard: {
        heading: "从一个地方推进所有工作区。",
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
        dashboardEmptyBody: "专用加入团队和创建团队屏幕现在已经属于移动端 shell。",
        dashboardEmptyEyebrow: "还没有团队",
        dashboardEmptyTitle: "从专用目的地加入或创建团队。",
        emptyBody: "创建团队或兑换邀请后，这里会出现团队列表。",
        emptyEyebrow: "还没有加入团队",
        emptyTitle: "你的团队会显示在这里。",
        heading: "团队工作区",
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
      createTeam: {
        body: "创建成功后会直接进入新团队详情目的地，让 web 和 desktop 的已登录流程保持一致。",
        heading: "从专用页面开始共享工作区。",
        mobileBody: "从专用移动端目的地创建团队，然后直接进入团队详情。",
        mobileHeading: "创建共享工作区",
      },
      workspace: {
        allTeams: "所有团队",
        composerNoWorkspace: "先选择工作区再添加任务",
        composerPersonal: "为自己添加任务",
        composerTeam: "为这个团队添加任务",
        datePanelBody: "只有带截止日期的任务会出现在该工作区的日期视图中。",
        datePanelHeading: "浏览带日期的任务，但不把它扩展成完整日历。",
        datePanelLabel: "日期视图",
        emptyMatchBody:
          "切换任务筛选或日期视图以查看该工作区的其他内容。日期视图只包含已经设置截止日期的任务。",
        emptyMatchEyebrow: "没有匹配任务",
        emptyMatchTitle: "{{dateView}} 中的 {{taskFilter}}任务当前已清空。",
        emptyNoWorkspaceBody: "工作区可用后，新任务和刷新操作会作用于该范围。",
        emptyNoWorkspaceEyebrow: "没有工作区",
        emptyNoWorkspaceTitle: "选择一个工作区开始。",
        emptyPersonalBody: "新的个人任务会显示在这里，并在应用重启后继续保留在该账号下。",
        emptyPersonalEyebrow: "还没有任务",
        emptyPersonalTitle: "创建你的第一个同步待办。",
        emptyTeamBody: "新的团队任务会保存到 Supabase，并对每个成员可见。",
        emptyTeamEyebrow: "团队工作区为空",
        emptyTeamTitle: "开始 {{workspaceName}} 的共享列表。",
        filterPanelBody: "按全部、进行中或已完成任务聚焦该工作区，不改变共享状态。",
        filterPanelHeading: "按状态聚焦该工作区。",
        filterPanelLabel: "任务筛选",
        inviteExpires: "邀请过期时间 {{expiresAt}}。",
        invitePanelBody: "在不离开共享已登录流程的情况下，为这个团队工作区创建可复用邀请。",
        invitePanelHeading: "为 {{workspaceName}} 生成可复用邀请。",
        invitePanelLabel: "邀请队友",
        noAvailableWorkspace: "没有可用工作区",
        noWorkspaceDescription: "该账号还没有可用的个人或团队工作区。",
        noWorkspaceIntroBody: "无法从当前路由解析工作区。",
        personalIntroBody: "这些任务属于你的个人工作区，并会随账号跨客户端同步。",
        personalList: "个人列表",
        personalWorkspaceBadge: "个人工作区",
        selectedDateBody:
          "查看该工作区在 {{selectedDateLabel}} 截止的任务。这个日期视图会沿用当前 {{taskFilter}} 筛选，并且只包含已经设置截止日期的任务。",
        selectedDateEmpty: "这一天没有截止的{{taskFilter}}任务。",
        selectedDateLabel: "选中日期",
        selectedDateSummary: "{{count}} 个任务",
        shareHint: "在加入团队流程中分享这段邀请码，新成员会进入同一个团队详情页。",
        shareLabel: "如何分享",
        sectionLabels: {
          tasks: "任务",
          date: "日期",
          invite: "邀请",
        },
        taskFilterLabels: {
          all: "全部",
          active: "进行中",
          completed: "已完成",
        },
        dateViewLabels: {
          all: "所有任务",
          "due-today": "今天到期",
          upcoming: "即将到期",
        },
        teamDetail: "团队详情",
        teamIntroBody: "共享任务会为这个团队工作区的每个成员保持同步。",
        teamWorkspaceBadge: "团队工作区",
      },
      todo: {
        due: "截止 {{date}}",
        syncing: "同步中",
        updated: "已更新",
        waitingForSupabase: "等待 Supabase",
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
  locale?: string | null;
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

export function getNextWorkspaceShellLocale(locale?: string | null): WorkspaceShellLocale {
  return normalizeWorkspaceShellLocale(locale) === "en" ? "zh-CN" : "en";
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
  const resource = getWorkspaceShellResource(input.locale);

  return {
    kind: input.lastErrorKind === "notice" ? "notice" : "error",
    message:
      input.lastError ??
      (input.error instanceof Error && input.error.message.length > 0
        ? input.error.message
        : resource.feedback.joinInviteFailure),
  } as const;
}
