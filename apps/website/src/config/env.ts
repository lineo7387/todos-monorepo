export interface WebsiteSupabaseEnv {
  url: string;
  anonKey: string;
  requestTimeoutMs: number | undefined;
  sessionStorageKey: string;
  workspaceShellLocale: string;
}

function readRequiredEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY") {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and provide the Supabase values.`,
    );
  }

  return value;
}

function readOptionalNumberEnv(name: "VITE_SUPABASE_REQUEST_TIMEOUT_MS"): number | undefined {
  const value = import.meta.env[name];

  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function getWebsiteSupabaseEnv(): WebsiteSupabaseEnv {
  return {
    url: readRequiredEnv("VITE_SUPABASE_URL"),
    anonKey: readRequiredEnv("VITE_SUPABASE_ANON_KEY"),
    requestTimeoutMs: readOptionalNumberEnv("VITE_SUPABASE_REQUEST_TIMEOUT_MS"),
    sessionStorageKey: "sb-todos-auth",
    workspaceShellLocale: import.meta.env.VITE_WORKSPACE_SHELL_LOCALE ?? "en",
  };
}
