import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import type { TodoAppState } from "todo-app";

import { styles } from "../styles/mobile-shell.ts";

type MobileTodoItem = TodoAppState["todos"][number];

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MobileTodoRow({
  disabled,
  isEditing,
  onCancelEdit,
  onDelete,
  onSaveEdit,
  onStartEdit,
  onToggleComplete,
  todo,
}: {
  disabled: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  onDelete: (todoId: string) => void;
  onSaveEdit: (todoId: string, title: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onToggleComplete: (todo: MobileTodoItem) => void;
  todo: MobileTodoItem;
}) {
  const [draft, setDraft] = useState(todo.title);
  const isOptimistic = todo.id.startsWith("optimistic-");

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.id, todo.title]);

  return (
    <View style={[styles.todoRow, todo.completed ? styles.todoRowComplete : null]}>
      <View style={styles.todoHeader}>
        <View style={styles.todoMeta}>
          <Text style={styles.todoEyebrow}>{isOptimistic ? "SYNCING" : "UPDATED"}</Text>
          <Text style={styles.todoMetaText}>
            {isOptimistic ? "Waiting for Supabase" : formatUpdatedAt(todo.updatedAt)}
          </Text>
        </View>
        <Switch
          disabled={disabled}
          onValueChange={() => onToggleComplete(todo)}
          value={todo.completed}
        />
      </View>

      {isEditing ? (
        <View style={styles.editStack}>
          <TextInput
            editable={!disabled}
            onChangeText={setDraft}
            placeholder="Update task title"
            style={styles.input}
            value={draft}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={disabled}
              onPress={() => onSaveEdit(todo.id, draft)}
              style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.secondaryButtonText}>Save</Text>
            </Pressable>
            <Pressable
              disabled={disabled}
              onPress={onCancelEdit}
              style={[styles.ghostButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.ghostButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={[styles.todoTitle, todo.completed ? styles.todoTitleComplete : null]}>
          {todo.title}
        </Text>
      )}

      {!isEditing ? (
        <View style={styles.inlineActions}>
          <Pressable
            disabled={disabled}
            onPress={() => onStartEdit(todo)}
            style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null]}
          >
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            disabled={disabled}
            onPress={() => onDelete(todo.id)}
            style={[styles.dangerButton, disabled ? styles.buttonDisabled : null]}
          >
            <Text style={styles.dangerButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
