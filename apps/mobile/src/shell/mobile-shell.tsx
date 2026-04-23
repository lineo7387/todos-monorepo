import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
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
import { resolveWorkspaceRouteEffect } from "workspace-shell";

import { getMobileSupabaseEnv } from "../env.ts";
import { MobileAuthPage } from "../pages/auth-page.tsx";
import { MobileSignedInPages } from "../pages/signed-in-pages.tsx";
import { getDefaultMobileRoute, type MobileRoute } from "../routing/routes.ts";
import { createSecureStoreSessionStorageAdapter } from "../storage.ts";
import { styles } from "../styles/mobile-shell.ts";
import { SectionCard } from "../components/mobile-ui.tsx";

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
    };
  } catch (error) {
    return {
      controller: null,
      envError: toErrorMessage(error),
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
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

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
  const pendingUi = viewModel.isLoading || state.pendingMutations > 0;
  const personalWorkspace =
    viewModel.workspaces.find((workspace) => workspace.kind === "personal") ?? null;
  const teamWorkspaces = viewModel.workspaces.filter((workspace) => workspace.kind === "team");
  const routedTeamWorkspace =
    route.name === "team-detail"
      ? (teamWorkspaces.find((workspace) => workspace.teamId === route.teamId) ?? null)
      : null;

  useEffect(() => {
    if (!controller) {
      return;
    }

    const effect = resolveWorkspaceRouteEffect({
      activeWorkspaceId: viewModel.activeWorkspace?.id ?? null,
      isAuthenticated: viewModel.isAuthenticated,
      isLoading: viewModel.isLoading,
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
  ]);

  useEffect(() => {
    if (!viewModel.isAuthenticated) {
      setRoute(getDefaultMobileRoute());
      setRouteNotice(null);
      setDraftTitle("");
      setEditingTodoId(null);
    }
  }, [viewModel.isAuthenticated]);

  function navigate(nextRoute: MobileRoute) {
    setRoute(nextRoute);
    setRouteNotice(null);
    setEditingTodoId(null);
    setDraftTitle("");
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
      })
      .then(() => {
        setDraftTitle("");
      })
      .catch(() => {});
  }

  async function saveEdit(todoId: string, title: string) {
    if (!controller) {
      return;
    }

    await controller
      .updateTodo(todoId, {
        title,
      })
      .then(() => {
        setEditingTodoId(null);
      })
      .catch(() => {});
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <SectionCard emphasized>
          <Text style={styles.eyebrow}>CROSS-CLIENT WORKSPACE SHELL</Text>
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
              draftTitle={draftTitle}
              editingTodoId={editingTodoId}
              onCancelEdit={cancelEditing}
              onCreateTodo={() => void createTodo()}
              onDismissRouteNotice={() => setRouteNotice(null)}
              onDraftTitleChange={setDraftTitle}
              onNavigate={navigate}
              onSaveEdit={(todoId, title) => void saveEdit(todoId, title)}
              onStartEdit={startEditing}
              pendingUi={pendingUi}
              route={route}
              routeNotice={routeNotice}
              state={state}
              viewModel={viewModel}
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
  );
}
