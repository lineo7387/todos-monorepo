## Context

The web client has already established the intended signed-in information architecture: `dashboard` as the default entry, followed by dedicated destinations for `my workspace`, `team list`, `team detail`, `join team`, and `create team`. Desktop now matches the same shared business outcomes for invites and lightweight task organization, but those behaviors still live inside one combined renderer surface.

This creates a structural mismatch across clients. The shared `todo-app` controller already owns authentication, workspace selection, invite creation/redeem, todo CRUD, and refresh behavior, so the desktop gap is not a missing domain capability. The missing piece is desktop-local route and page composition that makes those capabilities feel like the same product shape as web.

The project constraints still apply:

- Dashboard should be the default entry.
- The workspace-first underlying model must stay unchanged.
- User-facing language should prefer `team`, `my workspace`, and `dashboard`.
- Core business state stays in `todo-app`.
- Page-local interaction state stays in React state.
- Route state should be represented explicitly rather than inferred from opaque UI flags.
- We are not introducing Zustand for this pass.

## Goals / Non-Goals

**Goals:**

- Make desktop open into a dashboard-first signed-in experience rather than a single combined workspace shell.
- Give desktop dedicated route/state destinations for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`.
- Preserve the existing desktop invite, join, due-date, task-filter, and date-view functionality while relocating it into page-level desktop screens.
- Keep desktop route resolution and dashboard/workspace derivation testable through pure helpers rather than renderer-only tests.
- Align the desktop information architecture closely enough with web that future i18n can share stable conceptual destinations across clients.

**Non-Goals:**

- Rebuild desktop to literally share web components or browser URL routing.
- Change the shared workspace-first controller model, repository contracts, or persistence behavior.
- Expand mobile in parallel.
- Introduce a richer calendar, reminder system, or additional task-management features beyond the already approved desktop parity set.

## Decisions

### Represent desktop navigation with explicit local route state

Desktop will introduce a typed local route model with the same major destination names as web: `dashboard`, `personal-workspace`, `team-list`, `team-detail`, `join-team`, and `create-team`. The Electron shell does not need browser URLs, but it should still represent the current destination as structured route state rather than as a collection of booleans.

Alternatives considered:

- Keep the current single-surface shell and only add anchors/scroll targets: rejected because it preserves the information-architecture mismatch and makes future i18n copy harder to organize.
- Introduce a full client-side router for desktop: rejected because explicit React state is enough for the desktop shell and avoids unnecessary dependency/abstraction overhead.

### Mirror web page concepts without forcing identical layout

Desktop should gain page-level components or sections that correspond to the web app's destinations, but the visual layout can remain desktop-appropriate. For example, dashboard summaries and navigation cards can be denser than web, while workspace pages can still prioritize the larger desktop task surface.

Alternatives considered:

- Copy the web page tree one-to-one: rejected because it increases coupling and ignores desktop-specific affordances.
- Keep desktop page names different from web: rejected because it weakens cross-client parity and complicates future i18n terminology.

### Keep workspace selection and access control grounded in shared controller state

Desktop route effects should continue to derive the active workspace from `todo-app` state and trigger `selectWorkspace` only when the route demands a different workspace. Unauthorized team-detail attempts should resolve to a safe desktop destination without exposing team task data, matching the web safety model.

Alternatives considered:

- Cache route-specific workspace data outside the controller: rejected because it duplicates shared state and increases synchronization risk.
- Allow any team-detail route to render before membership checks finish: rejected because it risks showing misleading or unauthorized UI.

### Extract desktop route and dashboard helpers into pure modules

Desktop should follow the same pattern already used by web and recent desktop parity work: pure helper modules for route resolution, dashboard outcomes, and workspace-page derivation, covered by lightweight automated tests. This keeps the new navigation shell maintainable and avoids relying on brittle renderer integration tests.

Alternatives considered:

- Keep route and page derivation inline in `App.tsx`: rejected because the desktop shell is already growing in complexity and would become harder to reason about.
- Move desktop route helpers into shared packages: rejected because this is presentation structure, not cross-client domain logic.

## Risks / Trade-offs

- [Desktop architecture drifts from web again after this refactor] -> Mitigation: reuse the same destination names and helper concepts as web, and cover them with targeted desktop tests.
- [The desktop shell becomes over-segmented and awkward compared with current single-surface workflows] -> Mitigation: keep navigation shallow and preserve quick links between dashboard and workspace pages.
- [Workspace loading flashes or wrong-page states appear during route transitions] -> Mitigation: centralize route effect resolution and explicitly model loading-safe fallbacks.
- [This refactor increases code volume in `apps/desktop`] -> Mitigation: split route/page helpers and page sections into focused modules instead of growing a single `App.tsx`.

## Migration Plan

1. Introduce desktop route types, route helpers, and dashboard/workspace page derivation helpers.
2. Refactor the signed-in desktop shell to render page-level destinations with dashboard as the default entry.
3. Move existing invite/join/task-organization UI into the relevant desktop pages without changing their underlying shared mutations.
4. Add targeted desktop automated coverage for route effects, default entry behavior, and safe team-detail handling.
5. Validate with the standard desktop and repository checks.
6. Roll back by restoring the current single-surface desktop shell while leaving the shared invite and task-organization capabilities intact.

## Open Questions

- Should desktop keep lightweight in-memory back/forward history for page navigation, or is direct destination switching sufficient for the first pass?
- Should dashboard surface counts and summaries exactly match web copy, or can desktop use slightly denser summary language while keeping the same destination names?
