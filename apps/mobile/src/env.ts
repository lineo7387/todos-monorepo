export interface MobileSupabaseEnv {
  url: string;
  anonKey: string;
  sessionStorageKey: string;
}

function readRequiredEnv(
  name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_ANON_KEY",
): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Configure the React Native app with the required Supabase environment values.`,
    );
  }

  return value;
}

export function getMobileSupabaseEnv(): MobileSupabaseEnv {
  return {
    url: readRequiredEnv("EXPO_PUBLIC_SUPABASE_URL"),
    anonKey: readRequiredEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    sessionStorageKey: "sb-todos-auth-mobile",
  };
}
