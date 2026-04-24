import { describe, expect, test } from "vite-plus/test";

import {
  extractInviteCode,
  getCreateInviteSuccessOutcome,
  getJoinInviteFailureFeedback,
  getJoinInviteSuccessOutcome,
} from "./invite-flow.ts";

describe("extractInviteCode", () => {
  test("returns a trimmed invite code when the input is already a code", () => {
    expect(extractInviteCode("  joined-team-token  ")).toBe("joined-team-token");
  });

  test("extracts the invite code from a join link", () => {
    expect(extractInviteCode("https://example.com/teams/join?invite=team-token")).toBe(
      "team-token",
    );
  });
});

describe("getCreateInviteSuccessOutcome", () => {
  test("returns mobile-specific sharing guidance", () => {
    expect(
      getCreateInviteSuccessOutcome({
        token: "invite-token",
        expiresAt: "2026-04-28T00:00:00.000Z",
      }),
    ).toEqual({
      code: "invite-token",
      expiresAt: "2026-04-28T00:00:00.000Z",
      message:
        "Invite ready to share. Teammates can paste this code into the mobile join team screen.",
    });
  });
});

describe("getJoinInviteSuccessOutcome", () => {
  test("requests a workspace switch after joining a different workspace", () => {
    expect(
      getJoinInviteSuccessOutcome({
        activeWorkspaceId: "personal:user-1",
        workspace: {
          id: "team-joined",
          name: "Research",
          teamId: "team-joined",
        },
      }),
    ).toEqual({
      route: { name: "team-detail", teamId: "team-joined", section: "tasks" },
      routeNotice:
        "You can now work in Research. My workspace stays available from mobile destinations.",
      selectWorkspaceId: "team-joined",
    });
  });
});

describe("getJoinInviteFailureFeedback", () => {
  test("preserves notice-level feedback from the latest controller state", () => {
    expect(
      getJoinInviteFailureFeedback({
        error: new Error("fallback error"),
        lastError: "That invite is no longer active.",
        lastErrorKind: "notice",
      }),
    ).toEqual({
      kind: "notice",
      message: "That invite is no longer active.",
    });
  });
});
