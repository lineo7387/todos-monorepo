import type { FormEvent } from "react";

import type { DesktopRoute } from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopCreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function DesktopCreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: DesktopCreateTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Create team</p>
          <h2>Start a shared workspace from its own page.</h2>
          <p>
            Successful creation sends you straight into the new team detail destination so the
            signed-in flow stays aligned with web.
          </p>
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
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </DesktopActionLink>
        </div>
      </section>

      <form className="standalone-form" onSubmit={onSubmit}>
        <label className="composer__field">
          <span>Team name</span>
          <input
            disabled={!canManageTodos}
            onChange={(event) => onDraftTeamNameChange(event.currentTarget.value)}
            placeholder="Product Ops"
            value={draftTeamName}
          />
        </label>

        <button disabled={!canManageTodos} type="submit">
          Create team
        </button>
      </form>
    </>
  );
}
