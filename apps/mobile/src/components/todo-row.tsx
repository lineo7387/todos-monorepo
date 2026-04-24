import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";
import type { TodoAppState } from "todo-app";
import { getWorkspaceShellResource } from "workspace-shell";

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
  locale,
  todo,
}: {
  disabled: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;
  onDelete: (todoId: string) => void;
  onSaveEdit: (todoId: string, title: string, dueDate: string) => void;
  onStartEdit: (todo: MobileTodoItem) => void;
  onToggleComplete: (todo: MobileTodoItem) => void;
  locale?: string | null;
  todo: MobileTodoItem;
}) {
  const resource = getWorkspaceShellResource(locale);
  const [draft, setDraft] = useState(todo.title);
  const [draftDueDate, setDraftDueDate] = useState(todo.dueDate ?? "");
  const isOptimistic = todo.id.startsWith("optimistic-");

  useEffect(() => {
    setDraft(todo.title);
    setDraftDueDate(todo.dueDate ?? "");
  }, [todo.dueDate, todo.id, todo.title]);

  return (
    <View style={[styles.todoRow, todo.completed ? styles.todoRowComplete : null]}>
      <View style={styles.todoHeader}>
        <View style={styles.todoMeta}>
          <Text style={styles.todoEyebrow}>
            {isOptimistic ? resource.pages.todo.syncing : resource.pages.todo.updated}
          </Text>
          <Text style={styles.todoMetaText}>
            {isOptimistic
              ? resource.pages.todo.waitingForSupabase
              : formatUpdatedAt(todo.updatedAt)}
          </Text>
          {todo.dueDate ? (
            <Text style={styles.todoMetaText}>
              {resource.pages.todo.due.replace("{{date}}", todo.dueDate)}
            </Text>
          ) : null}
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
            placeholder={resource.fields.updateTaskTitlePlaceholder}
            style={styles.input}
            value={draft}
          />
          <TextInput
            editable={!disabled}
            onChangeText={setDraftDueDate}
            placeholder={resource.fields.dueDatePlaceholder}
            style={styles.input}
            value={draftDueDate}
          />
          <View style={styles.inlineActions}>
            <Pressable
              disabled={disabled}
              onPress={() => onSaveEdit(todo.id, draft, draftDueDate)}
              style={[styles.secondaryButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.secondaryButtonText}>{resource.actions.save}</Text>
            </Pressable>
            <Pressable
              disabled={disabled}
              onPress={onCancelEdit}
              style={[styles.ghostButton, disabled ? styles.buttonDisabled : null]}
            >
              <Text style={styles.ghostButtonText}>{resource.actions.cancel}</Text>
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
            <Text style={styles.secondaryButtonText}>{resource.actions.edit}</Text>
          </Pressable>
          <Pressable
            disabled={disabled}
            onPress={() => onDelete(todo.id)}
            style={[styles.dangerButton, disabled ? styles.buttonDisabled : null]}
          >
            <Text style={styles.dangerButtonText}>{resource.actions.delete}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
