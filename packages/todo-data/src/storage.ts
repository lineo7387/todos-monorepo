import type { SupportedStorage } from "@supabase/supabase-js";

import type { TodoSessionStorageAdapter, TodoWebStorageLike } from "./types.ts";

export function createMemorySessionStorageAdapter(
  initialValues: Record<string, string> = {},
): TodoSessionStorageAdapter & { snapshot(): Record<string, string> } {
  const store = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
    snapshot() {
      return Object.fromEntries(store.entries());
    },
  };
}

export function createBrowserSessionStorageAdapter(
  storage: TodoWebStorageLike,
): TodoSessionStorageAdapter {
  return {
    getItem(key) {
      return storage.getItem(key);
    },
    setItem(key, value) {
      storage.setItem(key, value);
    },
    removeItem(key) {
      storage.removeItem(key);
    },
  };
}

export function createSupabaseStorageAdapter(storage: TodoSessionStorageAdapter): SupportedStorage {
  return {
    isServer: false,
    async getItem(key: string) {
      return storage.getItem(key);
    },
    async setItem(key: string, value: string) {
      await storage.setItem(key, value);
    },
    async removeItem(key: string) {
      await storage.removeItem(key);
    },
  };
}
