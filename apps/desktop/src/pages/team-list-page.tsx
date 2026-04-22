import type { DesktopRoute } from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopTeamListPageProps {
  onNavigate: (route: DesktopRoute) => void;
  teams: Array<{
    id: string;
    name: string;
    route: DesktopRoute;
  }>;
}

export function DesktopTeamListPage({ onNavigate, teams }: DesktopTeamListPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Joined teams</p>
          <h2>Team workspaces</h2>
          <p>Open each shared workspace from its own desktop team detail destination.</p>
        </div>

        <div className="page-intro__actions">
          <DesktopActionLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "dashboard" }}
          >
            Dashboard
          </DesktopActionLink>
          <DesktopActionLink
            className="button-link"
            onNavigate={onNavigate}
            route={{ name: "create-team" }}
          >
            Create team
          </DesktopActionLink>
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
          {teams.map((team) => (
            <button
              className="route-card"
              key={team.id}
              onClick={() => onNavigate(team.route)}
              type="button"
            >
              <p className="page-eyebrow">Team detail</p>
              <h3>{team.name}</h3>
              <p>Open the dedicated desktop page for this shared workspace.</p>
            </button>
          ))}
        </section>
      )}
    </>
  );
}
