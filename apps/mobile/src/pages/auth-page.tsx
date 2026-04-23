import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import type { TodoAppViewModel } from "todo-app";

import { styles } from "../styles/mobile-shell.ts";

export function MobileAuthPage({
  email,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
  viewModel,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  password: string;
  viewModel: TodoAppViewModel;
}) {
  return (
    <View style={styles.stack}>
      <Text style={styles.sectionTitle}>Sign in to your synced task list</Text>
      <Text style={styles.body}>
        The mobile client restores sessions and loads the same persisted todos used by the web and
        desktop shells.
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={onEmailChange}
        placeholder="user@example.com"
        style={styles.input}
        value={email}
      />
      {viewModel.signInFieldErrors.email ? (
        <Text style={styles.fieldError}>{viewModel.signInFieldErrors.email}</Text>
      ) : null}
      <TextInput
        onChangeText={onPasswordChange}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {viewModel.signInFieldErrors.password ? (
        <Text style={styles.fieldError}>{viewModel.signInFieldErrors.password}</Text>
      ) : null}
      <Pressable
        disabled={viewModel.isLoading}
        onPress={onSubmit}
        style={[styles.primaryButton, viewModel.isLoading ? styles.buttonDisabled : null]}
      >
        {viewModel.isLoading ? (
          <ActivityIndicator color="#fffdf6" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign in</Text>
        )}
      </Pressable>
    </View>
  );
}
