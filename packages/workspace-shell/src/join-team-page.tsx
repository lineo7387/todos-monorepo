import type { FormEvent, ReactNode } from "react";

import type { WorkspaceShellRoute } from "./index.ts";
import { getWorkspaceShellResource } from "./index.ts";

export interface WorkspaceShellJoinTeamFeedback {
  kind: "error" | "notice";
  message: string;
}

export interface WorkspaceShellJoinTeamPageProps {
  feedback: WorkspaceShellJoinTeamFeedback | null;
  heroBody: string;
  inputName?: string;
  inputValue: string;
  inviteHeading: string;
  locale?: string | null;
  inviteEyebrow: string;
  inviteBody: string;
  isSubmitting: boolean;
  onDismissFeedback: () => void;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  renderNavigationAction: (input: {
    className: string;
    label: string;
    route: WorkspaceShellRoute;
  }) => ReactNode;
  trailingContent?: ReactNode;
}

export function WorkspaceShellJoinTeamPage({
  feedback,
  heroBody,
  inputName,
  inputValue,
  inviteHeading,
  locale,
  inviteEyebrow,
  inviteBody,
  isSubmitting,
  onDismissFeedback,
  onInputChange,
  onSubmit,
  renderNavigationAction,
  trailingContent,
}: WorkspaceShellJoinTeamPageProps) {
  const resource = getWorkspaceShellResource(locale);

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="page-eyebrow">Join team</p>
          <h2>Join a shared workspace with an invite.</h2>
          <p>{heroBody}</p>
        </div>

        <div className="page-intro__actions">
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.dashboard.label,
            route: { name: "dashboard" },
          })}
          {renderNavigationAction({
            className: "button-link button-link--muted",
            label: resource.destinations.teamList.label,
            route: { name: "team-list" },
          })}
        </div>
      </section>

      <section className="join-team-layout">
        <form className="join-team-panel" onSubmit={onSubmit}>
          <div>
            <p className="page-eyebrow">{inviteEyebrow}</p>
            <h3>{inviteHeading}</h3>
            <p className="join-team-panel__body">{inviteBody}</p>
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
              disabled={isSubmitting}
              name={inputName}
              onChange={(event) => onInputChange(event.currentTarget.value)}
              placeholder="Paste invite code"
              value={inputValue}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Joining team..." : "Join team"}
          </button>
        </form>

        {trailingContent}
      </section>
    </>
  );
}
