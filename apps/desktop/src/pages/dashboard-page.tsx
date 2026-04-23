import {
  WorkspaceShellDashboardPage,
  WorkspaceShellRouteCard,
  type WorkspaceShellDashboardAction,
  type WorkspaceShellDashboardStat,
} from "workspace-shell";

import type { DesktopRoute } from "../routing/routes.ts";

export interface DesktopDashboardPageProps {
  actions: Array<{
    body: string;
    eyebrow: string;
    route: DesktopRoute;
    title: string;
  }>;
  onNavigate: (route: DesktopRoute) => void;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export function DesktopDashboardPage({ actions, onNavigate, stats }: DesktopDashboardPageProps) {
  return (
    <WorkspaceShellDashboardPage
      actions={actions as WorkspaceShellDashboardAction[]}
      heroBody="Open my workspace, check joined teams, or jump into join team and create team without loading extra dashboard chrome."
      renderActionCard={(action) => (
        <button
          className={`route-card ${action.route.name === "personal-workspace" ? "route-card--feature" : ""}`}
          key={action.eyebrow}
          onClick={() => onNavigate(action.route as DesktopRoute)}
          type="button"
        >
          <WorkspaceShellRouteCard
            body={action.body}
            eyebrow={action.eyebrow}
            title={action.title}
          />
        </button>
      )}
      stats={stats as WorkspaceShellDashboardStat[]}
    />
  );
}
