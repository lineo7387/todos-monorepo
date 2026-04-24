## 1. Shared workspace-shell foundation

- [x] 1.1 Create a shared workspace-shell module that owns canonical destination ids, route params, page-level types, and translation key namespaces for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`
- [x] 1.2 Extract shared pure helpers for route resolution, workspace selection effects, join/create outcomes, and lightweight task-view derivation so clients stop duplicating shell logic
- [x] 1.3 Define the shared English/Chinese workspace-shell resource structure and terminology contract for `team`, `my workspace`, and `dashboard`

## 2. Web and desktop convergence

- [x] 2.1 Refactor `apps/website` to use `react-router`-driven shared route definitions and split the current large `App.tsx` into host adapter, routes, pages, and shared shell composition
- [x] 2.2 Refactor `apps/desktop` to consume the same shared signed-in page modules and route contract through a desktop router adapter instead of file-local route switching
- [x] 2.3 Move shared web/desktop signed-in pages and supporting components into the shared workspace-shell module while keeping browser- and Electron-specific bootstrap concerns isolated

## 3. Mobile parity implementation

- [x] 3.1 Refactor `apps/mobile` to adopt the canonical destination vocabulary for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`
- [x] 3.2 Implement mobile team join/create and team-detail flows against the shared workspace-shell contract without regressing the workspace-first data model
- [x] 3.3 Implement mobile parity for optional `dueDate`, `all / active / completed`, and `all tasks / due today / upcoming` plus lightweight selected-day inspection

## 4. Cross-client localization alignment

- [ ] 4.1 Replace duplicated workspace-shell strings in web, desktop, and mobile with shared translation keys and English/Chinese resources
- [ ] 4.2 Add locale switching or locale selection plumbing needed so the shared workspace-shell resources can render consistently on all supported clients
- [ ] 4.3 Verify that route labels, empty states, join/create feedback, and core workspace terms remain consistent across web, desktop, and mobile in both supported languages

## 5. Verification and migration cleanup

- [ ] 5.1 Add automated coverage for shared route contracts, shared page helpers, localization key usage, and client-specific workspace-shell adapters
- [ ] 5.2 Run `vp check`, `vp test --run`, `vp run website#build`, `vp run desktop#check`, `vp run desktop#build`, and `vp run mobile#check` after the convergence work lands
- [ ] 5.3 Retire or archive the superseded `plan-mobile-workspace-parity` change once its planning intent is fully absorbed by this implementation
