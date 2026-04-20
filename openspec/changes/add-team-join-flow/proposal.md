## Why

Team workspaces already assume membership exists, but the product does not yet define how a signed-in user can actually join a team created by someone else or navigate multiple workspaces once they do. At the same time, the single-page task view will not scale well once users can belong to several teams and need lightweight task filtering and date-based organization.

## What Changes

- Add a user-facing flow for an existing team member to generate a reusable team invite and share it with another authenticated user.
- Add a user-facing flow for an authenticated user to accept a valid invite and become a member of the target team workspace.
- Define invite validation, duplicate membership handling, and failure states such as expired, revoked, or invalid invites.
- Replace the current single-page workspace experience with page-level navigation for dashboard, personal workspace, team list, team detail, join team, and create team flows.
- Surface successful joins in workspace navigation so a newly joined team becomes available immediately and can be opened through team-specific pages.
- Add task list filtering for all, active, and completed tasks within personal and team workspaces.
- Introduce a lightweight task time model with an optional `dueDate` that supports follow-on views such as due today, upcoming, and a calendar page that shows tasks for the selected day.

## Capabilities

### New Capabilities

- `team-join`: Invite creation, invite acceptance, and membership onboarding behavior for team workspaces
- `workspace-navigation`: Multi-page navigation and routing for dashboard, personal workspace, team list, team detail, join team, and create team experiences

### Modified Capabilities

- `team-workspaces`: Team membership requirements expand from creation-only membership to include joining through a valid invite
- `account-sync`: Authenticated clients must synchronize newly joined team memberships and reject invalid invite acceptance attempts
- `task-management`: Task workflows expand to include list filtering and an optional `dueDate` for lightweight date-based organization

## Impact

- Affects team membership data model and the APIs or Supabase actions used to create and redeem team invites
- Adds page-level routing and navigation UI in supported clients where users browse workspaces, join teams, and manage tasks
- Affects task storage, shared view models, and client rendering for filters and optional due dates
- Requires updates to authorization logic so invite redemption can create membership safely without weakening existing workspace access controls
