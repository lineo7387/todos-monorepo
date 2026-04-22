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
    <>
      <section className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h2>Keep your workspaces moving from one place.</h2>
          <p className="dashboard-hero__body">
            Open my workspace, check joined teams, or jump into join team and create team without
            loading extra dashboard chrome.
          </p>
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

      <section className="page-grid">
        {actions.map((action) => (
          <button
            className={`route-card ${action.route.name === "personal-workspace" ? "route-card--feature" : ""}`}
            key={action.eyebrow}
            onClick={() => onNavigate(action.route)}
            type="button"
          >
            <p className="page-eyebrow">{action.eyebrow}</p>
            <h3>{action.title}</h3>
            <p>{action.body}</p>
          </button>
        ))}
      </section>
    </>
  );
}
