## Why

Desktop now matches the web client on the core invite and task-organization outcomes, but it still presents those flows inside a single combined shell instead of the web app's dashboard-first navigation model. That mismatch makes desktop feel structurally behind the product direction, creates unnecessary UX drift between clients, and will make the upcoming i18n work harder because key desktop destinations are not yet stable.

## What Changes

- Rework the Electron desktop renderer so the signed-in default entry point is a dashboard rather than a single combined workspace screen.
- Add desktop-local navigation and route state for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`, aligned with the current web information architecture.
- Split the current desktop surface into page-level sections that mirror the web app's major destinations while still using desktop-appropriate layout and local React state.
- Reuse the existing shared workspace-first controller model so personal and team workspace actions continue to flow through `todo-app` and `todo-data` without introducing a new desktop state layer.
- Preserve the currently completed desktop invite, join, `dueDate`, task-filter, and date-view behaviors while relocating them into the new dashboard-oriented desktop structure.
- Add focused automated coverage for desktop route/state helpers and default-entry behavior so the dashboard-first shell remains testable without depending on heavy renderer integration tests.

## Capabilities

### New Capabilities

- `desktop-dashboard-parity`: Desktop-specific dashboard-first navigation and page structure aligned with the current web experience

### Modified Capabilities

- `multi-platform-clients`: Cross-client parity requirements expand so desktop must expose the same practical dashboard-first destinations as web while preserving desktop-appropriate layout
- `workspace-navigation`: Workspace navigation requirements expand so desktop also provides dedicated dashboard, my workspace, team list, team detail, join team, and create team destinations instead of only a combined shell

## Impact

- Affects `apps/desktop/src/App.tsx`, desktop renderer styling, and likely new desktop route/page helper modules
- May extract desktop page components or pure helpers for route resolution, dashboard summaries, and workspace page derivation
- Preserves the existing shared `todo-app` and `todo-data` contracts instead of changing the workspace-first model
- Adds automated tests for desktop dashboard navigation and parity helper behavior before the future i18n change begins
