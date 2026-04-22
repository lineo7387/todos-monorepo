import type { FormEvent } from "react";
import { WorkspaceShellJoinTeamPage, type WorkspaceShellJoinTeamFeedback } from "workspace-shell";

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
    <WorkspaceShellJoinTeamPage
      feedback={feedback as WorkspaceShellJoinTeamFeedback | null}
      heroBody="Open a shared invite link or paste the invite code directly. After a successful join, we will take you straight into the team detail page."
      inputName="inviteCode"
      inputValue={inviteCode}
      inviteBody="Invite acceptance stays in the authenticated flow so the shared workspace appears in your dashboard and team navigation as soon as membership is granted."
      inviteEyebrow={source === "link" ? "Invite link opened" : "Invite code"}
      inviteHeading={
        source === "link" ? "We prefilled the invite for you." : "Paste an invite to continue."
      }
      isSubmitting={isSubmitting}
      onDismissFeedback={onDismissFeedback}
      onInputChange={onInviteCodeChange}
      onSubmit={onSubmit}
      renderNavigationAction={({ className, label, route }) => (
        <RouteLink className={className} onNavigate={onNavigate} route={route as WebsiteRoute}>
          {label}
        </RouteLink>
      )}
      trailingContent={
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
      }
    />
  );
}
