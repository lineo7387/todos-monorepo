## Why

Workspace pages currently expose task creation, task filters, date filters, selected-day inspection, and team invite actions at the same level. This makes the primary workspace flow feel unfocused, especially on mobile, and creates drift between desktop section routes, the web combined page, and the mobile long-scroll layout.

This change refocuses the workspace experience around explicit sections so users can manage tasks, inspect dated work, and handle team invites without seeing every control at once.

## What Changes

- Split personal and team workspace experiences into focused `tasks`, `date`, and, for team workspaces, `invite` sections across web, desktop, and mobile.
- Keep the task section centered on task creation, status filtering, and the task list.
- Move date-view controls, selected-date inspection, and date-oriented summaries into a dedicated date section.
- Use mature visual libraries where they reduce hand-written interaction complexity:
  - Web and desktop date sections use `react-day-picker` for calendar selection.
  - Web and desktop date summaries use `recharts` for lightweight date distribution visuals.
  - Mobile date sections use `react-native-calendars` for native-friendly date selection.
  - Mobile advanced filters use `@gorhom/bottom-sheet` when controls need to be tucked away.
- Preserve the current lightweight `dueDate` model; the first implementation does not introduce full calendar events, drag scheduling, or time-of-day planning.
- Use Vite+ for dependency management, development, checks, and tests.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `workspace-navigation`: Workspace routes and navigation must expose focused task, date, and team invite sections consistently across supported clients.
- `task-management`: Task filtering and due-date organization requirements must distinguish the primary task section from the dedicated date section while preserving existing task behavior.
- `multi-platform-clients`: Web, desktop, and mobile must all expose equivalent section outcomes using platform-appropriate layouts and controls.

## Impact

- Affects shared workspace-shell routes, section navigation, localized labels, and route tests.
- Affects web, desktop, and mobile signed-in workspace layouts.
- Adds UI dependencies through Vite+:
  - `react-day-picker`
  - `recharts`
  - `react-native-calendars`
  - `@gorhom/bottom-sheet`
- Verification uses `vp install`, `vp check`, and `vp test`; tests continue to import utilities from `vite-plus/test`.
