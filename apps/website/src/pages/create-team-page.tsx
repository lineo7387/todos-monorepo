import type { FormEvent } from "react";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";

export interface CreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: WebsiteRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: CreateTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Create team</p>
          <h2>Start a shared workspace from its own page.</h2>
          <p>
            Successful creation will send you straight to the new team detail route to keep the
            workspace model URL-driven.
          </p>
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
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Teams
          </RouteLink>
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
