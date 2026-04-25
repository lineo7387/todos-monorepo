import { describe, expect, test } from "vite-plus/test";

import {
  extractInviteCode,
  getCreateInviteSuccessOutcome,
  getJoinInviteFailureFeedback,
  getJoinInviteSuccessOutcome,
} from "./invite-flow.ts";
import {
  getDefaultMobileRoute,
  getMobileRouteTitle,
  isMobileRouteActive,
} from "../routing/routes.ts";

const localizedRouteTitleCases = [
  [{ name: "dashboard" } as const, "Dashboard", "仪表盘"],
  [{ name: "personal-workspace" } as const, "My workspace", "我的工作区"],
  [{ name: "team-list" } as const, "Teams", "团队"],
  [{ name: "join-team" } as const, "Join team", "加入团队"],
  [{ name: "create-team" } as const, "Create team", "创建团队"],
] as const;

describe("mobile routes", () => {
  test("uses the shared dashboard default and active-state grouping", () => {
    expect(getDefaultMobileRoute()).toEqual({ name: "dashboard" });
    expect(
      isMobileRouteActive(
        { name: "team-detail", teamId: "team-1", section: "date" },
        { name: "team-list" },
      ),
    ).toBe(true);
    expect(
      isMobileRouteActive(
        { name: "team-detail", teamId: "team-1" },
        { name: "team-detail", teamId: "team-2" },
      ),
    ).toBe(false);
  });

  test("resolves localized route labels from the shared workspace-shell contract", () => {
    for (const [route, englishTitle, chineseTitle] of localizedRouteTitleCases) {
      expect(getMobileRouteTitle(route)).toBe(englishTitle);
      expect(getMobileRouteTitle(route, undefined, "zh-CN")).toBe(chineseTitle);
    }
  });
});

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

  test("uses shared localized fallback copy when no controller or thrown message is available", () => {
    expect(
      getJoinInviteFailureFeedback({
        error: {},
        lastError: null,
        lastErrorKind: null,
        locale: "zh-CN",
      }),
    ).toEqual({
      kind: "error",
      message: "无法接受该邀请。请检查邀请码后重试。",
    });
  });
});
