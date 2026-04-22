import type { ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";

export interface WorkspaceShellHeaderWorkspace {
  kind: "personal" | "team";
  name: string;
}

export interface WorkspaceShellWorkspaceHeaderProps {
  introBody: string;
  introEyebrow: string;
  introTitle: string;
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
  renderNavigationAction,
  workspace,
}: WorkspaceShellWorkspaceHeaderProps) {
  const secondaryRoute =
    workspace?.kind === "team" ? { name: "team-list" as const } : { name: "create-team" as const };
  const secondaryLabel = workspace?.kind === "team" ? "All teams" : "Create team";

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
            label: "Dashboard",
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
              {workspace.kind === "team" ? "Team workspace" : "Personal workspace"}
            </span>
            <span className="workspace-switcher__hint">
              {workspace.kind === "team"
                ? "Create, edit, complete, and delete actions apply to this shared team list."
                : "Create, edit, complete, and delete actions stay scoped to your personal list."}
            </span>
          </div>
        ) : null}
      </section>
    </>
  );
}
