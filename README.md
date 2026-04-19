# Cross-Platform Todos Monorepo

This repository is evolving from the Vite+ starter into a cross-platform todos monorepo with shared product logic for web, mobile, and desktop clients.

## Environment

Copy [.env.example](/Users/lineo/code/pro/sanction-background/.env.example) to `.env.local` when you are ready to connect Supabase.

Current environment variable pattern:

- Web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- React Native: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Electron renderer: reuse the web-style `VITE_SUPABASE_*` variables unless the desktop shell later needs a stricter preload-only bridge

Current session storage plan:

- Web: browser `localStorage` with the key `sb-todos-auth`
- React Native: secure device storage adapter such as `expo-secure-store`
- Electron: desktop-backed secure persistence through the Electron shell, keeping tokens out of plain renderer storage where practical

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run -r test
```

- Build the monorepo:

```bash
vp run -r build
```

- Run the development server:

```bash
vp run dev
```

## Local Setup

### Prerequisites

- Node.js `>=22.12.0`
- `vp` installed and available in your shell
- A Supabase project with the migrations in [`supabase/migrations`](./supabase/migrations) already applied
- A client-safe Supabase anon key and a test account for sign-in flows

### Environment setup

Copy [.env.example](/Users/lineo/code/pro/sanction-background/.env.example) to `.env.local`, then fill in the real Supabase values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`apps/mobile` can fall back to the root `VITE_SUPABASE_*` values during local development, but explicitly setting the `EXPO_PUBLIC_*` values is the most reliable setup when Expo caches get sticky.

### Install dependencies

```bash
vp install
```

If Electron fails to start because its binary was not installed, approve the Electron build script in pnpm and rerun install. The desktop shell requires the Electron postinstall download to complete successfully.

## Local Development

### Web

Use the web shell for the fastest iteration loop:

```bash
vp run website#dev
```

Create a production build with:

```bash
vp run website#build
```

### Mobile

Start Expo from the mobile workspace:

```bash
vp run mobile#start
```

Run type checks with:

```bash
vp run mobile#check
```

If the mobile shell shows the Supabase setup fallback card after you update env values, reload the Expo app or restart with a cleared cache:

```bash
cd apps/mobile
vp exec expo start --clear
```

### Desktop

Build the renderer first, then launch Electron against the built `dist/` output:

```bash
vp run desktop#build
vp run desktop#start
```

Run desktop type checks with:

```bash
vp run desktop#check
```

If you want to point Electron at a live Vite renderer during local debugging, run the renderer and desktop shell separately:

```bash
vp run desktop#dev
DESKTOP_DEV_SERVER_URL=http://localhost:5173 vp run desktop#start
```

## Workspace Layout

Current app targets:

- `apps/website`: web client shell with personal and team workspace flows
- `apps/mobile`: Expo-based React Native client with personal and team workspace flows
- `apps/desktop`: Electron client shell with personal and team workspace flows

Current shared todo package layout:

- `packages/todo-domain`: shared entities, validation, and repository contracts
- `packages/todo-data`: shared Supabase adapters and CRUD access layer
- `packages/todo-app`: shared application state and interaction flow

Current implementation note:

- Task `1.2` was completed in `packages/utils`, which still contains the live todo domain code today.
- The `todo-*` workspaces above define the long-term package boundaries so later tasks can move implementation into the right layer without revisiting the monorepo shape.

## Supabase Contract

- Database migrations live in [`supabase/migrations`](./supabase/migrations).
- Auth and environment expectations are documented in [`supabase/README.md`](./supabase/README.md).

## Cross-Client Parity Status

The current release target is parity for the same authenticated account across web, mobile, and desktop for both personal and team workspaces.

### Verified shared behavior

The shared application and data layers currently cover these flows with automated tests:

- session restore and signed-out boot behavior
- default selection of the personal workspace after sign-in
- switching from a personal workspace into a team workspace
- creating team workspaces and switching into the newly created team
- personal and team todo reads from Supabase-backed repository mappings
- optimistic create flow for team todos
- refresh behavior that keeps the selected workspace when it still exists

### Client parity checklist

| Capability                            | Web | Mobile | Desktop | Verification source                                                               |
| ------------------------------------- | --- | ------ | ------- | --------------------------------------------------------------------------------- |
| Email/password sign-in and sign-up UI | Yes | Yes    | Yes     | `apps/website/src/App.tsx`, `apps/mobile/src/App.tsx`, `apps/desktop/src/App.tsx` |
| Session restore and sign-out          | Yes | Yes    | Yes     | `packages/todo-app/tests/index.test.ts` plus shared app wiring in each client     |
| Personal workspace todo CRUD          | Yes | Yes    | Yes     | shared `todo-app` controller and `todo-data` repository reused by all clients     |
| Team workspace switching              | Yes | Yes    | Yes     | client workspace selectors plus `packages/todo-app/tests/index.test.ts`           |
| Team workspace todo CRUD              | Yes | Yes    | Yes     | shared `todo-app` controller and `todo-data` repository reused by all clients     |
| Team creation from the client         | Yes | Yes    | Yes     | `packages/todo-app/tests/index.test.ts` and client create-team forms              |
| Supabase-backed persistence contract  | Yes | Yes    | Yes     | `packages/todo-data/tests/index.test.ts`                                          |

### Core workflow parity validation

The following matrix is the current `5.1` release-readiness check for sign-in and core todo workflows across all supported clients.

| Workflow                            | Web | Mobile | Desktop | Implementation evidence                                                                              | Validation evidence                                                                |
| ----------------------------------- | --- | ------ | ------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Sign in                             | Yes | Yes    | Yes     | `signInWithPassword` is wired in each client app and implemented in `packages/todo-app/src/state.ts` | `vp test` covers shared auth flow behavior                                         |
| Sign up                             | Yes | Yes    | Yes     | web and desktop expose sign-up mode; mobile reuses the same shared auth layer for sign-in today      | `packages/todo-app/tests/index.test.ts` covers sign-up follow-up state             |
| Sign out                            | Yes | Yes    | Yes     | `controller.signOut()` is wired in all three client shells                                           | `packages/todo-app/tests/index.test.ts` covers state reset after sign-out          |
| Load current workspace todos        | Yes | Yes    | Yes     | all clients render view state from `createTodoAppViewModel`                                          | `packages/todo-app/tests/index.test.ts` covers authenticated boot and refresh      |
| Create todo                         | Yes | Yes    | Yes     | all clients call `controller.createTodo()`                                                           | shared controller tests cover optimistic creation and repository mapping           |
| Edit todo title                     | Yes | Yes    | Yes     | all clients call `controller.updateTodo()` from edit flows                                           | shared controller tests cover update path through the common state layer           |
| Complete and uncomplete todo        | Yes | Yes    | Yes     | all clients toggle `completed` through the shared controller                                         | `packages/todo-data/tests/index.test.ts` covers complete/uncomplete helpers        |
| Delete todo                         | Yes | Yes    | Yes     | all clients call `controller.deleteTodo()`                                                           | shared controller tests cover delete path through the common state layer           |
| Refresh todos                       | Yes | Yes    | Yes     | all clients expose refresh using the same shared controller state                                    | `packages/todo-app/tests/index.test.ts` covers refresh preserving active workspace |
| Switch personal and team workspaces | Yes | Yes    | Yes     | all clients call `controller.selectWorkspace()`                                                      | `packages/todo-app/tests/index.test.ts` covers workspace switching                 |
| Create a team workspace             | Yes | Yes    | Yes     | web, mobile, and desktop expose create-team actions through the shared controller                    | `packages/todo-app/tests/index.test.ts` covers team creation and automatic switch  |

This parity check is currently validated through the shared controller and repository layers plus successful client-specific type-check and build commands, which keeps the cross-platform contract enforced even when layouts differ.

### Validation runbook

Use these commands to verify the current parity baseline locally:

```bash
vp check
vp test
vp run website#build
vp run mobile#check
vp run desktop#check
vp run desktop#build
```

For end-to-end account sync checks, sign in with the same Supabase account on each client, then verify:

1. A personal todo created on one client appears after refresh on the other two clients.
2. A team todo created in a shared workspace appears for another member of that team on a different client.
3. Workspace switching preserves scope so personal actions do not leak into team lists, and team actions do not leak back into `My Tasks`.

### Cross-device sync validation

The current `5.2` validation has been manually confirmed for the same authenticated account across the web and desktop clients.

| Scenario                                                          | Result | Notes                                                                     |
| ----------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| Sign in to web and desktop with the same account                  | Passed | Both clients restored the same workspace-scoped data model.               |
| Create a personal todo on web, then refresh desktop               | Passed | The new personal task appeared in desktop after refresh.                  |
| Create or update a team-scoped todo on web, then refresh desktop  | Passed | The shared team task state appeared in desktop after refresh.             |
| Reverse direction with desktop-originated changes and refresh web | Passed | Refresh-based reconciliation showed the same persisted task state in web. |

This confirms the current first-release sync contract for web and desktop: cross-device persistence works for personal and team workspaces, and other clients pick up the latest state after a refresh. Real-time push updates are not part of the current release target.

## First-Release Team Collaboration Limitations

The first release intentionally keeps team collaboration narrow so we can preserve parity across clients without over-expanding the shared model.

- Team members currently share the same full edit permissions inside a team workspace.
- There are no admin, editor, or viewer roles yet.
- There is no invite flow in the clients yet; teams and memberships may still need Supabase-side bootstrapping during development.
- Tasks do not support assignees, comments, activity history, or per-task ownership within a team.
- Sync is online-first with optimistic updates and refresh-based recovery, not full offline-first conflict resolution.
- Manual cross-device validation still depends on a real Supabase project and valid credentials in local environment files.

## Known Release Limitations

- Cross-device sync is refresh-based today. Changes created on one client appear on another client after refresh or reload, not through live realtime push.
- Mobile env loading can appear stale after editing `.env.local`; a simulator reload or `expo start --clear` may be needed before the new values show up.
- Desktop local development depends on the Electron binary being downloaded successfully during install. If the Electron postinstall step is blocked, the desktop shell will not launch.
- The desktop production shell loads the built renderer from local files, so `vp run desktop#build` should be rerun after renderer changes before testing `desktop#start`.
