## Why

The web client now carries the first full team join and lightweight task-organization experience, but the Electron desktop shell still stops at basic workspace switching and todo CRUD. That gap makes desktop feel like a second-class client for shared work and increases the risk that web-only flows drift away from the cross-platform product model.

## What Changes

- Add desktop UI for creating a team invite from the active team workspace and surfacing the resulting invite code or link in a shareable form.
- Add desktop UI for redeeming a valid invite so a signed-in user can join a team and immediately work in the joined workspace.
- Surface clear desktop success and failure states for invite redemption, including invalid, expired, revoked, and duplicate-member outcomes.
- Extend the desktop task composer and edit flow to support the shared optional `dueDate` field already available in the underlying product model.
- Add desktop-local task filters for `all`, `active`, and `completed`, plus lightweight date views such as `all tasks`, `due today`, `upcoming`, and selected-day inspection.
- Add focused automated coverage for desktop parity helpers and shared controller behaviors that protect the new desktop flows.
- Keep mobile out of scope for this change so we can establish one strong non-web parity implementation before designing the mobile interaction model.

## Capabilities

### New Capabilities

- `desktop-workspace-parity`: Desktop-specific invite, join, and lightweight workspace-organization behavior that brings Electron closer to the current web feature set

### Modified Capabilities

- `task-management`: Task-management requirements expand to require desktop exposure of optional `dueDate`, status filters, and lightweight date-based task views

## Impact

- Affects `apps/desktop/src/App.tsx` and desktop renderer styling for invite, join, and task-organization UI
- May extract or add desktop-focused view-derivation helpers so filtering and join state stay testable without coupling tests to renderer internals
- Adds or updates automated tests for desktop parity behavior and shared task-management rules
- Preserves the existing shared `todo-app` and `todo-data` contracts instead of introducing a desktop-only state layer
