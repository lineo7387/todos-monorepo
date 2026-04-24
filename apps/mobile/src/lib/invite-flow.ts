import {
  extractInviteCode as extractWorkspaceInviteCode,
  getCreateInviteSuccessOutcome as getCreateWorkspaceInviteSuccessOutcome,
  getJoinInviteFailureFeedback as getWorkspaceJoinInviteFailureFeedback,
  getJoinTeamSuccessOutcome,
} from "workspace-shell";

export type MobileJoinFeedback = {
  kind: "error" | "notice";
  message: string;
};

type MobileWorkspaceSummary = {
  id: string;
  name: string;
  teamId?: string | null;
};

type JoinInviteFailureInput = {
  error: unknown;
  lastError: string | null;
  lastErrorKind: string | null;
};

export const extractInviteCode = extractWorkspaceInviteCode;

export function getCreateInviteSuccessOutcome(
  input: { expiresAt: string; token: string },
  locale?: string | null,
) {
  return getCreateWorkspaceInviteSuccessOutcome(input, "mobile join team screen", locale);
}

export function getJoinInviteSuccessOutcome(input: {
  activeWorkspaceId: string | null;
  locale?: string | null;
  workspace: MobileWorkspaceSummary;
}) {
  return getJoinTeamSuccessOutcome(input.workspace, {
    activeWorkspaceId: input.activeWorkspaceId,
    locale: input.locale,
    navigationLabel: "mobile destinations",
    teamSection: "tasks",
  });
}

export function getJoinInviteFailureFeedback(input: JoinInviteFailureInput): MobileJoinFeedback {
  return getWorkspaceJoinInviteFailureFeedback(input);
}
