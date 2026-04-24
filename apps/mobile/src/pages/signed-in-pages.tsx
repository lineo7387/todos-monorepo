import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { TodoAppController, TodoAppState, TodoAppViewModel } from "todo-app";
import { getWorkspaceShellResource, type WorkspaceShellResources } from "workspace-shell";

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

function getWorkspaceDescription(
  workspace: MobileWorkspace | null,
  resource: WorkspaceShellResources,
): string {
  if (!workspace) {
    return resource.pages.workspace.noWorkspaceDescription;
  }

  return workspace.kind === "team"
    ? resource.pages.workspace.teamIntroBody
    : resource.pages.workspace.personalIntroBody;
}

function getComposerPlaceholder(
  workspace: MobileWorkspace | null,
  resource: WorkspaceShellResources,
): string {
  if (!workspace) {
    return resource.pages.workspace.composerNoWorkspace;
  }

  return workspace.kind === "team"
    ? resource.pages.workspace.composerTeam
    : resource.pages.workspace.composerPersonal;
}

function getTaskFilterLabel(
  filter: "all" | "active" | "completed",
  resource: WorkspaceShellResources,
): string {
  return resource.pages.workspace.taskFilterLabels[filter];
}

function getDateViewLabel(
  view: "all" | "due-today" | "upcoming",
  resource: WorkspaceShellResources,
): string {
  return resource.pages.workspace.dateViewLabels[view];
}

function getEmptyStateCopy(workspace: MobileWorkspace | null, resource: WorkspaceShellResources) {
  if (!workspace) {
    return {
      eyebrow: resource.pages.workspace.emptyNoWorkspaceEyebrow,
      title: resource.pages.workspace.emptyNoWorkspaceTitle,
      body: resource.pages.workspace.emptyNoWorkspaceBody,
    };
  }

  if (workspace.kind === "team") {
    return {
      eyebrow: resource.pages.workspace.emptyTeamEyebrow,
      title: resource.pages.workspace.emptyTeamTitle.replace("{{workspaceName}}", workspace.name),
      body: resource.pages.workspace.emptyTeamBody,
    };
  }

  return {
    eyebrow: resource.pages.workspace.emptyPersonalEyebrow,
    title: resource.pages.workspace.emptyPersonalTitle,
    body: resource.pages.workspace.emptyPersonalBody,
  };
}

function getTaskEmptyStateCopy(input: {
  dateView: "all" | "due-today" | "upcoming";
  hasAnyTodos: boolean;
  resource: WorkspaceShellResources;
  taskFilter: "all" | "active" | "completed";
  todosLength: number;
  workspace: MobileWorkspace | null;
}) {
  if (!input.hasAnyTodos) {
    return getEmptyStateCopy(input.workspace, input.resource);
  }

  if (input.todosLength === 0) {
    return {
      eyebrow: input.resource.pages.workspace.emptyMatchEyebrow,
      title: input.resource.pages.workspace.emptyMatchTitle
        .replace("{{taskFilter}}", getTaskFilterLabel(input.taskFilter, input.resource))
        .replace("{{dateView}}", getDateViewLabel(input.dateView, input.resource).toLowerCase()),
      body: input.resource.pages.workspace.emptyMatchBody,
    };
  }

  return null;
}

