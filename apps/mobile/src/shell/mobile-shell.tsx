import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  createTodoAppController,
  createTodoAppViewModel,
  type TodoAppController,
  type TodoAppState,
} from "todo-app";
import {
  createSupabaseAuthRepository,
  createSupabaseTodoRepository,
  createTodoSupabaseClient,
} from "todo-data";
import {
  getNextWorkspaceShellLocale,
  getWorkspaceShellResource,
  resolveWorkspaceRouteEffect,
} from "workspace-shell";

import { SectionCard } from "../components/mobile-ui.tsx";
import {
  extractInviteCode,
  getCreateInviteSuccessOutcome,
  getJoinInviteFailureFeedback,
  getJoinInviteSuccessOutcome,
  type MobileJoinFeedback,
} from "../lib/invite-flow.ts";
import {
  deriveMobileTaskView,
  formatSelectedDateLabel,
  getCurrentDateValue,
  type MobileDateView,
  type MobileTaskFilter,
} from "../lib/task-view.ts";
import { getMobileSupabaseEnv } from "../env.ts";
import { MobileAuthPage } from "../pages/auth-page.tsx";
import { MobileSignedInPages } from "../pages/signed-in-pages.tsx";
import { getDefaultMobileRoute, type MobileRoute } from "../routing/routes.ts";
import { createSecureStoreSessionStorageAdapter } from "../storage.ts";
import { styles } from "../styles/mobile-shell.ts";

const FALLBACK_STATE: TodoAppState = {
  status: "signed-out",
  session: null,
  workspaces: [],
  activeWorkspaceId: null,
  todos: [],
  pendingMutations: 0,
  lastError: null,
  lastErrorKind: null,
  signInFieldErrors: {
    email: null,
    password: null,
  },
  todoTitleError: null,
  lastMutation: null,
};

interface MobileBootstrap {
  controller: TodoAppController | null;
  envError: string | null;
  workspaceShellLocale: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong.";
}

function createMobileBootstrap(): MobileBootstrap {
  try {
    const env = getMobileSupabaseEnv();
    const client = createTodoSupabaseClient({
      env,
      runtime: "mobile",
      detectSessionInUrl: false,
      sessionStorage: createSecureStoreSessionStorageAdapter(),
    });

    return {
      controller: createTodoAppController({
        authRepository: createSupabaseAuthRepository(client),
        todoRepository: createSupabaseTodoRepository(client),
      }),
      envError: null,
      workspaceShellLocale: env.workspaceShellLocale,
    };
  } catch (error) {
    return {
      controller: null,
      envError: toErrorMessage(error),
      workspaceShellLocale: "en",
    };
  }
}

