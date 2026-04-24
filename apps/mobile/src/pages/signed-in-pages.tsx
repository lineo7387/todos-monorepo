import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { TodoAppController, TodoAppState, TodoAppViewModel } from "todo-app";
import { getWorkspaceShellResource } from "workspace-shell";

import { Banner } from "../components/mobile-ui.tsx";
import { MobileTodoRow } from "../components/todo-row.tsx";
import { getMobileRouteTitle, isMobileRouteActive, type MobileRoute } from "../routing/routes.ts";
import { styles } from "../styles/mobile-shell.ts";

type MobileTodoItem = TodoAppState["todos"][number];
type MobileWorkspace = Exclude<TodoAppViewModel["activeWorkspace"], null>;

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getWorkspaceDescription(workspace: MobileWorkspace | null): string {
  if (!workspace) {
    return "No personal or team workspace is available for this account yet.";
  }

  return workspace.kind === "team"
    ? "Shared tasks stay in sync for every member of this team workspace."
    : "These tasks belong to your personal workspace and follow your account across clients.";
}

function getComposerPlaceholder(workspace: MobileWorkspace | null): string {
  if (!workspace) {
    return "Select a workspace before adding a task";
  }

  return workspace.kind === "team" ? "Add a task for this team" : "Add a task for yourself";
}

function getTaskFilterLabel(filter: "all" | "active" | "completed"): string {
  switch (filter) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    default:
      return "All";
  }
}

function getDateViewLabel(view: "all" | "due-today" | "upcoming"): string {
  switch (view) {
    case "due-today":
      return "Due today";
    case "upcoming":
      return "Upcoming";
    default:
      return "All tasks";
  }
}

function getEmptyStateCopy(workspace: MobileWorkspace | null) {
  if (!workspace) {
    return {
      eyebrow: "NO WORKSPACE",
      title: "Choose a workspace to begin.",
      body: "Once a workspace is available, new tasks and refresh actions will target that scope.",
    };
  }

  if (workspace.kind === "team") {
    return {
      eyebrow: "TEAM WORKSPACE IS EMPTY",
      title: `Start the shared list for ${workspace.name}.`,
      body: "New team tasks will persist in Supabase and become visible to every member.",
    };
  }

  return {
    eyebrow: "EMPTY LIST",
    title: "Create the first synced todo.",
    body: "New items will persist to Supabase and become available in the other clients.",
  };
}

function getTaskEmptyStateCopy(input: {
  dateView: "all" | "due-today" | "upcoming";
  hasAnyTodos: boolean;
  taskFilter: "all" | "active" | "completed";
  todosLength: number;
  workspace: MobileWorkspace | null;
}) {
  if (!input.hasAnyTodos) {
    return getEmptyStateCopy(input.workspace);
  }

  if (input.todosLength === 0) {
    return {
      eyebrow: "NO MATCHING TASKS",
      title: `${getTaskFilterLabel(input.taskFilter)} tasks in ${getDateViewLabel(
        input.dateView,
      ).toLowerCase()} are clear right now.`,
      body: "Switch task filters or date views to inspect the rest of this workspace. Date views only include tasks that already have a due date.",
    };
  }

  return null;
}

