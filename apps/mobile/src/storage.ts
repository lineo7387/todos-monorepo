import * as SecureStore from "expo-secure-store";
import type { TodoSessionStorageAdapter } from "todo-data";

export function createSecureStoreSessionStorageAdapter(): TodoSessionStorageAdapter {
  return {
    async getItem(key) {
      return SecureStore.getItemAsync(key);
    },
    async setItem(key, value) {
      await SecureStore.setItemAsync(key, value);
    },
    async removeItem(key) {
      await SecureStore.deleteItemAsync(key);
    },
  };
}