function MobileDestinationRail({
  disabled,
  locale,
  onNavigate,
  route,
}: {
  disabled: boolean;
  locale?: string | null;
  onNavigate: (route: MobileRoute) => void;
  route: MobileRoute;
}) {
  const resource = getWorkspaceShellResource(locale);
  const destinations = [
    {
      label: resource.destinations.dashboard.label,
      meta: resource.navigation.primaryItems.dashboard,
      route: { name: "dashboard" } as const,
    },
    {
      label: resource.destinations.personalWorkspace.label,
      meta: resource.navigation.primaryItems.personalWorkspace,
      route: { name: "personal-workspace" } as const,
    },
    {
      label: resource.destinations.teamList.label,
      meta: resource.navigation.primaryItems.teamList,
      route: { name: "team-list" } as const,
    },
    {
      label: resource.destinations.joinTeam.label,
      meta: resource.navigation.primaryItems.joinTeam,
      route: { name: "join-team" } as const,
    },
    {
      label: resource.destinations.createTeam.label,
      meta: resource.navigation.primaryItems.createTeam,
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
  locale,
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
  locale?: string | null;
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
  const resource = getWorkspaceShellResource(locale);
  const emptyStateCopy = getTaskEmptyStateCopy({
    dateView,
    hasAnyTodos,
    resource,
    taskFilter,
    todosLength: todos.length,
    workspace: pageWorkspace,
  });

  return (
    <View style={styles.stack}>
      <View style={styles.workspaceCard}>
        <Text style={styles.eyebrow}>
          {route.name === "team-detail"
            ? resource.destinations.teamDetail.label
            : resource.destinations.personalWorkspace.label}
        </Text>
        <Text style={styles.sectionTitle}>
          {pageWorkspace?.name ?? resource.pages.workspace.noAvailableWorkspace}
        </Text>
        <Text style={styles.body}>{getWorkspaceDescription(pageWorkspace, resource)}</Text>

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
                {resource.pages.workspace.personalList}
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
                  {resource.pages.workspace.teamDetail}
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
          placeholder={getComposerPlaceholder(pageWorkspace, resource)}
          style={styles.input}
          value={draftTitle}
        />
        <TextInput
          editable={canManageTodos}
          onChangeText={onDraftDueDateChange}
          placeholder={resource.fields.dueDatePlaceholder}
          style={styles.input}
          value={draftDueDate}
        />
        <Pressable
          disabled={!canManageTodos}
          onPress={onCreateTodo}
          style={[styles.primaryButton, !canManageTodos ? styles.buttonDisabled : null]}
        >
          <Text style={styles.primaryButtonText}>{resource.actions.addTask}</Text>
        </Pressable>
      </View>

      <View style={styles.filterPanel}>
        <Text style={styles.sectionTitle}>{resource.pages.workspace.filterPanelLabel}</Text>
        <Text style={styles.sectionSubtitle}>{resource.pages.workspace.filterPanelBody}</Text>
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
                {getTaskFilterLabel(filter, resource)}
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
        <Text style={styles.sectionTitle}>{resource.pages.workspace.datePanelLabel}</Text>
        <Text style={styles.sectionSubtitle}>{resource.pages.workspace.datePanelBody}</Text>
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
                {getDateViewLabel(view, resource)}
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
        <Text style={styles.sectionTitle}>{resource.pages.workspace.selectedDateLabel}</Text>
        <Text style={styles.sectionSubtitle}>{resource.pages.workspace.datePanelHeading}</Text>
        <TextInput
          onChangeText={onSelectedDateChange}
          placeholder={resource.fields.selectedDatePlaceholder}
          style={styles.input}
          value={selectedDate}
        />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryPrimary}>{selectedDateLabel}</Text>
          <Text style={styles.summarySecondary}>
            {resource.pages.workspace.selectedDateSummary
              .replace("{{count}}", String(selectedDateTodos.length))
              .replace("{{plural}}", selectedDateTodos.length === 1 ? "" : "s")}
          </Text>
        </View>
        {selectedDateTodos.length === 0 ? (
          <Text style={styles.body}>
            {resource.pages.workspace.selectedDateEmpty.replace(
              "{{taskFilter}}",
              getTaskFilterLabel(taskFilter, resource).toLowerCase(),
            )}
          </Text>
        ) : (
          <View style={styles.stack}>
            {selectedDateTodos.map((todo) => (
              <View key={todo.id} style={styles.selectedDateCard}>
                <Text style={styles.selectedDateTitle}>{todo.title}</Text>
                <Text style={styles.selectedDateMeta}>
                  {todo.completed
                    ? resource.pages.workspace.taskFilterLabels.completed
                    : resource.pages.workspace.taskFilterLabels.active}
                  {todo.dueDate
                    ? `, ${resource.pages.todo.due.replace("{{date}}", todo.dueDate)}`
                    : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {route.name === "team-detail" && pageWorkspace?.kind === "team" ? (
        <View style={styles.filterPanel}>
          <Text style={styles.sectionTitle}>{resource.pages.workspace.invitePanelLabel}</Text>
          <Text style={styles.sectionSubtitle}>
            {resource.pages.workspace.invitePanelHeading.replace(
              "{{workspaceName}}",
              pageWorkspace.name,
            )}
          </Text>
          <Pressable
            disabled={!canManageTodos}
            onPress={onCreateTeamInvite}
            style={[styles.secondaryButton, !canManageTodos ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>{resource.actions.createInvite}</Text>
          </Pressable>
          {teamInviteMessage ? <Text style={styles.body}>{teamInviteMessage}</Text> : null}
          {teamInviteCode ? (
            <View style={styles.stack}>
              <View style={styles.summaryCard}>
                <Text style={styles.todoEyebrow}>{resource.fields.inviteCode}</Text>
                <Text style={styles.selectedDateTitle}>{teamInviteCode}</Text>
              </View>
              {teamInviteExpiresAt ? (
                <Text style={styles.body}>
                  {resource.pages.workspace.inviteExpires.replace(
                    "{{expiresAt}}",
                    formatDateTime(teamInviteExpiresAt),
                  )}
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
          locale={locale}
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
  locale,
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
  locale?: string | null;
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
  const resource = getWorkspaceShellResource(locale);
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
  const pageTitle = getMobileRouteTitle(route, routedTeamWorkspace?.name, locale);

  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{resource.navigation.heading}</Text>
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
            <Text style={styles.secondaryButtonText}>{resource.actions.refresh}</Text>
          </Pressable>
          <Pressable
            disabled={pendingUi}
            onPress={() => void controller.signOut().catch(() => {})}
            style={[styles.ghostButton, pendingUi ? styles.buttonDisabled : null]}
          >
            <Text style={styles.ghostButtonText}>{resource.actions.signOut}</Text>
          </Pressable>
        </View>
      </View>

      {viewModel.loadingMessage ? <Banner muted text={viewModel.loadingMessage} /> : null}
      {viewModel.pendingMessage ? <Banner text={viewModel.pendingMessage} /> : null}
      {viewModel.errorMessage ? (
        <Banner
          actionLabel={resource.actions.dismiss}
          onAction={() => controller.clearError()}
          text={viewModel.errorMessage}
          tone={viewModel.errorKind === "notice" ? "accent" : "danger"}
        />
      ) : null}
      {routeNotice ? (
        <Banner
          actionLabel={resource.actions.dismiss}
          onAction={onDismissRouteNotice}
          text={routeNotice}
        />
      ) : null}
      {joinFeedback && route.name === "join-team" ? (
        <Banner
          actionLabel={resource.actions.dismiss}
          onAction={onDismissJoinFeedback}
          text={joinFeedback.message}
          tone={joinFeedback.kind === "notice" ? "accent" : "danger"}
        />
      ) : null}

      <View style={styles.workspaceCard}>
        <Text style={styles.eyebrow}>{resource.navigation.heading}</Text>
        <Text style={styles.sectionTitle}>{resource.navigation.heading}</Text>
        <Text style={styles.sectionSubtitle}>{resource.navigation.subtitle}</Text>
        <MobileDestinationRail
          disabled={pendingUi}
          locale={locale}
          onNavigate={onNavigate}
          route={route}
        />
      </View>

      {route.name === "dashboard" ? (
        <View style={styles.stack}>
          <View style={styles.workspaceCard}>
            <Text style={styles.eyebrow}>
              {resource.destinations.dashboard.label.toUpperCase()}
            </Text>
            <Text style={styles.sectionTitle}>{resource.pages.dashboard.heading}</Text>
            <Text style={styles.body}>{resource.pages.dashboard.heroBody}</Text>
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
            <Text style={styles.sectionTitle}>{resource.destinations.teamDetail.label}</Text>
            <Text style={styles.body}>{resource.pages.teamList.body}</Text>
            <View style={styles.stack}>
              {teamWorkspaces.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.eyebrow}>
                    {resource.pages.teamList.dashboardEmptyEyebrow}
                  </Text>
                  <Text style={styles.sectionTitle}>
                    {resource.pages.teamList.dashboardEmptyTitle}
                  </Text>
                  <Text style={styles.body}>{resource.pages.teamList.dashboardEmptyBody}</Text>
                </View>
              ) : (
                teamWorkspaces.map((workspace) => (
                  <Pressable
                    key={workspace.id}
                    onPress={() => onNavigate({ name: "team-detail", teamId: workspace.teamId! })}
                    style={styles.workspaceTab}
                  >
                    <Text style={styles.workspaceTabLabel}>{workspace.name}</Text>
                    <Text style={styles.workspaceTabMeta}>
                      {resource.destinations.teamDetail.label}
                    </Text>
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
            <Text style={styles.eyebrow}>{resource.destinations.teamList.label.toUpperCase()}</Text>
            <Text style={styles.sectionTitle}>{resource.navigation.joinedTeams}</Text>
            <Text style={styles.body}>{resource.pages.teamList.body}</Text>
          </View>
          <View style={styles.stack}>
            {teamWorkspaces.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.eyebrow}>{resource.pages.teamList.emptyEyebrow}</Text>
                <Text style={styles.sectionTitle}>{resource.pages.teamList.emptyTitle}</Text>
                <Text style={styles.body}>{resource.pages.teamList.emptyBody}</Text>
              </View>
            ) : (
              teamWorkspaces.map((workspace) => (
                <Pressable
                  key={workspace.id}
                  onPress={() => onNavigate({ name: "team-detail", teamId: workspace.teamId! })}
                  style={styles.workspaceTab}
                >
                  <Text style={styles.workspaceTabLabel}>{workspace.name}</Text>
                  <Text style={styles.workspaceTabMeta}>
                    {resource.destinations.teamDetail.label}
                  </Text>
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
          locale={locale}
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
          <Text style={styles.eyebrow}>{resource.destinations.joinTeam.label.toUpperCase()}</Text>
          <Text style={styles.sectionTitle}>{resource.pages.joinTeam.inviteHeadingManual}</Text>
          <Text style={styles.body}>{resource.pages.joinTeam.heroBody}</Text>
          <TextInput
            autoCapitalize="none"
            editable={!pendingUi}
            onChangeText={onJoinInviteCodeChange}
            placeholder={resource.fields.inviteCodeOrLinkPlaceholder}
            style={styles.input}
            value={joinInviteCode}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={pendingUi}
              onPress={onJoinTeam}
              style={[styles.primaryButton, pendingUi ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>{resource.destinations.joinTeam.label}</Text>
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
          <Text style={styles.eyebrow}>{resource.destinations.createTeam.label.toUpperCase()}</Text>
          <Text style={styles.sectionTitle}>{resource.pages.createTeam.mobileHeading}</Text>
          <Text style={styles.body}>{resource.pages.createTeam.mobileBody}</Text>
          <TextInput
            editable={!pendingUi}
            onChangeText={onDraftTeamNameChange}
            placeholder={resource.fields.teamNamePlaceholder}
            style={styles.input}
            value={draftTeamName}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={pendingUi}
              onPress={onCreateTeam}
              style={[styles.primaryButton, pendingUi ? styles.buttonDisabled : null]}
            >
              <Text style={styles.primaryButtonText}>{resource.destinations.createTeam.label}</Text>
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
