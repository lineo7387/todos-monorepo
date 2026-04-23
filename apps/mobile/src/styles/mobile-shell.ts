import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe7",
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    gap: 16,
    borderRadius: 24,
    backgroundColor: "#fffaf3",
    padding: 20,
  },
  cardEmphasized: {
    backgroundColor: "#1f4f46",
  },
  eyebrow: {
    color: "#8a7a63",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: "#fffdf6",
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 36,
  },
  body: {
    color: "#6f604d",
    fontSize: 15,
    lineHeight: 22,
  },
  bodyOnDark: {
    color: "#d9efe8",
  },
  code: {
    color: "#fef3c7",
    fontFamily: "Courier",
  },
  headerRow: {
    gap: 16,
  },
  headerCopy: {
    gap: 6,
  },
  sectionTitle: {
    color: "#2e2418",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
  sectionSubtitle: {
    color: "#6f604d",
    fontSize: 14,
    lineHeight: 20,
  },
  sessionText: {
    color: "#6f604d",
    fontSize: 13,
  },
  stack: {
    gap: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dacbb7",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#2e2418",
    fontSize: 16,
  },
  fieldError: {
    color: "#b45309",
    fontSize: 13,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#1f4f46",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#fffdf6",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#e6efe9",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#1f4f46",
    fontSize: 14,
    fontWeight: "700",
  },
  ghostButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dacbb7",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: "#4b3c2a",
    fontSize: 14,
    fontWeight: "700",
  },
  dangerButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#fff1eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: "#c2410c",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  banner: {
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerMuted: {
    backgroundColor: "#eee5d8",
  },
  bannerAccent: {
    backgroundColor: "#dff0ec",
  },
  bannerDanger: {
    backgroundColor: "#fee9e3",
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bannerTextMuted: {
    color: "#6f604d",
  },
  bannerTextAccent: {
    color: "#1f4f46",
  },
  bannerTextDanger: {
    color: "#9a3412",
  },
  bannerButton: {
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#1f4f46",
    fontSize: 13,
    fontWeight: "700",
  },
  destinationRail: {
    gap: 10,
    paddingRight: 4,
  },
  destinationCard: {
    minWidth: 140,
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dacbb7",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  destinationCardActive: {
    borderColor: "#1f4f46",
    backgroundColor: "#e6efe9",
  },
  destinationLabel: {
    color: "#2e2418",
    fontSize: 15,
    fontWeight: "700",
  },
  destinationLabelActive: {
    color: "#1f4f46",
  },
  destinationMeta: {
    color: "#6f604d",
    fontSize: 12,
  },
  destinationMetaActive: {
    color: "#1f4f46",
  },
  workspaceCard: {
    gap: 12,
    borderRadius: 20,
    backgroundColor: "#f5efe6",
    padding: 18,
  },
  workspaceTabs: {
    gap: 10,
    paddingRight: 4,
  },
  workspaceTab: {
    minWidth: 168,
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dacbb7",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  workspaceTabActive: {
    borderColor: "#1f4f46",
    backgroundColor: "#e6efe9",
  },
  workspaceTabLabel: {
    color: "#2e2418",
    fontSize: 15,
    fontWeight: "700",
  },
  workspaceTabLabelActive: {
    color: "#1f4f46",
  },
  workspaceTabMeta: {
    color: "#6f604d",
    fontSize: 12,
  },
  workspaceTabMetaActive: {
    color: "#1f4f46",
  },
  heroActionGrid: {
    gap: 10,
  },
  composer: {
    gap: 12,
  },
  emptyState: {
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#f5efe6",
    padding: 18,
  },
  todoRow: {
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0d3c0",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  todoRowComplete: {
    backgroundColor: "#eef5f2",
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  todoMeta: {
    gap: 4,
    flexShrink: 1,
  },
  todoEyebrow: {
    color: "#8a7a63",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  todoMetaText: {
    color: "#6f604d",
    fontSize: 13,
  },
  todoTitle: {
    color: "#2e2418",
    fontSize: 18,
    lineHeight: 24,
  },
  todoTitleComplete: {
    color: "#6f604d",
    textDecorationLine: "line-through",
  },
  editStack: {
    gap: 12,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
