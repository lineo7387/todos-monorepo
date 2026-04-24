import {
  extractInviteCode as extractWorkspaceInviteCode,
  getCreateInviteSuccessOutcome as getCreateWorkspaceInviteSuccessOutcome,
  getJoinInviteFailureFeedback as getWorkspaceJoinInviteFailureFeedback,
  getJoinTeamSuccessOutcome,
} from "workspace-shell";

export type DesktopJoinFeedback = {
  kind: "error" | "notice";
  message: string;
};

type DesktopWorkspaceSummary = {
  id: string;
  name: string;
  teamId?: string | null;
};

type JoinInviteFailureInput = {
  error: unknown;
  lastError: string | null;
  lastErrorKind: string | null;
  locale?: string | null;
};

export const extractInviteCode = extractWorkspaceInviteCode;

export function getCreateInviteSuccessOutcome(
  input: { expiresAt: string; token: string },
  locale?: string | null,
) {
  return getCreateWorkspaceInviteSuccessOutcome(input, "desktop or dashboard join flow", locale);
}

export function getJoinInviteSuccessOutcome(input: {
  activeWorkspaceId: string | null;
  locale?: string | null;
  workspace: DesktopWorkspaceSummary;
}) {
  return getJoinTeamSuccessOutcome(input.workspace, {
    activeWorkspaceId: input.activeWorkspaceId,
    locale: input.locale,
    navigationLabel: "desktop navigation",
    teamSection: "tasks",
  });
}

export function getJoinInviteFailureFeedback(input: JoinInviteFailureInput): DesktopJoinFeedback {
  return getWorkspaceJoinInviteFailureFeedback(input);
}
