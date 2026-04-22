import type { TodoAppErrorKind } from "todo-app";

import type { DesktopRoute } from "./routes.ts";

export type DesktopJoinFeedback = {
  kind: "error" | "notice" | "success";
  message: string;
};

type DesktopInviteRecord = {
  token: string;
  expiresAt: string;
};

type DesktopWorkspaceSummary = {
  id: string;
  name: string;
  teamId?: string | null;
};

type JoinInviteFailureInput = {
  error: unknown;
  lastError: string | null;
  lastErrorKind: TodoAppErrorKind | null;
};

export function extractInviteCode(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return "";
  }

  try {
    const url = new URL(trimmedValue);
    const inviteCode = url.searchParams.get("invite");

    return inviteCode?.trim() || trimmedValue;
  } catch {
    return trimmedValue;
  }
}

export function getCreateInviteSuccessOutcome(invite: DesktopInviteRecord) {
  return {
    code: invite.token,
    expiresAt: invite.expiresAt,
    message:
      "Invite ready to share. Teammates can paste this code into the desktop or dashboard join flow.",
  };
}

export function getJoinInviteSuccessOutcome(input: {
  activeWorkspaceId: string | null;
  workspace: DesktopWorkspaceSummary;
}) {
  return {
    feedback: {
      kind: "success",
      message: `Invite accepted. Desktop opened ${input.workspace.name} so your team workspace is ready right away.`,
    } satisfies DesktopJoinFeedback,
    route: {
      name: "team-detail",
      teamId: input.workspace.teamId ?? input.workspace.id,
      section: "tasks",
    } satisfies DesktopRoute,
    routeNotice: `You can now work in ${input.workspace.name}. My workspace stays available from desktop navigation.`,
    selectWorkspaceId: input.activeWorkspaceId === input.workspace.id ? null : input.workspace.id,
  };
}

export function getJoinInviteFailureFeedback(input: JoinInviteFailureInput): DesktopJoinFeedback {
  return {
    kind: input.lastErrorKind === "notice" ? "notice" : "error",
    message:
      input.lastError ??
      (input.error instanceof Error && input.error.message.length > 0
        ? input.error.message
        : "We couldn't accept that invite. Check the code and try again."),
  };
}
