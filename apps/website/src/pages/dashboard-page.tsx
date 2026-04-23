import {
  WorkspaceShellDashboardPage,
  WorkspaceShellRouteCard,
  type WorkspaceShellDashboardAction,
  type WorkspaceShellDashboardStat,
} from "workspace-shell";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";
import type { WebsiteWorkspace } from "./types.ts";

export interface DashboardPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  personalWorkspace: WebsiteWorkspace | null;
  teamCount: number;
}

export function DashboardPage({ onNavigate, personalWorkspace, teamCount }: DashboardPageProps) {
  const actions: WorkspaceShellDashboardAction[] = [
    {
      body: "Open your personal task list as its own focused page.",
      eyebrow: "My workspace",
      route: { name: "personal-workspace" },
      title: personalWorkspace?.name ?? "Personal workspace",
    },
    {
      body: "Browse current memberships and jump to a dedicated team detail page.",
      eyebrow: "Teams",
      route: { name: "team-list" },
      title: `${teamCount} joined team${teamCount === 1 ? "" : "s"}`,
    },
    {
      body: "Use a dedicated join surface instead of layering flows into one workspace screen.",
      eyebrow: "Join team",
      route: { name: "join-team" },
      title: "Accept an invite",
    },
    {
      body: "Create a team from its own page and continue into the resulting detail view.",
      eyebrow: "Create team",
      route: { name: "create-team" },
      title: "Start a shared workspace",
    },
  ];
  const stats: WorkspaceShellDashboardStat[] = [
    {
      label: "My workspace",
      value: personalWorkspace?.name ?? "Ready",
    },
    {
      label: "Joined teams",
      value: String(teamCount),
    },
    {
      label: "Next focus",
      value: "Join and create flows",
    },
  ];

  return (
    <WorkspaceShellDashboardPage
      actions={actions}
      heroBody="The web client now lands on a dedicated dashboard instead of a persistent two-column shell, so each destination can have its own page shape."
      renderActionCard={(action) => (
        <RouteLink
          className={`route-card ${action.route.name === "personal-workspace" ? "route-card--feature" : ""}`}
          key={action.eyebrow}
          onNavigate={onNavigate}
          route={action.route as WebsiteRoute}
        >
          <WorkspaceShellRouteCard
            body={action.body}
            eyebrow={action.eyebrow}
            title={action.title}
          />
        </RouteLink>
      )}
      stats={stats}
    />
  );
}
