import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";
import type { WebsiteWorkspace } from "./types.ts";

export interface DashboardPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  personalWorkspace: WebsiteWorkspace | null;
  teamCount: number;
}

export function DashboardPage({ onNavigate, personalWorkspace, teamCount }: DashboardPageProps) {
  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="page-eyebrow">Dashboard</p>
          <h2>Keep your workspaces moving from one place.</h2>
          <p className="dashboard-hero__body">
            The web client now lands on a dedicated dashboard instead of a persistent two-column
            shell, so each destination can have its own page shape.
          </p>
        </div>

        <div className="dashboard-stats" role="list">
          <div className="dashboard-stat" role="listitem">
            <span>My workspace</span>
            <strong>{personalWorkspace?.name ?? "Ready"}</strong>
          </div>
          <div className="dashboard-stat" role="listitem">
            <span>Joined teams</span>
            <strong>{teamCount}</strong>
          </div>
          <div className="dashboard-stat" role="listitem">
            <span>Next focus</span>
            <strong>Join and create flows</strong>
          </div>
        </div>
      </section>

      <section className="page-grid">
        <RouteLink
          className="route-card route-card--feature"
          onNavigate={onNavigate}
          route={{ name: "personal-workspace" }}
        >
          <p className="page-eyebrow">My workspace</p>
          <h3>{personalWorkspace?.name ?? "Personal workspace"}</h3>
          <p>Open your personal task list as its own focused page.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "team-list" }}>
          <p className="page-eyebrow">Teams</p>
          <h3>
            {teamCount} joined team{teamCount === 1 ? "" : "s"}
          </h3>
          <p>Browse current memberships and jump to a dedicated team detail page.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "join-team" }}>
          <p className="page-eyebrow">Join team</p>
          <h3>Accept an invite</h3>
          <p>Use a dedicated join surface instead of layering flows into one workspace screen.</p>
        </RouteLink>

        <RouteLink className="route-card" onNavigate={onNavigate} route={{ name: "create-team" }}>
          <p className="page-eyebrow">Create team</p>
          <h3>Start a shared workspace</h3>
          <p>Create a team from its own page and continue into the resulting detail view.</p>
        </RouteLink>
      </section>
    </>
  );
}
