## Context

The current product supports personal workspaces plus shared team workspaces, and team access is already enforced through membership. However, membership is only described for the team creator, which leaves no product-defined path for another authenticated user to join an existing team. The current clients also center everything in a single page, which works for a personal-first prototype but will become hard to navigate once users belong to multiple teams and need separate team pages, join flows, and task organization features.

Because the project already relies on Supabase authentication, persisted membership state, and cross-client synchronization, the join flow should extend those same primitives instead of introducing a separate onboarding system. This change touches storage, authorization, routing, shared view models, and client UX. It also has security implications because the system must allow a non-member to redeem an invite without exposing team data before membership is granted.

## Goals / Non-Goals

**Goals:**

- Let an existing team member generate a shareable invite for a team workspace.
- Let an authenticated user accept a valid invite and become a team member exactly once.
- Provide a multi-page navigation structure that makes personal and team workspaces easy to browse once a user belongs to multiple teams.
- Keep newly joined teams visible through workspace navigation and synchronization flows.
- Add basic task filtering for all, active, and completed tasks in personal and team task views.
- Introduce an optional `dueDate` that enables lightweight time-based task organization without turning the product into a full calendar planner.
- Preserve the current rule that only team members can read or mutate team workspace data.

**Non-Goals:**

- Role-based permissions such as owner, admin, or viewer.
- Approval workflows, join requests, or manual moderation queues.
- Public team discovery or searchable team directories.
- Rich invite management beyond the minimum metadata needed for validity, revocation, and expiry.
- Full project planning features such as start times, reminders, recurring rules, drag-and-drop scheduling, or multi-calendar aggregation across all workspaces.

## Decisions

### Use invite-based membership instead of open team discovery

The first release will require a valid invite created by an existing team member. This aligns with the current private-team model and avoids introducing public indexing, searchable teams, or accidental data exposure.

Alternatives considered:

- Open join by team name: rejected because names are not secure join credentials and would weaken team privacy.
- Admin approval queue: rejected for this iteration because it adds state transitions, moderation UX, and notification needs not present elsewhere in the product.

### Model invites as persisted records that can be validated and revoked

The system will store a team invite record associated with a team, creator, and validity window. Invite acceptance will look up the record, verify that it is still active, and then create a `team_members` row for the authenticated user in the same transaction boundary or server-side action.

This design gives the product explicit states for valid, expired, revoked, and already-used/already-member outcomes. It also keeps invitation behavior auditable and compatible with multiple clients.

Alternatives considered:

- Encode all invite data in a self-contained client-side token: rejected because revocation and duplicate-use handling become harder to reason about.
- Manually insert members without invites: rejected because it requires operator access and does not provide a product flow.

### Make invite redemption idempotent for existing members

If a user redeems an invite for a team they already belong to, the system will not create a duplicate membership and will instead return a benign success-like result that keeps the team available in the user's workspace list. This avoids confusing failures from repeat clicks or reused invite links.

Alternatives considered:

- Hard-fail duplicate acceptance: rejected because it creates unnecessary friction for retried deep links and shared invites.

### Refresh workspace membership immediately after acceptance

After a successful invite redemption, clients should re-fetch or invalidate the membership-backed workspace list so the joined team appears without requiring sign-out or app restart. This keeps the join flow aligned with the existing synchronized workspace model.

Alternatives considered:

- Delay visibility until next app launch: rejected because it makes the join action feel broken and undermines the value of the flow.

### Move from a single-page workspace shell to page-level navigation

The web experience will move to route-driven pages with a dashboard as the default signed-in landing page, a dedicated personal workspace page, a team list page, a team detail page, and dedicated create/join team entry points. The underlying product model remains workspace-first, but user-facing navigation should be team-oriented because that language is easier to understand once users belong to multiple teams.

Alternatives considered:

- Keep a single page and expand the workspace selector: rejected because it obscures the team list, gives team detail no stable location, and makes invite and calendar entry points feel bolted on.
- Expose only generic workspace routes in the UI: rejected because the domain model is workspace-first, but user-facing language such as "teams" and "my workspace" is clearer.

### Keep core business state in the shared app layer and avoid a second source of truth

The shared `todo-app` layer should remain the source of truth for authenticated session state, workspace membership, active workspace context, todos, and business mutations. Route state should come from the URL, and page-local UI state such as filter tabs, sort options, selected dates, and draft form inputs should remain local to the page or component tree.

Alternatives considered:

- Introduce a separate global UI store for all state immediately: rejected because it would duplicate the existing controller/state model and make web/desktop parity harder to preserve.

### Use a lightweight task time model centered on optional due dates

Tasks will gain an optional `dueDate` field. A task may exist without any date. Time-oriented views such as due today, upcoming, overdue, or calendar day detail should only consider tasks with a `dueDate`. This keeps the first iteration focused on lightweight organization rather than full scheduling.

Alternatives considered:

- Require every task to have a date: rejected because it adds friction to simple capture workflows.
- Add start dates, reminder times, and recurring schedules immediately: rejected because it expands the product into a planner before the simpler due-date workflow has been validated.

### Start with simple task filters before a full calendar product

Task views should first support status filters for all, active, and completed items. The initial time model should enable follow-on views such as due today and upcoming, but a standalone calendar page should remain a lightweight day-inspection interface rather than a full-featured scheduling surface.

Alternatives considered:

- Build a full month or week calendar before filters: rejected because it adds major UI and interaction complexity before the basic list workflow is solid.

## Risks / Trade-offs

- [Invite links can be shared beyond the intended recipient] -> Mitigation: keep invites scoped to authenticated users, support expiry and revocation, and leave recipient-specific invites for a later change.
- [Join flow adds a privileged mutation path outside normal member-only access] -> Mitigation: perform invite redemption through a constrained server-side path that validates the invite before inserting membership.
- [Reusable invites may create ambiguity about who joined from which share event] -> Mitigation: record invite creator and redemption events where available, while deferring richer audit history if not already present.
- [Cross-client cache staleness could hide a newly joined team] -> Mitigation: explicitly refresh membership and workspace queries after invite acceptance.
- [New routes could drift from the shared workspace model] -> Mitigation: keep routing as a presentation layer and continue to drive actual data selection through workspace-aware shared state.
- [Task filtering and due dates can create hidden edge cases around empty states and completed tasks] -> Mitigation: keep the first filter set intentionally small and define how undated tasks behave before building date-based views.

## Migration Plan

1. Add persisted invite storage and any supporting server-side redemption endpoint or action.
2. Apply authorization rules so only eligible authenticated users can create or revoke invites for teams they belong to, and only valid invites can create memberships.
3. Add route-driven page structure for dashboard, personal workspace, team list, team detail, join team, and create team flows.
4. Add client flows for generating an invite and accepting one from a link or code entry.
5. Extend task storage and shared state with optional `dueDate` plus list filters for all, active, and completed tasks.
6. Refresh workspace membership data after acceptance and verify the joined team becomes selectable immediately.
7. Roll back by disabling invite creation and redemption paths and falling back to the previous single-page shell if needed; existing `team_members` rows remain the source of truth for access.

## Open Questions

- Should any team member be allowed to create invites, or should invite creation be limited to the original team creator until roles exist?
- Should invites be single-use or reusable until revoked or expired?
- What default expiry window gives a good balance between convenience and accidental long-lived access?
- Should create team launch as a dedicated page everywhere, or can some clients use a modal while still preserving the same route semantics on web?
