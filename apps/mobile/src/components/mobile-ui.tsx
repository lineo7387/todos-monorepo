import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "../styles/mobile-shell.ts";

export function SectionCard({
  children,
  emphasized = false,
}: {
  children: ReactNode;
  emphasized?: boolean;
}) {
  return <View style={[styles.card, emphasized ? styles.cardEmphasized : null]}>{children}</View>;
}

export function Banner({
  actionLabel,
  muted = false,
  onAction,
  text,
  tone = "accent",
}: {
  actionLabel?: string;
  muted?: boolean;
  onAction?: () => void;
  text: string;
  tone?: "accent" | "danger";
}) {
  const isDanger = tone === "danger";

  return (
    <View
      style={[
        styles.banner,
        muted ? styles.bannerMuted : isDanger ? styles.bannerDanger : styles.bannerAccent,
      ]}
    >
      <Text
        style={[
          styles.bannerText,
          muted
            ? styles.bannerTextMuted
            : isDanger
              ? styles.bannerTextDanger
              : styles.bannerTextAccent,
        ]}
      >
        {text}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.bannerButton}>
          <Text
            style={[
              styles.bannerButtonText,
              muted
                ? styles.bannerTextMuted
                : isDanger
                  ? styles.bannerTextDanger
                  : styles.bannerTextAccent,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
