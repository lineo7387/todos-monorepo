import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

const monorepoRoot = fileURLToPath(new URL("../../", import.meta.url));

export default defineConfig({
  envDir: monorepoRoot,
});
