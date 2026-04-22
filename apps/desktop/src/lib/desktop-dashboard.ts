import type { DesktopRoute } from "../routing/routes.ts";

type DesktopWorkspaceSummary = {
  id: string;
  kind: "personal" | "team";
  name: string;
  teamId?: string | null;
};

export interface DeriveDesktopDashboardInput {
  personalWorkspace: DesktopWorkspaceSummary | null;
  teamWorkspaces: DesktopWorkspaceSummary[];
}

export interface DesktopDashboardAction {
  body: string;
  eyebrow: string;
  route: DesktopRoute;
  title: string;
}

export interface DeriveDesktopDashboardResult {
  actions: DesktopDashboardAction[];
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export function deriveDesktopDashboard(
  input: DeriveDesktopDashboardInput,
): DeriveDesktopDashboardResult {
  return {
    actions: [
      {
        body: input.personalWorkspace
          ? "Open your personal task list as its own desktop destination."
          : "Your personal workspace will appear here as soon as it is available.",
        eyebrow: "My workspace",
        route: { name: "personal-workspace", section: "tasks" },
        title: input.personalWorkspace?.name ?? "Personal workspace",
      },
      {
        body: "Browse your joined teams and jump into a dedicated team detail destination.",
        eyebrow: "Joined teams",
        route: { name: "team-list" },
        title: `${input.teamWorkspaces.length} joined team${input.teamWorkspaces.length === 1 ? "" : "s"}`,
      },
      {
        body: "Redeem an invite without keeping the join flow embedded in every desktop page.",
        eyebrow: "Join team",
        route: { name: "join-team" },
        title: "Accept an invite",
      },
      {
        body: "Start a new shared workspace from its own dedicated desktop destination.",
        eyebrow: "Create team",
        route: { name: "create-team" },
        title: "Start a shared workspace",
      },
    ],
    stats: [
      {
        label: "My workspace",
        value: input.personalWorkspace?.name ?? "Ready",
      },
      {
        label: "Joined teams",
        value: String(input.teamWorkspaces.length),
      },
    ],
  };
}
