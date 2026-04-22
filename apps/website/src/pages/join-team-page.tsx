import type { FormEvent } from "react";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";

export interface JoinTeamPageProps {
  feedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  inviteCode: string;
  isSubmitting: boolean;
  onDismissFeedback: () => void;
  onNavigate: (route: WebsiteRoute) => void;
  onInviteCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  source: "link" | "manual";
}

export function JoinTeamPage({
  feedback,
  inviteCode,
  isSubmitting,
  onDismissFeedback,
  onNavigate,
  onInviteCodeChange,
  onSubmit,
  source,
}: JoinTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Join team</p>
          <h2>Join a shared workspace with an invite.</h2>
          <p>
            Open a shared invite link or paste the invite code directly. After a successful join, we
            will take you straight into the team detail page.
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

      <section className="join-team-layout">
        <form className="join-team-panel" onSubmit={onSubmit}>
          <div>
            <p className="page-eyebrow">
              {source === "link" ? "Invite link opened" : "Invite code"}
            </p>
            <h3>
              {source === "link"
                ? "We prefilled the invite for you."
                : "Paste an invite to continue."}
            </h3>
            <p className="join-team-panel__body">
              Invite acceptance stays in the authenticated flow so the shared workspace appears in
              your dashboard and team navigation as soon as membership is granted.
            </p>
          </div>

          {feedback ? (
            <div
              className={`feedback-banner ${feedback.kind === "notice" ? "is-notice" : "is-error"}`}
            >
              <p>{feedback.message}</p>
              <button onClick={onDismissFeedback} type="button">
                Dismiss
              </button>
            </div>
          ) : null}

          <label className="join-team-panel__field">
            <span>Invite code</span>
            <input
              autoCapitalize="none"
              autoCorrect="off"
              name="inviteCode"
              onChange={(event) => onInviteCodeChange(event.currentTarget.value)}
              placeholder="Paste invite code"
              value={inviteCode}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Joining team..." : "Join team"}
          </button>
        </form>

        <section className="join-team-aside">
          <p className="page-eyebrow">What happens next</p>
          <h3>Membership sync keeps the workspace list current.</h3>
          <p>
            The join action redeems the invite, refreshes your joined teams, and lands you in the
            target team workspace while keeping your personal workspace available in navigation.
          </p>
          <RouteLink
            className="button-link button-link--muted"
            onNavigate={onNavigate}
            route={{ name: "team-list" }}
          >
            Browse current teams
          </RouteLink>
        </section>
      </section>
    </>
  );
}
