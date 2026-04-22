import type { FormEvent } from "react";
import { WorkspaceShellJoinTeamPage, type WorkspaceShellJoinTeamFeedback } from "workspace-shell";

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
    <WorkspaceShellJoinTeamPage
      feedback={feedback as WorkspaceShellJoinTeamFeedback | null}
      heroBody="Open a shared invite link or paste the invite code directly. After a successful join, desktop takes you straight into the team detail page."
      inputValue={inputValue}
      inviteBody="Invite acceptance stays inside the signed-in desktop flow so your shared workspace appears in dashboard and team navigation as soon as membership is granted."
      inviteEyebrow="Invite code"
      inviteHeading="Paste an invite to continue."
      isSubmitting={isSubmitting}
      onDismissFeedback={onDismissFeedback}
      onInputChange={onInputChange}
      onSubmit={onSubmit}
      renderNavigationAction={({ className, label, route }) => (
        <DesktopActionLink
          className={className}
          onNavigate={onNavigate}
          route={route as DesktopRoute}
        >
          {label}
        </DesktopActionLink>
      )}
    />
  );
}
