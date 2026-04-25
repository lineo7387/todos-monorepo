## Context

The current repository already shares the core workspace-first business model through `todo-app` and `todo-data`, but each client still owns too much of its own shell. Web and desktop now expose nearly the same signed-in product model, yet they still maintain separate route definitions, page composition, and copy. Mobile remains on an earlier baseline shell with only workspace switching and basic todo CRUD, which means parity gaps keep reopening whenever web or desktop changes direction.

There is also a pending planning-only change, `plan-mobile-workspace-parity`, that assumes mobile parity can follow later. That assumption is no longer safe. The latest desktop re-alignment showed that parity work becomes expensive and error-prone when web moves first, desktop catches up later, mobile waits even longer, and localization is postponed until after structure is already unstable.

This design therefore treats cross-client workspace-shell convergence as one coordinated implementation effort:

- web and desktop should share the same page implementation wherever the host environment allows it
- mobile should align to the same destination vocabulary and core task-surface capabilities
- localization should be introduced as a shared contract, not as scattered per-client strings

## Goals / Non-Goals

**Goals:**

- Create a canonical workspace-shell layer that owns route ids, page composition, pure helpers, and translation keys for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`.
- Move web and desktop onto shared signed-in page modules and explicit router-driven navigation so parity work lands once instead of twice.
- Bring mobile onto the same product destination vocabulary and task-surface capabilities, including team join/create flows, optional `dueDate`, status filters, and lightweight date views.
- Introduce shared English/Chinese localization resources and term governance for workspace-shell pages so `team`, `my workspace`, and `dashboard` remain consistent everywhere.
- Break oversized client `App.tsx` files into maintainable route, page, component, and host-adapter layers.

**Non-Goals:**

- Merge Electron main-process code, browser bootstrap code, and React Native bootstrap code into one runtime layer.
- Force mobile to use the same routing library as web/desktop if the runtime model is a poor fit.
- Build a full design-system rewrite or pixel-identical UI across all clients.
- Expand task organization into a full calendar or planner product.
- Change shared backend contracts or the workspace-first data model.

## Decisions

### Create a shared workspace-shell module and keep host adapters thin

We will introduce a shared module, likely under `packages/` or another workspace-shared location, that owns:

- canonical route ids and route params
- signed-in page modules
- page-level pure helpers and selectors
- shared translation keys and localized resources
- cross-client workspace-shell types

Web, desktop, and mobile will keep thin host adapters responsible for runtime-specific bootstrapping, environment wiring, and platform-only affordances.

Alternatives considered:

- Continue duplicating page shells per client: rejected because it directly caused the recent desktop realignment churn.
- Share only pure helpers but keep separate page components forever: rejected because web and desktop are already close enough that duplicate page trees create unnecessary maintenance cost.
- Share everything including runtime bootstrap: rejected because browser, Electron, and React Native host concerns still differ materially.

### Use explicit route contracts everywhere, with `react-router` for web and desktop

The canonical workspace-shell contract will define the signed-in destination model once. Web and desktop should both consume that model through `react-router`, which replaces large file-local route switches and makes page composition explicit. Mobile will map the same destination ids and params into a mobile navigation adapter that fits React Native interaction patterns.

Alternatives considered:

- Keep custom local route state on desktop: rejected because it already contributed to drift from web.
- Use `react-router` only on web and keep desktop custom: rejected because web and desktop are the pair most ready to share page implementation directly.
- Force mobile to use the same routing runtime: rejected because route vocabulary parity matters more than identical navigation infrastructure.

### Make mobile parity part of the same implementation change, not a follow-up

This change will absorb the practical outcomes that the planning-only mobile parity change identified, but implement them through the same canonical route, page, and terminology contract used by web/desktop. Mobile does not have to share every visual component, but it must stop lagging on supported destinations and task-surface capabilities.

Alternatives considered:

- Finish web/desktop convergence first and revisit mobile later: rejected because the repository already showed that “later” turns into another expensive parity catch-up.
- Keep mobile limited to workspace switching and basic CRUD: rejected because it leaves cross-client behavior incomplete and blocks stable localization.

### Introduce localization as a shared contract during shell convergence

The workspace shell should stop hardcoding page strings inside client files. Instead, shared translation keys and English/Chinese resources should be introduced during this convergence so the same route labels, empty states, and feedback copy are used across clients. This keeps terminology stable while page structure is being normalized.

Alternatives considered:

- Delay localization until after route and page refactors: rejected because it would force another multi-client sweep over already moved files.
- Add per-client translation files with duplicated keys: rejected because it preserves the same fragmentation we are trying to remove.

### Keep shared business state in `todo-app`, page-local interaction state in the client shell

The workspace-first controller model remains unchanged. Shared business mutations, workspace selection, membership refresh, and todo persistence stay in `todo-app`/`todo-data`. Local route state, active mobile screen, open drawers/sheets, selected day, and transient editing affordances stay in the client shell or shared page components as local React state.

Alternatives considered:

- Introduce a new global store for all shell state: rejected because it adds complexity without solving the parity root cause.
- Push route state into `todo-app`: rejected because route/page composition is a client-shell concern, not domain state.

## Risks / Trade-offs

- [Shared web/desktop page modules accumulate too many platform conditionals] -> Mitigation: keep a strict host-adapter boundary and allow small wrapper components where runtime-specific behavior differs.
- [Mobile parity scope becomes too large for one pass] -> Mitigation: stage implementation within one change group, landing shared route/localization infrastructure before mobile page parity details.
- [Localization keys churn while pages move] -> Mitigation: define canonical route/page key namespaces first and require new shell copy to use them immediately.
- [React router adoption on desktop could disrupt Electron-specific flows] -> Mitigation: keep Electron concerns outside the shared shell and use memory-based routing for the renderer if browser history semantics are unnecessary.
- [The existing `plan-mobile-workspace-parity` change becomes stale or contradictory] -> Mitigation: explicitly treat it as superseded by this implementation change and archive or retire it once this work lands.

## Migration Plan

1. Define the shared route vocabulary, translation key namespaces, and workspace-shell package/module boundary.
2. Extract shared web/desktop page modules and move web/desktop onto explicit router-driven host adapters.
3. Bring mobile onto the same destination contract and task-surface parity, using mobile-appropriate navigation composition.
4. Replace duplicated workspace-shell copy with shared English/Chinese translation resources and terminology.
5. Add cross-client tests for route contracts, page helpers, localization coverage, and client-specific integration points.
6. Retire or archive `plan-mobile-workspace-parity` once this change fully captures and implements the intended mobile parity outcomes.

## Open Questions

- Should the shared workspace-shell module live in a new package such as `packages/workspace-shell`, or should it initially live under an existing shared source area to reduce workspace churn?
- Should mobile adopt React Navigation in this change if a stronger navigation stack is needed, or should the first pass stay on a lighter adapter while still honoring the canonical destination model?
- Do we want English and Chinese both fully shipped as part of this change, or should the change establish the shared localization contract and migrate the workspace shell pages first while leaving non-workspace surfaces for a later localization pass?
