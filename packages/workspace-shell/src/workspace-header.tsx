import type { ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";
import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellHeaderWorkspace {
  kind: "personal" | "team";
  name: string;
}

export interface WorkspaceShellWorkspaceHeaderProps {
  introBody: string;
  introEyebrow: string;
  introTitle: string;
  locale?: string | null;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  workspace: WorkspaceShellHeaderWorkspace | null;
}

export function WorkspaceShellWorkspaceHeader({
  introBody,
  introEyebrow,
  introTitle,
  locale,
  renderNavigationAction,
  workspace,
}: WorkspaceShellWorkspaceHeaderProps) {
  const resource = getWorkspaceShellResource(locale);
  const secondaryRoute =
    workspace?.kind === "team" ? { name: "team-list" as const } : { name: "create-team" as const };
  const secondaryLabel =
    workspace?.kind === "team"
      ? resource.pages.workspace.allTeams
      : resource.destinations.createTeam.label;

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">{introEyebrow}</p>
          <h2>{introTitle}</h2>
          <p>{introBody}</p>
        </div>

        <div className="page-intro__actions">
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.dashboard.label,
            route: { name: "dashboard" },
          })}
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: secondaryLabel,
            route: secondaryRoute,
          })}
        </div>
      </section>

      <section className="workspace-summary">
        {workspace ? (
          <div className="workspace-summary__meta">
            <span className={`workspace-badge workspace-badge--${workspace.kind}`}>
              {workspace.kind === "team"
                ? resource.pages.workspace.teamWorkspaceBadge
                : resource.pages.workspace.personalWorkspaceBadge}
            </span>
            <span className="workspace-switcher__hint">
              {workspace.kind === "team"
                ? resource.pages.workspace.teamIntroBody
                : resource.pages.workspace.personalIntroBody}
            </span>
          </div>
        ) : null}
      </section>
    </>
  );
}
