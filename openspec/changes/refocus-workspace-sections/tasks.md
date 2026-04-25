## 1. Vite+ Setup

- [x] 1.1 Run `vp install` before implementation to align the workspace dependency graph.
- [x] 1.2 Add calendar, chart, and mobile secondary-control dependencies with `vp add react-day-picker recharts react-native-calendars @gorhom/bottom-sheet`.
- [x] 1.3 Confirm no direct package-manager commands or direct Vitest/Oxlint/Oxfmt installs are introduced.

## 2. Shared Workspace Shell

- [x] 2.1 Update shared workspace-shell route helpers so web and desktop can both include default workspace sections when needed.
- [x] 2.2 Keep personal workspace sections limited to `tasks` and `date`.
- [x] 2.3 Keep team workspace sections limited to `tasks`, `date`, and `invite`.
- [x] 2.4 Add or refine shared section labels, date-page copy, and English/Chinese localization entries.
- [x] 2.5 Split shared workspace rendering into focused task, date, and invite section surfaces while preserving existing task CRUD props.
- [x] 2.6 Extend shared route and localization tests using `vite-plus/test`.

## 3. Web Client

- [x] 3.1 Adopt section-aware web routes for personal and team workspaces.
- [x] 3.2 Render the web task section with task creation, status filters, and the task list only.
- [x] 3.3 Render the web date section with `react-day-picker`, date markers, lightweight date summaries, and selected-date tasks.
- [x] 3.4 Render the web team invite section only for team workspaces.
- [x] 3.5 Preserve existing web join-team, create-team, dashboard, team-list, copy-invite, and route-notice behavior.

## 4. Desktop Client

- [x] 4.1 Preserve existing desktop section route behavior for task, date, and invite sections.
- [x] 4.2 Refine the desktop task section so date-inspection panels are not shown as primary task content.
- [x] 4.3 Render the desktop date section with `react-day-picker`, date markers, lightweight `recharts` summaries, and selected-date tasks.
- [x] 4.4 Keep the desktop team invite section scoped to team workspaces.
- [x] 4.5 Preserve desktop auth, refresh, sign-out, workspace switching, and Electron shell behavior.

## 5. Mobile Client

- [x] 5.1 Add mobile workspace section navigation for task, date, and team invite outcomes.
- [x] 5.2 Render the mobile task section with task creation, status chips, and task list only.
- [x] 5.3 Render the mobile date section with `react-native-calendars`, marked dates, selected-date tasks, and compact date summaries.
- [x] 5.4 Move secondary or advanced mobile filters into `@gorhom/bottom-sheet` where they would otherwise create stacked filter panels.
- [x] 5.5 Render the mobile invite section only for team workspaces.
- [x] 5.6 Preserve mobile sign-in, workspace switching, create-team, join-team, invite redemption, task CRUD, and localization behavior.

## 6. Validation

- [x] 6.1 Run `vp check` and fix format, lint, and type-check issues.
- [x] 6.2 Run `vp test` and fix failing unit tests.
- [x] 6.3 Add focused tests for section route parsing, route href generation, and section active-state behavior.
- [x] 6.4 Add focused tests proving date sections only include tasks with matching optional `dueDate` values.
- [x] 6.5 Manually review web, desktop, and mobile workspace flows for missing section outcomes.

## 7. Deferred Follow-Up Planning

- [x] 7.1 Document that FullCalendar remains deferred until tasks gain richer calendar-event semantics such as start/end times, recurrence, or drag scheduling.
- [x] 7.2 Document future chart enhancements such as weekly/monthly completion trends after the first lightweight date summaries ship.
- [x] 7.3 Document future task organization options such as overdue, unscheduled, this week, labels, members, and priority as advanced filters rather than task-page primary controls.
- [x] 7.4 Reassess `@shopify/flash-list` only if mobile task-list size or rendering performance justifies virtualized list optimization.
