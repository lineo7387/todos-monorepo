import type { ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";

export interface WorkspaceShellDashboardStat {
  label: string;
  value: string;
}

export interface WorkspaceShellDashboardAction {
  body: string;
  eyebrow: string;
  route: WorkspaceShellRoute;
  title: string;
}

export interface WorkspaceShellDashboardPageProps {
  actions: WorkspaceShellDashboardAction[];
  heroBody: string;
  renderActionCard: (action: WorkspaceShellDashboardAction) => ReactNode;
  stats: WorkspaceShellDashboardStat[];
}

export function WorkspaceShellDashboardPage({
  actions,
  heroBody,
  renderActionCard,
  stats,
}: WorkspaceShellDashboardPageProps) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h2>Keep your workspaces moving from one place.</h2>
          <p className="dashboard-hero__body">{heroBody}</p>
        </div>

        <div className="dashboard-stats" role="list">
          {stats.map((stat) => (
            <div className="dashboard-stat" key={stat.label} role="listitem">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="page-grid">{actions.map((action) => renderActionCard(action))}</section>
    </>
  );
}
