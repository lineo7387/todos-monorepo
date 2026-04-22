import type { FormEvent } from "react";

import type { DesktopRoute } from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopJoinTeamPageProps {
  feedback: {
    kind: "error" | "notice";
    message: string;
  } | null;
  inputValue: string;
  isSubmitting: boolean;
  onInputChange: (value: string) => void;
  onDismissFeedback: () => void;
  onNavigate: (route: DesktopRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function DesktopJoinTeamPage({
  feedback,
  inputValue,
  isSubmitting,
  onDismissFeedback,
  onInputChange,
  onNavigate,
  onSubmit,
}: DesktopJoinTeamPageProps) {
  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Join team</p>
          <h2>Join a shared workspace with an invite.</h2>
          <p>
            Open a shared invite link or paste the invite code directly. After a successful join,
            desktop takes you straight into the team detail page.
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

      <section className="join-team-layout">
        <form className="join-team-panel" onSubmit={onSubmit}>
          <div>
            <p className="page-eyebrow">Invite code</p>
            <h3>Paste an invite to continue.</h3>
            <p className="join-team-panel__body">
              Invite acceptance stays inside the signed-in desktop flow so your shared workspace
              appears in dashboard and team navigation as soon as membership is granted.
            </p>
          </div>

          {feedback ? (
            <div
              className={`feedback-banner ${feedback.kind === "error" ? "is-error" : "is-notice"}`}
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
              disabled={isSubmitting}
              onChange={(event) => onInputChange(event.currentTarget.value)}
              placeholder="Paste invite code"
              value={inputValue}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Joining team..." : "Join team"}
          </button>
        </form>
      </section>
    </>
  );
}
