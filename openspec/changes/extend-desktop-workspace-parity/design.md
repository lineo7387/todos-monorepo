## Context

The repository already uses a shared workspace-first model through `todo-app` and `todo-data`, and the recent web work added invite creation, invite redemption, optional `dueDate`, status filters, and lightweight date views on top of that model. The Electron desktop shell still exposes a simpler single-screen workspace switcher with create-team and todo CRUD, which means the data model supports more than the desktop UI can currently express.

This change should narrow that gap without forcing desktop to copy the web router structure one-for-one. The desktop shell can stay a desktop-appropriate single-surface experience, but it needs the same practical outcomes for joining teams, creating invites, and organizing tasks by status and due date.

## Goals / Non-Goals

**Goals:**

- Let a signed-in desktop user create a team invite from an active team workspace.
- Let a signed-in desktop user redeem an invite and immediately use the joined team workspace.
- Reuse the existing shared controller and repository contracts for invite creation, invite redemption, due dates, and task mutations.
- Add desktop UI for optional `dueDate`, status filtering, date views, and selected-day inspection without introducing a full calendar product.
- Keep desktop-specific derivation logic easy to test so parity does not depend on fragile renderer-only tests.

**Non-Goals:**

- Rebuild the desktop shell to exactly match the web route-driven dashboard, team list, and team detail page structure.
- Expand the mobile client in parallel.
- Introduce new backend APIs, authorization models, or persistence layers beyond the invite and due-date contracts already present.
- Build a desktop-only calendar, reminder system, or richer scheduling model.

## Decisions

### Keep desktop as a single-surface shell instead of copying web routing

Desktop will continue using one renderer surface with workspace switching rather than introducing the full web route hierarchy. Invite creation, invite redemption, due-date controls, and task filters will be presented inside that shell with desktop-specific sections and panels.

Alternatives considered:

- Rebuild desktop around the same route model as web: rejected because it increases implementation cost without being necessary to reach feature parity in outcomes.
- Leave desktop on basic CRUD and treat web as the advanced client: rejected because it undermines the cross-platform shared-product direction.

### Reuse shared controller mutations and validation rules

Desktop invite and task-organization UI should call the existing `createTeamInvite`, `redeemTeamInvite`, `createTodo`, and `updateTodo` controller methods rather than introducing renderer-side ad hoc logic. Validation for invite tokens and due dates should continue to live in shared packages.

Alternatives considered:

- Add desktop-local invite parsing and validation: rejected because it duplicates shared business rules.
- Add desktop-specific repository wrappers: rejected because the existing shared repository surface already covers the required behaviors.

### Extract desktop view-derivation helpers for filters and join feedback

Where desktop needs non-trivial local derivation, such as task-filter counts, date-view slices, or invite-join success messaging, the logic should be extracted into pure helpers near the desktop app rather than buried inside JSX. This keeps verification lightweight and avoids needing a heavy renderer test harness.

Alternatives considered:

- Keep all derivation inline inside `App.tsx`: rejected because parity logic becomes harder to test and easier to regress.
- Move desktop-only derivation into `todo-app`: rejected because these are presentation concerns, not shared business state.

### Preserve the existing lightweight date model

Desktop should expose the same optional `dueDate`, `all / active / completed` filters, and `all tasks / due today / upcoming` views already established on web. Selected-day inspection should continue to include only tasks whose `dueDate` matches the selected day, with undated tasks excluded from date-based views.

Alternatives considered:

- Add a richer desktop scheduling surface first: rejected because it would exceed the agreed lightweight scope.
- Add due dates without filters or date views: rejected because parity would still be materially behind web.

## Risks / Trade-offs

- [Desktop shell becomes crowded as more web capabilities are added] -> Mitigation: group desktop UI into clear workspace, invite, and task-organization sections instead of mirroring web page count.
- [Desktop parity helpers drift from web expectations] -> Mitigation: keep rule names and outcome semantics aligned with existing web logic and test the helper outputs directly.
- [Invite success states could leave the desktop UI focused on the wrong workspace] -> Mitigation: explicitly select or preserve the joined team workspace after redemption succeeds.
- [Desktop due-date controls expose validation gaps] -> Mitigation: reuse shared validation paths and add targeted tests for invalid and undated behaviors.

## Migration Plan

1. Add desktop-local helper functions and UI sections for invite creation and invite redemption using the shared controller mutations.
2. Extend the desktop task create/edit flows with optional `dueDate` inputs.
3. Add desktop-local task filters, date views, and selected-day inspection derived from the current workspace task list.
4. Add focused automated coverage for desktop helper behavior and any shared controller outcomes the new UI relies on.
5. Validate with `vp check`, `vp test`, and desktop-specific verification commands.
6. Roll back by removing the new desktop sections while leaving the shared backend invite and due-date contracts unchanged.

## Open Questions

- Should the desktop join flow accept both raw invite codes and full invite URLs in the same field, or should the first pass stay code-first and normalize pasted links only if trivial?
- Is a copy-to-clipboard affordance for desktop invite output required in the first pass, or is displaying the code and link sufficient?
- Do we want desktop task filters and date views to persist for the session, or is reset-on-refresh acceptable for the first parity pass?
