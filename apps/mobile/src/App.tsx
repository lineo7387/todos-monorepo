import { MobileAppShell } from "./shell/mobile-shell.tsx";

export function MobileTodoApp() {
  return <MobileAppShell />;
}

export const mobileAppTarget = {
  id: "mobile",
  runtime: "react-native",
  envPrefix: "EXPO_PUBLIC_",
  sessionStorageStrategy: "secure-device-storage",
  sharedPackages: ["todo-domain", "todo-data", "todo-app", "workspace-shell"],
} as const;

export default MobileTodoApp;
