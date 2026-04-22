import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";
import type { WebsiteWorkspace } from "./types.ts";

export interface TeamListPageProps {
  onNavigate: (route: WebsiteRoute) => void;
  teams: WebsiteWorkspace[];
}

export function TeamListPage({ onNavigate, teams }: TeamListPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <h2>Team workspaces</h2>
          <p>Open each shared workspace from its own URL-backed detail page.</p>
        </div>
        <div className="page-intro__actions">
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </RouteLink>
          <RouteLink
            className="button-link"
            onNavigate={onNavigate}
            route={{ name: "create-team" }}
          >
            Create team
          </RouteLink>
        </div>
      </section>

      {teams.length === 0 ? (
        <section className="empty-state">
          <p className="empty-state__eyebrow">No joined teams yet</p>
          <h3>Your teams will appear here.</h3>
          <p>Create a team or redeem an invite to populate this list.</p>
        </section>
      ) : (
        <section className="page-grid">
          {teams.map((workspace) => (
            <RouteLink
              className="route-card"
              key={workspace.id}
              onNavigate={onNavigate}
              route={{ name: "team-detail", teamId: workspace.teamId ?? workspace.id }}
            >
              <p className="page-eyebrow">Team detail</p>
              <h3>{workspace.name}</h3>
              <p>Open the dedicated page for this shared workspace.</p>
            </RouteLink>
          ))}
        </section>
      )}
    </>
  );
}
