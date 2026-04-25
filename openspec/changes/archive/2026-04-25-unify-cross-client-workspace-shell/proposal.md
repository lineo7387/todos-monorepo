## Why

The workspace experience is drifting because web, desktop, and mobile still ship different page structures, navigation patterns, and copy sources even though they already share the same core business model. If we keep treating parity as a client-by-client follow-up, every desktop realignment, mobile catch-up, and bilingual localization pass will continue to duplicate effort and re-open already solved product decisions.

## What Changes

- Introduce a canonical cross-client workspace shell contract for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team` so feature work no longer lands on web first and other clients later.
- Refactor web and desktop to consume the same shared page modules, route vocabulary, and workspace-shell helpers, with `react-router` used for explicit page navigation instead of large single-file route switches.
- Bring mobile onto the same destination vocabulary and task-surface capability set, including team join/create flows, team browsing, optional `dueDate`, status filters, and lightweight date views.
- Add a shared localization contract for the workspace shell so English and Chinese strings, core terms, and page labels are defined once and consumed consistently across web, desktop, and mobile.
- Replace the current planning-only mobile parity direction with an implementation-ready multi-client change that keeps mobile, desktop, and localization work scoped together.

## Capabilities

### New Capabilities

- `cross-client-localization`: Shared translation keys and terminology governance for the workspace shell across supported clients

### Modified Capabilities

- `multi-platform-clients`: Cross-client parity requirements now mandate aligned delivery across web, desktop, and mobile for workspace-shell changes rather than allowing one client to lead indefinitely
- `workspace-navigation`: Navigation requirements now mandate a canonical destination vocabulary across all supported clients, with web and desktop sharing route structure and mobile exposing equivalent destination semantics
- `task-management`: Task-management requirements now mandate mobile exposure of optional `dueDate`, status filters, and lightweight date views alongside web and desktop parity

## Impact

- Affects `apps/website/src`, `apps/desktop/src`, and `apps/mobile/src`, especially current `App.tsx` shells, route helpers, and page components
- Likely introduces a shared workspace-shell package or module for route definitions, page composition, localization resources, and pure view-model helpers
- Requires adding `react-router`-based navigation to the web/desktop shared shell and a matching mobile navigation adapter against the same destination contract
- Supersedes the planning-only direction in `openspec/changes/plan-mobile-workspace-parity` once this implementation change is accepted
