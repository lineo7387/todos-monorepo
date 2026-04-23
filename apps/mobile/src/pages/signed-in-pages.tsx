import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { TodoAppController, TodoAppState, TodoAppViewModel } from "todo-app";
import { getWorkspaceShellResource } from "workspace-shell";

import { Banner } from "../components/mobile-ui.tsx";
import { MobileTodoRow } from "../components/todo-row.tsx";
import { getMobileRouteTitle, isMobileRouteActive, type MobileRoute } from "../routing/routes.ts";
import { styles } from "../styles/mobile-shell.ts";

type MobileTodoItem = TodoAppState["todos"][number];
type MobileWorkspace = Exclude<TodoAppViewModel["activeWorkspace"], null>;

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
  draftTitle,
  editingTodoId,
  onCancelEdit,
  onCreateTodo,
  onDeleteTodo,
  onDraftTitleChange,
  onNavigate,
  onSaveEdit,
  onStartEdit,
  onToggleComplete,
  pageWorkspace,
  pendingUi,
  personalWorkspace,
  route,
  teamWorkspaces,
  todos,
}: {
  canManageTodos: boolean;
  draftTitle: string;
  editingTodoId: string | null;
  onCancelEdit: () => void;
  onCreateTodo: () => void;
  onDeleteTodo: (todoId: string) => void;
  onDraftTitleChange: (value: string) => void;
  onNavigate: (route: MobileRoute) => void;
  onSaveEdit: (todoId: string, title: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onToggleComplete: (todo: MobileTodoItem) => void;
  pageWorkspace: MobileWorkspace | null;
  pendingUi: boolean;
  personalWorkspace: MobileWorkspace | null;
  route: MobileRoute;
  teamWorkspaces: MobileWorkspace[];
  todos: MobileTodoItem[];
}) {
  const emptyStateCopy = getEmptyStateCopy(pageWorkspace);

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
        <Pressable
          disabled={!canManageTodos}
          onPress={onCreateTodo}
          style={[styles.primaryButton, !canManageTodos ? styles.buttonDisabled : null]}
        >
          <Text style={styles.primaryButtonText}>Add task</Text>
        </Pressable>
      </View>

      {todos.length === 0 ? (
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
  draftTitle,
  editingTodoId,
  onCancelEdit,
  onCreateTodo,
  onDismissRouteNotice,
  onDraftTitleChange,
  onNavigate,
  onSaveEdit,
  onStartEdit,
  pendingUi,
  route,
  routeNotice,
  state,
  viewModel,
}: {
  controller: TodoAppController;
  draftTitle: string;
  editingTodoId: string | null;
  onCancelEdit: () => void;
  onCreateTodo: () => void;
  onDismissRouteNotice: () => void;
  onDraftTitleChange: (value: string) => void;
  onNavigate: (route: MobileRoute) => void;
  onSaveEdit: (todoId: string, title: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  pendingUi: boolean;
  route: MobileRoute;
  routeNotice: string | null;
  state: TodoAppState;
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

      <View style={styles.workspaceCard}>
        <Text style={styles.eyebrow}>DESTINATIONS</Text>
        <Text style={styles.sectionTitle}>{resource.navigation.heading}</Text>
        <Text style={styles.sectionSubtitle}>
          Mobile now follows the same destination vocabulary as web and desktop.
        </Text>
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
          draftTitle={draftTitle}
          editingTodoId={editingTodoId}
          onCancelEdit={onCancelEdit}
          onCreateTodo={onCreateTodo}
          onDeleteTodo={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
          onDraftTitleChange={onDraftTitleChange}
          onNavigate={onNavigate}
          onSaveEdit={onSaveEdit}
          onStartEdit={onStartEdit}
          onToggleComplete={(todo) =>
            void (
              todo.completed ? controller.uncompleteTodo(todo.id) : controller.completeTodo(todo.id)
            ).catch(() => {})
          }
          pageWorkspace={pageWorkspace}
          pendingUi={pendingUi}
          personalWorkspace={personalWorkspace}
          route={route}
          teamWorkspaces={teamWorkspaces}
          todos={viewModel.todos}
        />
      ) : null}

      {route.name === "join-team" ? (
        <View style={styles.emptyState}>
          <Text style={styles.eyebrow}>JOIN TEAM</Text>
          <Text style={styles.sectionTitle}>Dedicated destination is in place</Text>
          <Text style={styles.body}>
            Mobile now exposes join team as its own destination in the same vocabulary as web and
            desktop. The invite submission flow itself remains part of task 3.2.
          </Text>
          <View style={styles.inlineActions}>
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
          <Text style={styles.sectionTitle}>Dedicated destination is in place</Text>
          <Text style={styles.body}>
            Mobile now exposes create team as its own destination in the same vocabulary as web and
            desktop. The actual create flow and post-create team-detail handoff stay in task 3.2.
          </Text>
          <View style={styles.inlineActions}>
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
