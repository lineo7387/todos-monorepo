import path from "node:path";
import fs from "node:fs";

type EnvKey =
  | "VITE_SUPABASE_URL"
  | "VITE_SUPABASE_ANON_KEY"
  | "EXPO_PUBLIC_SUPABASE_URL"
  | "EXPO_PUBLIC_SUPABASE_ANON_KEY";

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadRootEnvFile() {
  const rootDir = path.resolve(process.cwd(), "../..");
  const candidates = [path.join(rootDir, ".env.local"), path.join(rootDir, ".env")];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");

    for (const rawLine of source.split(/\r?\n/u)) {
      const line = rawLine.trim();

      if (line.length === 0 || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex <= 0) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim() as EnvKey;
      const value = stripWrappingQuotes(line.slice(separatorIndex + 1));

      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    break;
  }
}

function applyExpoSupabaseEnvFallbacks() {
  loadRootEnvFile();

  process.env.EXPO_PUBLIC_SUPABASE_URL ??= process.env.VITE_SUPABASE_URL;
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= process.env.VITE_SUPABASE_ANON_KEY;
}

applyExpoSupabaseEnvFallbacks();

export default {
  expo: {
    name: "Sanction Todos Mobile",
    slug: "sanction-todos-mobile",
    scheme: "sanction-todos-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
  },
};