function MobileDestinationRail({
  disabled,
  onNavigate,
  route,
}: {
  disabled: boolean;
  onNavigate: (route: MobileRoute) => void;
  route: MobileRoute;
}) {
  const resource = getWorkspaceShellResource();
  const destinations = [
    {
      label: resource.destinations.dashboard.label,
      meta: "Overview",
      route: { name: "dashboard" } as const,
    },
    {
      label: resource.destinations.personalWorkspace.label,
      meta: "Personal tasks",
      route: { name: "personal-workspace" } as const,
    },
    {
      label: resource.destinations.teamList.label,
      meta: "Joined teams",
      route: { name: "team-list" } as const,
    },
    {
      label: resource.destinations.joinTeam.label,
      meta: "Invite flow",
      route: { name: "join-team" } as const,
    },
    {
      label: resource.destinations.createTeam.label,
      meta: "New shared space",
      route: { name: "create-team" } as const,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.destinationRail}
    >
      {destinations.map((destination) => {
        const active = isMobileRouteActive(route, destination.route);

        return (
          <Pressable
            disabled={disabled}
            key={destination.label}
            onPress={() => onNavigate(destination.route)}
            style={[
              styles.destinationCard,
              active ? styles.destinationCardActive : null,
              disabled ? styles.buttonDisabled : null,
            ]}
          >
            <Text style={[styles.destinationLabel, active ? styles.destinationLabelActive : null]}>
              {destination.label}
            </Text>
            <Text style={[styles.destinationMeta, active ? styles.destinationMetaActive : null]}>
              {destination.meta}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function WorkspaceScreen({
  canManageTodos,
  dateView,
  dateViewCounts,
  draftDueDate,
  draftTitle,
  editingTodoId,
  hasAnyTodos,
  onCancelEdit,
  onCreateTeamInvite,
  onCreateTodo,
  onDateViewChange,
  onDeleteTodo,
  onDraftDueDateChange,
  onDraftTitleChange,
  onNavigate,
  onSaveEdit,
  onSelectedDateChange,
  onStartEdit,
  onTaskFilterChange,
  onToggleComplete,
  pageWorkspace,
  pendingUi,
  personalWorkspace,
  route,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  taskCounts,
  taskFilter,
  teamInviteCode,
  teamInviteExpiresAt,
  teamInviteMessage,
  teamWorkspaces,
  todos,
}: {
  canManageTodos: boolean;
  dateView: "all" | "due-today" | "upcoming";
  dateViewCounts: Record<"all" | "due-today" | "upcoming", number>;
  draftDueDate: string;
  draftTitle: string;
  editingTodoId: string | null;
  hasAnyTodos: boolean;
  onCancelEdit: () => void;
  onCreateTeamInvite: () => void;
  onCreateTodo: () => void;
  onDateViewChange: (view: "all" | "due-today" | "upcoming") => void;
  onDeleteTodo: (todoId: string) => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onNavigate: (route: MobileRoute) => void;
  onSaveEdit: (todoId: string, title: string, dueDate: string) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onTaskFilterChange: (filter: "all" | "active" | "completed") => void;
  onToggleComplete: (todo: MobileTodoItem) => void;
  pageWorkspace: MobileWorkspace | null;
  pendingUi: boolean;
  personalWorkspace: MobileWorkspace | null;
  route: MobileRoute;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: MobileTodoItem[];
  taskCounts: Record<"all" | "active" | "completed", number>;
  taskFilter: "all" | "active" | "completed";
  teamInviteCode: string;
  teamInviteExpiresAt: string | null;
  teamInviteMessage: string | null;
  teamWorkspaces: MobileWorkspace[];
  todos: MobileTodoItem[];
}) {
  const emptyStateCopy = getTaskEmptyStateCopy({
    dateView,
    hasAnyTodos,
    taskFilter,
    todosLength: todos.length,
    workspace: pageWorkspace,
  });

  return (
    <View style={styles.stack}>
      <View style={styles.workspaceCard}>
        <Text style={styles.eyebrow}>
          {route.name === "team-detail" ? "TEAM DETAIL" : "MY WORKSPACE"}
        </Text>
        <Text style={styles.sectionTitle}>{pageWorkspace?.name ?? "No workspace available"}</Text>
        <Text style={styles.body}>{getWorkspaceDescription(pageWorkspace)}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.workspaceTabs}
        >
          {personalWorkspace ? (
            <Pressable
              disabled={pendingUi}
              onPress={() => onNavigate({ name: "personal-workspace" })}
              style={[
                styles.workspaceTab,
                route.name === "personal-workspace" ? styles.workspaceTabActive : null,
                pendingUi ? styles.buttonDisabled : null,
              ]}
            >
              <Text
                style={[
                  styles.workspaceTabLabel,
                  route.name === "personal-workspace" ? styles.workspaceTabLabelActive : null,
                ]}
              >
                {personalWorkspace.name}
              </Text>
              <Text
                style={[
                  styles.workspaceTabMeta,
                  route.name === "personal-workspace" ? styles.workspaceTabMetaActive : null,
                ]}
              >
                Personal list
              </Text>
            </Pressable>
          ) : null}

          {teamWorkspaces.map((workspace) => {
            const isActive = route.name === "team-detail" && route.teamId === workspace.teamId;

            return (
              <Pressable
                disabled={pendingUi}
                key={workspace.id}
                onPress={() => onNavigate({ name: "team-detail", teamId: workspace.teamId! })}
                style={[
                  styles.workspaceTab,
                  isActive ? styles.workspaceTabActive : null,
                  pendingUi ? styles.buttonDisabled : null,
                ]}
              >
                <Text
                  style={[
                    styles.workspaceTabLabel,
                    isActive ? styles.workspaceTabLabelActive : null,
                  ]}
                >
                  {workspace.name}
                </Text>
                <Text
                  style={[styles.workspaceTabMeta, isActive ? styles.workspaceTabMetaActive : null]}
                >
                  Team detail
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.composer}>
        <TextInput
          editable={canManageTodos}
          onChangeText={onDraftTitleChange}
          placeholder={getComposerPlaceholder(pageWorkspace)}
          style={styles.input}
          value={draftTitle}
        />
        <TextInput
          editable={canManageTodos}
          onChangeText={onDraftDueDateChange}
          placeholder="Due date (YYYY-MM-DD)"
          style={styles.input}
          value={draftDueDate}
        />
        <Pressable
          disabled={!canManageTodos}
          onPress={onCreateTodo}
          style={[styles.primaryButton, !canManageTodos ? styles.buttonDisabled : null]}
        >
          <Text style={styles.primaryButtonText}>Add task</Text>
        </Pressable>
      </View>

      <View style={styles.filterPanel}>
        <Text style={styles.sectionTitle}>Task filter</Text>
        <Text style={styles.sectionSubtitle}>
          Focus this workspace by status without changing shared business state.
        </Text>
        <View style={styles.chipRow}>
          {(["all", "active", "completed"] as const).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => onTaskFilterChange(filter)}
              style={[
                styles.filterChip,
                taskFilter === filter ? styles.filterChipActive : null,
                pendingUi ? styles.buttonDisabled : null,
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  taskFilter === filter ? styles.filterChipLabelActive : null,
                ]}
              >
                {getTaskFilterLabel(filter)}
              </Text>
              <Text
                style={[
                  styles.filterChipCount,
                  taskFilter === filter ? styles.filterChipLabelActive : null,
                ]}
              >
                {taskCounts[filter]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.filterPanel}>
        <Text style={styles.sectionTitle}>Date view</Text>
        <Text style={styles.sectionSubtitle}>
          Only tasks with a due date appear in due-today, upcoming, and selected-day inspection.
        </Text>
        <View style={styles.chipRow}>
          {(["all", "due-today", "upcoming"] as const).map((view) => (
            <Pressable
              key={view}
              onPress={() => onDateViewChange(view)}
              style={[
                styles.filterChip,
                dateView === view ? styles.filterChipActive : null,
                pendingUi ? styles.buttonDisabled : null,
              ]}
            >
              <Text
                style={[
                  styles.filterChipLabel,
                  dateView === view ? styles.filterChipLabelActive : null,
                ]}
              >
                {getDateViewLabel(view)}
              </Text>
              <Text
                style={[
                  styles.filterChipCount,
                  dateView === view ? styles.filterChipLabelActive : null,
                ]}
              >
                {dateViewCounts[view]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.filterPanel}>
        <Text style={styles.sectionTitle}>Selected day</Text>
        <Text style={styles.sectionSubtitle}>
          Inspect one day without turning the product into a full calendar.
        </Text>
        <TextInput
          onChangeText={onSelectedDateChange}
          placeholder="Selected date (YYYY-MM-DD)"
          style={styles.input}
          value={selectedDate}
        />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryPrimary}>{selectedDateLabel}</Text>
          <Text style={styles.summarySecondary}>
            {selectedDateTodos.length} {selectedDateTodos.length === 1 ? "task" : "tasks"}
          </Text>
        </View>
        {selectedDateTodos.length === 0 ? (
          <Text style={styles.body}>
            No {getTaskFilterLabel(taskFilter).toLowerCase()} tasks are due on this day.
          </Text>
        ) : (
          <View style={styles.stack}>
            {selectedDateTodos.map((todo) => (
              <View key={todo.id} style={styles.selectedDateCard}>
                <Text style={styles.selectedDateTitle}>{todo.title}</Text>
                <Text style={styles.selectedDateMeta}>
                  {todo.completed ? "Completed" : "Active"}
                  {todo.dueDate ? `, due ${todo.dueDate}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {route.name === "team-detail" && pageWorkspace?.kind === "team" ? (
        <View style={styles.filterPanel}>
          <Text style={styles.sectionTitle}>Invite teammates</Text>
          <Text style={styles.sectionSubtitle}>
            Generate a reusable invite for {pageWorkspace.name} without leaving team detail.
          </Text>
          <Pressable
            disabled={!canManageTodos}
            onPress={onCreateTeamInvite}
            style={[styles.secondaryButton, !canManageTodos ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Create invite</Text>
          </Pressable>
          {teamInviteMessage ? <Text style={styles.body}>{teamInviteMessage}</Text> : null}
          {teamInviteCode ? (
            <View style={styles.stack}>
              <View style={styles.summaryCard}>
                <Text style={styles.todoEyebrow}>INVITE CODE</Text>
                <Text style={styles.selectedDateTitle}>{teamInviteCode}</Text>
              </View>
              {teamInviteExpiresAt ? (
                <Text style={styles.body}>
                  Invite expires {formatDateTime(teamInviteExpiresAt)}.
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {emptyStateCopy ? (
        <View style={styles.emptyState}>
          <Text style={styles.eyebrow}>{emptyStateCopy.eyebrow}</Text>
          <Text style={styles.sectionTitle}>{emptyStateCopy.title}</Text>
          <Text style={styles.body}>{emptyStateCopy.body}</Text>
        </View>
      ) : null}

      {todos.map((todo) => (
        <MobileTodoRow
          disabled={!canManageTodos}
          isEditing={editingTodoId === todo.id}
          key={todo.id}
          onCancelEdit={onCancelEdit}
          onDelete={onDeleteTodo}
          onSaveEdit={onSaveEdit}
          onStartEdit={onStartEdit}
          onToggleComplete={onToggleComplete}
          todo={todo}
        />
      ))}
    </View>
  );
}

export function MobileSignedInPages({
  controller,
  dateView,
  dateViewCounts,
  draftDueDate,
  draftTeamName,
  draftTitle,
  editingTodoId,
  filteredTodos,
  hasAnyTodos,
  joinFeedback,
  joinInviteCode,
  onCancelEdit,
  onCreateTeam,
  onCreateTeamInvite,
  onCreateTodo,
  onDateViewChange,
  onDismissJoinFeedback,
  onDismissRouteNotice,
  onDraftDueDateChange,
  onDraftTeamNameChange,
  onDraftTitleChange,
  onJoinInviteCodeChange,
  onJoinTeam,
  onNavigate,
  onSaveEdit,
  onSelectedDateChange,
  onStartEdit,
  onTaskFilterChange,
  pendingUi,
  route,
  routeNotice,
  selectedDate,
  selectedDateLabel,
  selectedDateTodos,
  state,
  taskCounts,
  taskFilter,
  teamInviteCode,
  teamInviteExpiresAt,
  teamInviteMessage,
  viewModel,
}: {
  controller: TodoAppController;
  dateView: "all" | "due-today" | "upcoming";
  dateViewCounts: Record<"all" | "due-today" | "upcoming", number>;
  draftDueDate: string;
  draftTeamName: string;
  draftTitle: string;
  editingTodoId: string | null;
  filteredTodos: MobileTodoItem[];
  hasAnyTodos: boolean;
  joinFeedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  joinInviteCode: string;
  onCancelEdit: () => void;
  onCreateTeam: () => void;
  onCreateTeamInvite: () => void;
  onCreateTodo: () => void;
  onDateViewChange: (view: "all" | "due-today" | "upcoming") => void;
  onDismissJoinFeedback: () => void;
  onDismissRouteNotice: () => void;
  onDraftDueDateChange: (value: string) => void;
  onDraftTeamNameChange: (value: string) => void;
  onDraftTitleChange: (value: string) => void;
  onJoinInviteCodeChange: (value: string) => void;
  onJoinTeam: () => void;
  onNavigate: (route: MobileRoute) => void;
  onSaveEdit: (todoId: string, title: string, dueDate: string) => void;
  onSelectedDateChange: (value: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onTaskFilterChange: (filter: "all" | "active" | "completed") => void;
  pendingUi: boolean;
  route: MobileRoute;
  routeNotice: string | null;
  selectedDate: string;
  selectedDateLabel: string;
  selectedDateTodos: MobileTodoItem[];
  state: TodoAppState;
  taskCounts: Record<"all" | "active" | "completed", number>;
  taskFilter: "all" | "active" | "completed";
  teamInviteCode: string;
  teamInviteExpiresAt: string | null;
  teamInviteMessage: string | null;
  viewModel: TodoAppViewModel;
}) {
  const resource = getWorkspaceShellResource();
  const personalWorkspace =
    viewModel.workspaces.find((workspace) => workspace.kind === "personal") ?? null;
  const teamWorkspaces = viewModel.workspaces.filter(
    (workspace): workspace is MobileWorkspace => workspace.kind === "team",
  );
  const routedTeamWorkspace =
    route.name === "team-detail"
      ? (teamWorkspaces.find((workspace) => workspace.teamId === route.teamId) ?? null)
      : null;
  const pageWorkspace =
    route.name === "personal-workspace"
      ? personalWorkspace
      : route.name === "team-detail"
        ? routedTeamWorkspace
        : viewModel.activeWorkspace;
  const pageTitle = getMobileRouteTitle(route, routedTeamWorkspace?.name);

  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>MOBILE CLIENT</Text>
          <Text style={styles.sectionTitle}>{pageTitle}</Text>
          {state.session?.email ? (
            <Text style={styles.sessionText}>{state.session.email}</Text>
          ) : null}
        </View>

        <View style={styles.inlineActions}>
          <Pressable
            disabled={pendingUi}
            onPress={() => void controller.refresh().catch(() => {})}
            style={[styles.secondaryButton, pendingUi ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
          <Pressable
            disabled={pendingUi}
            onPress={() => void controller.signOut().catch(() => {})}
            style={[styles.ghostButton, pendingUi ? styles.buttonDisabled : null]}
          >
            <Text style={styles.ghostButtonText}>Sign out</Text>
          </Pressable>
        </View>
      </View>

      {viewModel.loadingMessage ? <Banner muted text={viewModel.loadingMessage} /> : null}
      {viewModel.pendingMessage ? <Banner text={viewModel.pendingMessage} /> : null}
      {viewModel.errorMessage ? (
        <Banner
          actionLabel="Dismiss"
          onAction={() => controller.clearError()}
          text={viewModel.errorMessage}
          tone={viewModel.errorKind === "notice" ? "accent" : "danger"}
        />
      ) : null}
      {routeNotice ? (
        <Banner actionLabel="Dismiss" onAction={onDismissRouteNotice} text={routeNotice} />
      ) : null}
      {joinFeedback && route.name === "join-team" ? (
        <Banner
          actionLabel="Dismiss"
          onAction={onDismissJoinFeedback}
          text={joinFeedback.message}
          tone={joinFeedback.kind === "notice" ? "accent" : "danger"}
        />
      ) : null}

      <View style={styles.workspaceCard}>
        <Text style={styles.eyebrow}>DESTINATIONS</Text>
        <Text style={styles.sectionTitle}>{resource.navigation.heading}</Text>
        <Text style={styles.sectionSubtitle}>{resource.navigation.subtitle}</Text>
        <MobileDestinationRail disabled={pendingUi} onNavigate={onNavigate} route={route} />
      </View>

      {route.name === "dashboard" ? (
        <View style={styles.stack}>
          <View style={styles.workspaceCard}>
            <Text style={styles.eyebrow}>DASHBOARD</Text>
            <Text style={styles.sectionTitle}>Choose where to work</Text>
            <Text style={styles.body}>
              Start from dashboard, jump into your personal workspace, browse joined teams, or open
              the dedicated join/create destinations.
            </Text>
          </View>

          <View style={styles.heroActionGrid}>
            <Pressable
              onPress={() => onNavigate({ name: "personal-workspace" })}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {resource.destinations.personalWorkspace.label}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigate({ name: "team-list" })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{resource.destinations.teamList.label}</Text>
            </Pressable>
            <Pressable onPress={() => onNavigate({ name: "join-team" })} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>{resource.destinations.joinTeam.label}</Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigate({ name: "create-team" })}
              style={styles.ghostButton}
            >
              <Text style={styles.ghostButtonText}>{resource.destinations.createTeam.label}</Text>
            </Pressable>
          </View>

          <View style={styles.workspaceCard}>
            <Text style={styles.eyebrow}>{resource.navigation.joinedTeams.toUpperCase()}</Text>
            <Text style={styles.sectionTitle}>Dedicated team detail destinations</Text>
            <Text style={styles.body}>
              Each joined team now has its own destination instead of being mixed into one combined
              screen.
            </Text>
            <View style={styles.stack}>
              {teamWorkspaces.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.eyebrow}>NO TEAMS YET</Text>
                  <Text style={styles.sectionTitle}>
                    Join or create a team from its own destination.
                  </Text>
                  <Text style={styles.body}>
                    The dedicated join team and create team screens are now part of the mobile
                    shell.
                  </Text>
                </View>
              ) : (
                teamWorkspaces.map((workspace) => (
                  <Pressable
                    key={workspace.id}
                    onPress={() => onNavigate({ name: "team-detail", teamId: workspace.teamId! })}
                    style={styles.workspaceTab}
                  >
                    <Text style={styles.workspaceTabLabel}>{workspace.name}</Text>
                    <Text style={styles.workspaceTabMeta}>Open team detail</Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>
      ) : null}

      {route.name === "team-list" ? (
        <View style={styles.stack}>
          <View style={styles.workspaceCard}>
            <Text style={styles.eyebrow}>TEAM LIST</Text>
            <Text style={styles.sectionTitle}>Browse joined teams</Text>
            <Text style={styles.body}>
              Team list is now a dedicated mobile destination and each entry opens a team detail
              page.
            </Text>
          </View>
          <View style={styles.stack}>
            {teamWorkspaces.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.eyebrow}>NO TEAM MEMBERSHIPS</Text>
                <Text style={styles.sectionTitle}>You have not joined a team yet.</Text>
                <Text style={styles.body}>
                  Use the dedicated join team or create team destinations to continue.
                </Text>
              </View>
            ) : (
              teamWorkspaces.map((workspace) => (
                <Pressable
                  key={workspace.id}
                  onPress={() => onNavigate({ name: "team-detail", teamId: workspace.teamId! })}
                  style={styles.workspaceTab}
                >
                  <Text style={styles.workspaceTabLabel}>{workspace.name}</Text>
                  <Text style={styles.workspaceTabMeta}>Open dedicated team detail</Text>
                </Pressable>
              ))
            )}
          </View>
          <View style={styles.inlineActions}>
            <Pressable
              onPress={() => onNavigate({ name: "join-team" })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{resource.destinations.joinTeam.label}</Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigate({ name: "create-team" })}
              style={styles.ghostButton}
            >
              <Text style={styles.ghostButtonText}>{resource.destinations.createTeam.label}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {route.name === "personal-workspace" || route.name === "team-detail" ? (
        <WorkspaceScreen
          canManageTodos={viewModel.canManageTodos}
          dateView={dateView}
          dateViewCounts={dateViewCounts}
          draftDueDate={draftDueDate}
          draftTitle={draftTitle}
          editingTodoId={editingTodoId}
          hasAnyTodos={hasAnyTodos}
          onCancelEdit={onCancelEdit}
          onCreateTeamInvite={onCreateTeamInvite}
          onCreateTodo={onCreateTodo}
          onDateViewChange={onDateViewChange}
          onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
          onDraftDueDateChange={onDraftDueDateChange}
          onDraftTitleChange={onDraftTitleChange}
          onNavigate={onNavigate}
          onSaveEdit={onSaveEdit}
          onSelectedDateChange={onSelectedDateChange}
          onStartEdit={onStartEdit}
          onTaskFilterChange={onTaskFilterChange}
          onToggleComplete={(todo) =>
            void (
              todo.completed ? controller.uncompleteTodo(todo.id) : controller.completeTodo(todo.id)
            ).catch(() => {})
          }
          pageWorkspace={pageWorkspace}
          pendingUi={pendingUi}
          personalWorkspace={personalWorkspace}
          route={route}
          selectedDate={selectedDate}
          selectedDateLabel={selectedDateLabel}
          selectedDateTodos={selectedDateTodos}
          taskCounts={taskCounts}
          taskFilter={taskFilter}
          teamInviteCode={teamInviteCode}
          teamInviteExpiresAt={teamInviteExpiresAt}
          teamInviteMessage={teamInviteMessage}
          teamWorkspaces={teamWorkspaces}
          todos={filteredTodos}
        />
      ) : null}

      {route.name === "join-team" ? (
        <View style={styles.emptyState}>
          <Text style={styles.eyebrow}>JOIN TEAM</Text>
          <Text style={styles.sectionTitle}>Redeem an invite</Text>
          <Text style={styles.body}>
            Paste an invite code or link. After a successful join, mobile lands in the dedicated
            team detail destination.
          </Text>
          <TextInput
            autoCapitalize="none"
            editable={!pendingUi}
            onChangeText={onJoinInviteCodeChange}
            placeholder="Invite code or link"
            style={styles.input}
            value={joinInviteCode}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={pendingUi}
              onPress={onJoinTeam}
              style={[styles.primaryButton, pendingUi ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>Join team</Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigate({ name: "team-list" })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{resource.destinations.teamList.label}</Text>
            </Pressable>
            <Pressable onPress={() => onNavigate({ name: "dashboard" })} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>{resource.destinations.dashboard.label}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {route.name === "create-team" ? (
        <View style={styles.emptyState}>
          <Text style={styles.eyebrow}>CREATE TEAM</Text>
          <Text style={styles.sectionTitle}>Create a shared workspace</Text>
          <Text style={styles.body}>
            Create a team from its own mobile destination, then continue directly into team detail.
          </Text>
          <TextInput
            editable={!pendingUi}
            onChangeText={onDraftTeamNameChange}
            placeholder="Team name"
            style={styles.input}
            value={draftTeamName}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={pendingUi}
              onPress={onCreateTeam}
              style={[styles.primaryButton, pendingUi ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>Create team</Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigate({ name: "team-list" })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{resource.destinations.teamList.label}</Text>
            </Pressable>
            <Pressable onPress={() => onNavigate({ name: "dashboard" })} style={styles.ghostButton}>
              <Text style={styles.ghostButtonText}>{resource.destinations.dashboard.label}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
