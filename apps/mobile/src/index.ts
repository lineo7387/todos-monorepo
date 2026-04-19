import { registerRootComponent } from "expo";

import { MobileTodoApp } from "./App.tsx";

registerRootComponent(MobileTodoApp);

export { MobileTodoApp, default, mobileAppTarget } from "./App.tsx";
export { getMobileSupabaseEnv, type MobileSupabaseEnv } from "./env.ts";
export { createSecureStoreSessionStorageAdapter } from "./storage.ts";
