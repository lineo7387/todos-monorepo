import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

import { createSupabaseStorageAdapter } from "./storage.ts";
import type { TodoDatabase, TodoSupabaseClient, TodoSupabaseOptions } from "./types.ts";

export function createTodoSupabaseClientOptions(
  options: TodoSupabaseOptions,
): SupabaseClientOptions<"public"> {
  const {
    runtime,
    persistSession = true,
    autoRefreshToken = true,
    detectSessionInUrl = runtime === "web",
    sessionStorage,
    userStorage,
    auth,
    global,
    options: baseOptions,
  } = options;

  return {
    ...baseOptions,
    global,
    auth: {
      ...auth,
      storageKey: options.env.sessionStorageKey,
      persistSession,
      autoRefreshToken,
      detectSessionInUrl,
      storage: sessionStorage ? createSupabaseStorageAdapter(sessionStorage) : auth?.storage,
      userStorage: userStorage ? createSupabaseStorageAdapter(userStorage) : auth?.userStorage,
    },
  };
}

export function createTodoSupabaseClient(options: TodoSupabaseOptions): TodoSupabaseClient {
  return createClient<TodoDatabase, "public">(
    options.env.url,
    options.env.anonKey,
    createTodoSupabaseClientOptions(options),
  );
}
