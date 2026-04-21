## 1. Invite persistence and authorization

- [x] 1.1 Add persisted team invite storage and metadata needed to validate active, expired, and revoked invites
- [x] 1.2 Implement server-side invite creation for authenticated users who belong to the target team workspace
- [x] 1.3 Implement server-side invite redemption that validates the invite and inserts team membership idempotently
- [x] 1.4 Add or update authorization rules so invite creation and redemption do not expose team data to non-members

## 2. Navigation and page structure

- [x] 2.1 Add route-driven page structure for dashboard, personal workspace, team list, team detail, join team, and create team flows
- [x] 2.2 Refactor the current single-page shell into page-level components while keeping `todo-app` as the core business-state layer
- [x] 2.3 Add top-level navigation that lets authenticated users move between dashboard, personal workspace, joined teams, and join/create actions

## 3. Workspace membership synchronization and join UX

- [x] 3.1 Extend membership queries or sync primitives to include teams joined through invite redemption
- [x] 3.2 Refresh or invalidate workspace navigation data after a successful join so the new team appears immediately
- [x] 3.3 Add UI for an existing team member to generate and share a team invite
- [x] 3.4 Add UI for an authenticated user to open an invite link or submit an invite code and join the team
- [x] 3.5 Show clear success and failure states for invite acceptance without interrupting the existing personal workspace flow

## 4. Task filtering and lightweight time model

- [x] 4.1 Extend task storage, shared state, and UI models to support an optional `dueDate`
- [ ] 4.2 Add workspace task filters for all, active, and completed items in personal and team task views
- [ ] 4.3 Add initial date-based task views such as due today or upcoming that only include tasks with `dueDate`
- [ ] 4.4 Add a lightweight calendar day view or selected-date task inspection flow without implementing full scheduling features

## 5. Verification

- [ ] 5.1 Add automated coverage for invite creation, valid invite redemption, duplicate redemption, and invalid invite rejection
- [ ] 5.2 Add automated coverage for route-based workspace access, team list refresh after joining, and unauthorized team navigation
- [ ] 5.3 Add automated coverage for task filtering and `dueDate` behavior, including exclusion of undated tasks from date-based views
- [ ] 5.4 Run `vp check` and `vp test` after implementation changes land