export function MobileAppShell() {
  const [bootstrap] = useState(createMobileBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
  const [route, setRoute] = useState<MobileRoute>(getDefaultMobileRoute);
  const [routeNotice, setRouteNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDueDate, setDraftDueDate] = useState(getCurrentDateValue);
  const [draftTeamName, setDraftTeamName] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<MobileTaskFilter>("all");
  const [dateView, setDateView] = useState<MobileDateView>("all");
  const [selectedDate, setSelectedDate] = useState(getCurrentDateValue);
  const [teamInviteCode, setTeamInviteCode] = useState("");
  const [teamInviteExpiresAt, setTeamInviteExpiresAt] = useState<string | null>(null);
  const [teamInviteMessage, setTeamInviteMessage] = useState<string | null>(null);
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [joinFeedback, setJoinFeedback] = useState<MobileJoinFeedback | null>(null);
  const [workspaceShellLocale, setWorkspaceShellLocale] = useState(
    () => bootstrap.workspaceShellLocale,
  );

  useEffect(() => {
    if (!bootstrap.controller) {
      return;
    }

    const unsubscribe = bootstrap.controller.subscribe(setState);

    void bootstrap.controller.initialize().catch(() => {});

    return unsubscribe;
  }, [bootstrap.controller]);

  const controller = bootstrap.controller;
  const viewModel = createTodoAppViewModel(state);
  const shellResource = getWorkspaceShellResource(workspaceShellLocale);
  const pendingUi = viewModel.isLoading || state.pendingMutations > 0;
  const personalWorkspace =
    viewModel.workspaces.find((workspace) => workspace.kind === "personal") ?? null;
  const teamWorkspaces = viewModel.workspaces.filter((workspace) => workspace.kind === "team");
  const routedTeamWorkspace =
    route.name === "team-detail"
      ? (teamWorkspaces.find((workspace) => workspace.teamId === route.teamId) ?? null)
      : null;
  const todayDateValue = getCurrentDateValue();
  const { taskCounts, selectedDateTodos } = deriveMobileTaskView(
    viewModel.todos,
    taskFilter,
    dateView,
    todayDateValue,
    selectedDate,
  );
  const statusFilteredTodos = viewModel.todos.filter((todo) => {
    if (taskFilter === "active") {
      return !todo.completed;
    }

    if (taskFilter === "completed") {
      return todo.completed;
    }

    return true;
  });
  const markedDates = statusFilteredTodos
    .map((todo) => todo.dueDate)
    .filter((date): date is string => Boolean(date))
    .filter((date, index, dates) => dates.indexOf(date) === index);

  useEffect(() => {
    if (!controller) {
      return;
    }

    const effect = resolveWorkspaceRouteEffect({
      activeWorkspaceId: viewModel.activeWorkspace?.id ?? null,
      isAuthenticated: viewModel.isAuthenticated,
      isLoading: viewModel.isLoading,
      locale: workspaceShellLocale,
      personalWorkspaceId: personalWorkspace?.id ?? null,
      route,
      routedTeamWorkspaceId: routedTeamWorkspace?.id ?? null,
    });

    if (effect.redirectRoute) {
      setRoute(effect.redirectRoute);
      setRouteNotice(effect.routeNotice);
      return;
    }

    if (effect.selectWorkspaceId) {
      void controller.selectWorkspace(effect.selectWorkspaceId).catch(() => {});
    }
  }, [
    controller,
    personalWorkspace,
    route,
    routedTeamWorkspace,
    viewModel.activeWorkspace?.id,
    viewModel.isAuthenticated,
    viewModel.isLoading,
    workspaceShellLocale,
  ]);

  useEffect(() => {
    if (!viewModel.isAuthenticated) {
      setRoute(getDefaultMobileRoute());
      setRouteNotice(null);
      setDraftTitle("");
      setDraftDueDate(getCurrentDateValue());
      setDraftTeamName("");
      setEditingTodoId(null);
      setTaskFilter("all");
      setDateView("all");
      setSelectedDate(getCurrentDateValue());
      setTeamInviteCode("");
      setTeamInviteExpiresAt(null);
      setTeamInviteMessage(null);
      setJoinInviteCode("");
      setJoinFeedback(null);
    }
  }, [viewModel.isAuthenticated]);

  useEffect(() => {
    if (route.name === "personal-workspace" || route.name === "team-detail") {
      setTaskFilter("all");
      setDateView("all");
      setSelectedDate(getCurrentDateValue());
    }
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    setTeamInviteCode("");
    setTeamInviteExpiresAt(null);
    setTeamInviteMessage(null);
  }, [route.name, route.name === "team-detail" ? route.teamId : null]);

  useEffect(() => {
    if (route.name !== "join-team") {
      setJoinFeedback(null);
    }
  }, [route.name]);

  function navigate(nextRoute: MobileRoute) {
    setRoute(nextRoute);
    setRouteNotice(null);
    setEditingTodoId(null);
    setDraftTitle("");
    setDraftDueDate(getCurrentDateValue());
  }

  async function signIn() {
    if (!controller) {
      return;
    }

    await controller
      .signInWithPassword({
        email,
        password,
      })
      .then(() => {
        setPassword("");
      })
      .catch(() => {});
  }

  async function createTodo() {
    if (!controller) {
      return;
    }

    await controller
      .createTodo({
        title: draftTitle,
        dueDate: draftDueDate,
      })
      .then(() => {
        setDraftTitle("");
        setDraftDueDate(getCurrentDateValue());
      })
      .catch(() => {});
  }

  async function saveEdit(todoId: string, title: string, dueDate: string) {
    if (!controller) {
      return;
    }

    await controller
      .updateTodo(todoId, {
        title,
        dueDate,
      })
      .then(() => {
        setEditingTodoId(null);
      })
      .catch(() => {});
  }

  async function createTeam() {
    if (!controller) {
      return;
    }

    await controller
      .createTeam({
        name: draftTeamName,
      })
      .then((workspace) => {
        setDraftTeamName("");
        navigate({ name: "team-detail", teamId: workspace.teamId ?? workspace.id });
      })
      .catch(() => {});
  }

  async function createTeamInvite() {
    if (!controller || !routedTeamWorkspace?.teamId) {
      return;
    }

    setTeamInviteMessage(null);

    await controller
      .createTeamInvite(routedTeamWorkspace.teamId)
      .then((invite) => {
        const outcome = getCreateInviteSuccessOutcome(invite, workspaceShellLocale);
        setTeamInviteCode(outcome.code);
        setTeamInviteExpiresAt(outcome.expiresAt);
        setTeamInviteMessage(outcome.message);
      })
      .catch(() => {});
  }

  async function joinTeam() {
    if (!controller) {
      return;
    }

    setJoinFeedback(null);

    await controller
      .redeemTeamInvite(extractInviteCode(joinInviteCode))
      .then(async (workspace) => {
        const outcome = getJoinInviteSuccessOutcome({
          activeWorkspaceId: controller.getState().activeWorkspaceId,
          locale: workspaceShellLocale,
          workspace,
        });

        if (outcome.selectWorkspaceId) {
          await controller.selectWorkspace(outcome.selectWorkspaceId).catch(() => {});
        }

        setJoinInviteCode("");
        setJoinFeedback(null);
        navigate(outcome.route);
        setRouteNotice(outcome.routeNotice);
      })
      .catch((error: unknown) => {
        const latestState = controller.getState();
        setJoinFeedback(
          getJoinInviteFailureFeedback({
            error,
            lastError: latestState.lastError,
            lastErrorKind: latestState.lastErrorKind,
            locale: workspaceShellLocale,
          }),
        );
      });
  }

  function startEditing(todo: TodoAppState["todos"][number]) {
    setEditingTodoId(todo.id);
  }

  function cancelEditing() {
    setEditingTodoId(null);
  }

  if (bootstrap.envError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SectionCard emphasized>
            <Text style={styles.eyebrow}>MOBILE SETUP</Text>
            <Text style={styles.title}>
              Connect Supabase before launching the React Native shell.
            </Text>
            <Text style={[styles.body, styles.bodyOnDark]}>{bootstrap.envError}</Text>
            <Text style={[styles.body, styles.bodyOnDark]}>
              Set <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_URL</Text> and{" "}
              <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>, or reuse the monorepo
              root <Text style={styles.code}>.env.local</Text> values through{" "}
              <Text style={styles.code}>VITE_SUPABASE_URL</Text> and{" "}
              <Text style={styles.code}>VITE_SUPABASE_ANON_KEY</Text>.
            </Text>
          </SectionCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!controller) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <SectionCard emphasized>
            <View style={styles.heroHeader}>
              <Text style={styles.eyebrow}>CROSS-CLIENT WORKSPACE SHELL</Text>
              <Pressable
                onPress={() =>
                  setWorkspaceShellLocale(getNextWorkspaceShellLocale(workspaceShellLocale))
                }
                style={styles.languageButton}
              >
                <Text style={styles.languageButtonText}>
                  {shellResource.actions.languageToggle}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.title}>Mobile now follows the shared destination vocabulary.</Text>
            <Text style={[styles.body, styles.bodyOnDark]}>
              The mobile shell keeps the shared workspace-first model from `todo-app`, while route
              state stays local and maps onto the same destination contract as web and desktop.
            </Text>
          </SectionCard>

          <SectionCard>
            {!viewModel.isAuthenticated ? (
              <MobileAuthPage
                email={email}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={() => void signIn()}
                password={password}
                viewModel={viewModel}
              />
            ) : (
              <MobileSignedInPages
                controller={controller}
                draftDueDate={draftDueDate}
                draftTeamName={draftTeamName}
                draftTitle={draftTitle}
                editingTodoId={editingTodoId}
                hasAnyTodos={viewModel.todos.length > 0}
                joinFeedback={joinFeedback}
                joinInviteCode={joinInviteCode}
                locale={workspaceShellLocale}
                markedDates={markedDates}
                onCancelEdit={cancelEditing}
                onCreateTeam={() => void createTeam()}
                onCreateTeamInvite={() => void createTeamInvite()}
                onCreateTodo={() => void createTodo()}
                onDismissJoinFeedback={() => setJoinFeedback(null)}
                onDismissRouteNotice={() => setRouteNotice(null)}
                onDraftDueDateChange={setDraftDueDate}
                onDraftTeamNameChange={setDraftTeamName}
                onDraftTitleChange={setDraftTitle}
                onJoinInviteCodeChange={setJoinInviteCode}
                onJoinTeam={() => void joinTeam()}
                onNavigate={navigate}
                onSaveEdit={(todoId, title, dueDate) => void saveEdit(todoId, title, dueDate)}
                onSelectedDateChange={setSelectedDate}
                onStartEdit={startEditing}
                onTaskFilterChange={setTaskFilter}
                pendingUi={pendingUi}
                route={route}
                routeNotice={routeNotice}
                selectedDate={selectedDate}
                selectedDateLabel={formatSelectedDateLabel(selectedDate)}
                selectedDateTodos={selectedDateTodos}
                state={state}
                taskCounts={taskCounts}
                taskFilter={taskFilter}
                teamInviteCode={teamInviteCode}
                teamInviteExpiresAt={teamInviteExpiresAt}
                teamInviteMessage={teamInviteMessage}
                viewModel={viewModel}
                filteredTodos={statusFilteredTodos}
              />
            )}

            {viewModel.todoTitleError ? (
              <Text style={styles.fieldError}>{viewModel.todoTitleError}</Text>
            ) : null}

            {viewModel.screen === "error" ? (
              <View style={styles.emptyState}>
                <Text style={styles.eyebrow}>SYNC NEEDS ATTENTION</Text>
                <Text style={styles.sectionTitle}>We could not load the latest tasks.</Text>
                <Text style={styles.body}>
                  Retry refresh after checking the network connection and environment setup.
                </Text>
              </View>
            ) : null}
          </SectionCard>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
