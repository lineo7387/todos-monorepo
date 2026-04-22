export interface DesktopSupabaseEnv {
  url: string;
  anonKey: string;
  sessionStorageKey: string;
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

export function getDesktopSupabaseEnv(): DesktopSupabaseEnv {
  return {
    url: readRequiredEnv("VITE_SUPABASE_URL"),
    anonKey: readRequiredEnv("VITE_SUPABASE_ANON_KEY"),
    sessionStorageKey: "sb-todos-auth-desktop",
  };
}
