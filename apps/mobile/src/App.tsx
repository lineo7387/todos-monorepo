import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
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

import { getMobileSupabaseEnv } from "./env.ts";
import { createSecureStoreSessionStorageAdapter } from "./storage.ts";

type MobileTodoItem = TodoAppState["todos"][number];
type MobileWorkspace = NonNullable<ReturnType<typeof createTodoAppViewModel>["activeWorkspace"]>;

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

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

function SectionCard({
  children,
  emphasized = false,
}: {
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  return <View style={[styles.card, emphasized ? styles.cardEmphasized : null]}>{children}</View>;
}

function Banner({
  actionLabel,
  muted = false,
  onAction,
  text,
  tone = "accent",
}: {
  actionLabel?: string;
  muted?: boolean;
  onAction?: () => void;
  text: string;
  tone?: "accent" | "danger";
}) {
  const isDanger = tone === "danger";

  return (
    <View
      style={[
        styles.banner,
        muted ? styles.bannerMuted : isDanger ? styles.bannerDanger : styles.bannerAccent,
      ]}
    >
      <Text
        style={[
          styles.bannerText,
          muted
            ? styles.bannerTextMuted
            : isDanger
              ? styles.bannerTextDanger
              : styles.bannerTextAccent,
        ]}
      >
        {text}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.bannerButton}>
          <Text
            style={[
              styles.bannerButtonText,
              muted
                ? styles.bannerTextMuted
                : isDanger
                  ? styles.bannerTextDanger
                  : styles.bannerTextAccent,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TodoRow({
  disabled,
  isEditing,
  onCancelEdit,
  onDelete,
  onSaveEdit,
  onStartEdit,
  onToggleComplete,
  todo,
}: {
  disabled: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  onDelete: (todoId: string) => void;
  onSaveEdit: (todoId: string, title: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onToggleComplete: (todo: MobileTodoItem) => void;
  todo: MobileTodoItem;
}) {
  const [draft, setDraft] = useState(todo.title);
  const isOptimistic = todo.id.startsWith("optimistic-");

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.id, todo.title]);

  return (
    <View style={[styles.todoRow, todo.completed ? styles.todoRowComplete : null]}>
      <View style={styles.todoHeader}>
        <View style={styles.todoMeta}>
          <Text style={styles.todoEyebrow}>{isOptimistic ? "SYNCING" : "UPDATED"}</Text>
          <Text style={styles.todoMetaText}>
            {isOptimistic ? "Waiting for Supabase" : formatUpdatedAt(todo.updatedAt)}
          </Text>
        </View>
        <Switch
          disabled={disabled}
          onValueChange={() => onToggleComplete(todo)}
          value={todo.completed}
        />
      </View>

      {isEditing ? (
        <View style={styles.editStack}>
          <TextInput
            editable={!disabled}
            onChangeText={setDraft}
            placeholder="Update task title"
            style={styles.input}
            value={draft}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={disabled}
              onPress={() => onSaveEdit(todo.id, draft)}
              style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.secondaryButtonText}>Save</Text>
            </Pressable>
            <Pressable
              disabled={disabled}
              onPress={onCancelEdit}
              style={[styles.ghostButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.ghostButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={[styles.todoTitle, todo.completed ? styles.todoTitleComplete : null]}>
          {todo.title}
        </Text>
      )}

      {!isEditing ? (
        <View style={styles.inlineActions}>
          <Pressable
            disabled={disabled}
            onPress={() => onStartEdit(todo)}
            style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={disabled}
            onPress={() => onDelete(todo.id)}
            style={[styles.dangerButton, disabled ? styles.buttonDisabled : null]}
          >
            <Text style={styles.dangerButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function MobileTodoApp() {
  const [bootstrap] = useState(createMobileBootstrap);
  const [state, setState] = useState<TodoAppState>(
    () => bootstrap.controller?.getState() ?? FALLBACK_STATE,
  );
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
  const activeWorkspace = viewModel.activeWorkspace;
  const emptyStateCopy = getEmptyStateCopy(activeWorkspace);

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

  if (bootstrap.envError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SectionCard emphasized>
            <Text style={styles.eyebrow}>MOBILE SETUP</Text>
            <Text style={styles.title}>
              Connect Supabase before launching the React Native shell.
            </Text>
            <Text style={styles.body}>{bootstrap.envError}</Text>
            <Text style={styles.body}>
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
          <Text style={styles.eyebrow}>CROSS-PLATFORM TODOS</Text>
          <Text style={styles.title}>Shared task behavior, tuned for the mobile shell.</Text>
          <Text style={styles.body}>
            This client uses secure device-backed session persistence, shared Supabase adapters, and
            the same optimistic mutation flow already used on web.
          </Text>
        </SectionCard>

        <SectionCard>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>MOBILE CLIENT</Text>
              <Text style={styles.sectionTitle}>Todo workspace</Text>
              {state.session?.userId ? (
                <Text style={styles.sessionText}>{state.session.userId}</Text>
              ) : null}
            </View>

            {viewModel.isAuthenticated ? (
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
            ) : null}
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

          {!viewModel.isAuthenticated ? (
            <View style={styles.stack}>
              <Text style={styles.sectionTitle}>Sign in to your synced task list</Text>
              <Text style={styles.body}>
                The mobile client restores sessions and loads the same persisted todos used by the
                web client and future desktop shell.
              </Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="user@example.com"
                style={styles.input}
                value={email}
              />
              {viewModel.signInFieldErrors.email ? (
                <Text style={styles.fieldError}>{viewModel.signInFieldErrors.email}</Text>
              ) : null}
              <TextInput
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              {viewModel.signInFieldErrors.password ? (
                <Text style={styles.fieldError}>{viewModel.signInFieldErrors.password}</Text>
              ) : null}
              <Pressable
                disabled={viewModel.isLoading}
                onPress={() => void signIn()}
                style={[styles.primaryButton, viewModel.isLoading ? styles.buttonDisabled : null]}
              >
                {viewModel.isLoading ? (
                  <ActivityIndicator color="#fffdf6" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign in</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.stack}>
              <View style={styles.workspaceCard}>
                <Text style={styles.eyebrow}>WORKSPACE</Text>
                <Text style={styles.sectionTitle}>
                  {activeWorkspace?.name ?? "No workspace available"}
                </Text>
                <Text style={styles.body}>{getWorkspaceDescription(activeWorkspace)}</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.workspaceTabs}
                >
                  {viewModel.workspaces.map((workspace) => {
                    const isActive = workspace.id === activeWorkspace?.id;

                    return (
                      <Pressable
                        disabled={pendingUi}
                        key={workspace.id}
                        onPress={() =>
                          void controller.selectWorkspace(workspace.id).catch(() => {})
                        }
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
                          {workspace.kind === "team" ? `Team: ${workspace.name}` : workspace.name}
                        </Text>
                        <Text
                          style={[
                            styles.workspaceTabMeta,
                            isActive ? styles.workspaceTabMetaActive : null,
                          ]}
                        >
                          {workspace.kind === "team" ? "Shared team list" : "Personal list"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.composer}>
                <TextInput
                  editable={viewModel.canManageTodos}
                  onChangeText={setDraftTitle}
                  placeholder={getComposerPlaceholder(activeWorkspace)}
                  style={styles.input}
                  value={draftTitle}
                />
                <Pressable
                  disabled={!viewModel.canManageTodos}
                  onPress={() => void createTodo()}
                  style={[
                    styles.primaryButton,
                    !viewModel.canManageTodos ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Add task</Text>
                </Pressable>
              </View>

              {viewModel.todoTitleError ? (
                <Text style={styles.fieldError}>{viewModel.todoTitleError}</Text>
              ) : null}

              {viewModel.showEmptyState ? (
                <View style={styles.emptyState}>
                  <Text style={styles.eyebrow}>{emptyStateCopy.eyebrow}</Text>
                  <Text style={styles.sectionTitle}>{emptyStateCopy.title}</Text>
                  <Text style={styles.body}>{emptyStateCopy.body}</Text>
                </View>
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

              {viewModel.todos.map((todo) => (
                <TodoRow
                  disabled={!viewModel.canManageTodos}
                  isEditing={editingTodoId === todo.id}
                  key={todo.id}
                  onCancelEdit={() => setEditingTodoId(null)}
                  onDelete={(todoId) => void controller.deleteTodo(todoId).catch(() => {})}
                  onSaveEdit={(todoId, title) => void saveEdit(todoId, title)}
                  onStartEdit={(entry) => setEditingTodoId(entry.id)}
                  onToggleComplete={(entry) =>
                    void (
                      entry.completed
                        ? controller.uncompleteTodo(entry.id)
                        : controller.completeTodo(entry.id)
                    ).catch(() => {})
                  }
                  todo={todo}
                />
              ))}
            </View>
          )}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

export const mobileAppTarget = {
  id: "mobile",
  runtime: "react-native",
  envPrefix: "EXPO_PUBLIC_",
  sessionStorageStrategy: "secure-device-storage",
  sharedPackages: ["todo-domain", "todo-data", "todo-app"],
} as const;

export default MobileTodoApp;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe7",
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    backgroundColor: "#fffaf3",
    padding: 20,
  },
  cardEmphasized: {
    backgroundColor: "#1f4f46",
  },
  eyebrow: {
    color: "#8a7a63",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: "#fffdf6",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36,
  },
  body: {
    color: "#6f604d",
    fontSize: 15,
    lineHeight: 22,
  },
  code: {
    color: "#fef3c7",
    fontFamily: "Courier",
  },
  headerRow: {
    gap: 16,
  },
  headerCopy: {
    gap: 6,
  },
  sectionTitle: {
    color: "#2e2418",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
  sessionText: {
    color: "#6f604d",
    fontSize: 13,
  },
  stack: {
    gap: 14,
  },
  workspaceCard: {
    gap: 12,
    borderRadius: 20,
    backgroundColor: "#f5efe6",
    padding: 18,
  },
  workspaceTabs: {
    gap: 10,
    paddingRight: 4,
  },
  workspaceTab: {
    minWidth: 168,
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dacbb7",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  workspaceTabActive: {
    borderColor: "#1f4f46",
    backgroundColor: "#e6efe9",
  },
  workspaceTabLabel: {
    color: "#2e2418",
    fontSize: 15,
    fontWeight: "700",
  },
  workspaceTabLabelActive: {
    color: "#1f4f46",
  },
  workspaceTabMeta: {
    color: "#6f604d",
    fontSize: 12,
  },
  workspaceTabMetaActive: {
    color: "#1f4f46",
  },
  composer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dacbb7",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#2e2418",
    fontSize: 16,
  },
  fieldError: {
    color: "#b45309",
    fontSize: 13,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#1f4f46",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#fffdf6",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#e6efe9",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#1f4f46",
    fontSize: 14,
    fontWeight: "700",
  },
  ghostButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dacbb7",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: "#4b3c2a",
    fontSize: 14,
    fontWeight: "700",
  },
  dangerButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#fff1eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: "#c2410c",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  banner: {
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerMuted: {
    backgroundColor: "#eee5d8",
  },
  bannerAccent: {
    backgroundColor: "#dff0ec",
  },
  bannerDanger: {
    backgroundColor: "#fee9e3",
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bannerTextMuted: {
    color: "#6f604d",
  },
  bannerTextAccent: {
    color: "#1f4f46",
  },
  bannerTextDanger: {
    color: "#9a3412",
  },
  bannerButton: {
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#1f4f46",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: {
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#f5efe6",
    padding: 18,
  },
  todoRow: {
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0d3c0",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  todoRowComplete: {
    backgroundColor: "#eef5f2",
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  todoMeta: {
    gap: 4,
    flexShrink: 1,
  },
  todoEyebrow: {
    color: "#8a7a63",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  todoMetaText: {
    color: "#6f604d",
    fontSize: 13,
  },
  todoTitle: {
    color: "#2e2418",
    fontSize: 18,
    lineHeight: 24,
  },
  todoTitleComplete: {
    color: "#6f604d",
    textDecorationLine: "line-through",
  },
  editStack: {
    gap: 12,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
