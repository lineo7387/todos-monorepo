export const desktopAppTarget = {
  id: "desktop",
  runtime: "electron",
  envPrefix: "VITE_",
  sessionStorageStrategy: "electron-secure-store",
  sharedPackages: ["todo-domain", "todo-data", "todo-app"],
} as const;
