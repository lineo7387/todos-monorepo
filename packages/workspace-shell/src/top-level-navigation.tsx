import type { ReactNode } from "react";

export interface WorkspaceTopNavigationItem<TRoute> {
  description: string;
  isActive: boolean;
  key: string;
  label: string;
  route: TRoute;
}

export interface WorkspaceTopNavigationTeam<TRoute> {
  id: string;
  isActive: boolean;
  name: string;
  route: TRoute;
}

export interface RenderWorkspaceTopNavigationActionInput<TRoute> {
  children: ReactNode;
  className: string;
  key: string;
  route: TRoute;
}

export interface WorkspaceTopNavigationProps<TRoute> {
  emptyTeamsCopy: string;
  joinedTeamsCopy: string;
  joinedTeamsLabel: string;
  navigationBody: string;
  navigationHeading: string;
  navigationSubtitle: string;
  primaryItems: WorkspaceTopNavigationItem<TRoute>[];
  renderAction: (input: RenderWorkspaceTopNavigationActionInput<TRoute>) => ReactNode;
  teams: WorkspaceTopNavigationTeam<TRoute>[];
}

export function WorkspaceTopNavigation<TRoute>({
  emptyTeamsCopy,
  joinedTeamsCopy,
  joinedTeamsLabel,
  navigationBody,
  navigationHeading,
  navigationSubtitle,
  primaryItems,
  renderAction,
  teams,
}: WorkspaceTopNavigationProps<TRoute>) {
  return (
    <nav aria-label={navigationHeading} className="top-nav">
      <div className="top-nav__header">
        <div>
          <p className="page-eyebrow">{navigationHeading}</p>
          <h2>{navigationSubtitle}</h2>
        </div>
        <p className="top-nav__body">{navigationBody}</p>
      </div>

      <div className="top-nav__primary" role="list">
        {primaryItems.map((item) =>
          renderAction({
            children: (
              <>
                <span>{item.label}</span>
                <strong>{item.description}</strong>
              </>
            ),
            className: item.isActive ? "top-nav__link is-active" : "top-nav__link",
            key: item.key,
            route: item.route,
          }),
        )}
      </div>

      <div className="top-nav__teams">
        <div>
          <p className="page-eyebrow">{joinedTeamsLabel}</p>
          <p className="top-nav__teams-copy">{joinedTeamsCopy}</p>
        </div>

        {teams.length > 0 ? (
          <div className="top-nav__team-list" role="list">
            {teams.map((team) =>
              renderAction({
                children: (
                  <>
                    <span>Team</span>
                    <strong>{team.name}</strong>
                  </>
                ),
                className: team.isActive ? "top-nav__link is-active" : "top-nav__link",
                key: team.id,
                route: team.route,
              }),
            )}
          </div>
        ) : (
          <p className="top-nav__empty">{emptyTeamsCopy}</p>
        )}
      </div>
    </nav>
  );
}
