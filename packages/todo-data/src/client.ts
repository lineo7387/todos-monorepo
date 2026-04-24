import { createClient, type SupabaseClientOptions } from "@supabase/supabase-js";

import { createSupabaseStorageAdapter } from "./storage.ts";
import type { TodoDatabase, TodoSupabaseClient, TodoSupabaseOptions } from "./types.ts";

const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

function normalizeRequestTimeoutMs(timeoutMs: number | undefined): number {
  if (timeoutMs === undefined) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }

  return Number.isFinite(timeoutMs) ? Math.max(timeoutMs, 0) : DEFAULT_REQUEST_TIMEOUT_MS;
}

export function createTimeoutFetch(
  baseFetch: typeof fetch,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): typeof fetch {
  const normalizedTimeoutMs = normalizeRequestTimeoutMs(timeoutMs);

  return async (input, init = {}) => {
    if (normalizedTimeoutMs === 0) {
      return baseFetch(input, init);
    }

    const controller = new AbortController();
    const originalSignal = init.signal;
    const handleOriginalAbort = () => {
      controller.abort(originalSignal?.reason);
    };

    if (originalSignal?.aborted) {
      handleOriginalAbort();
    } else {
      originalSignal?.addEventListener("abort", handleOriginalAbort, { once: true });
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      return await Promise.race([
        baseFetch(input, {
          ...init,
          signal: controller.signal,
        }),
        new Promise<Response>((_, reject) => {
          timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error(`Supabase request timed out after ${normalizedTimeoutMs} ms.`));
          }, normalizedTimeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      originalSignal?.removeEventListener("abort", handleOriginalAbort);
    }
  };
}

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
    requestTimeoutMs,
    options: baseOptions,
  } = options;
  const baseFetch = global?.fetch ?? globalThis.fetch.bind(globalThis);

  return {
    ...baseOptions,
    global: {
      ...global,
      fetch: createTimeoutFetch(baseFetch, requestTimeoutMs),
    },
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
