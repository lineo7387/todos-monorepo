## Context

This change introduces a new todo product delivered through three client surfaces: React web, React Native mobile apps, and Electron desktop. The product needs a shared account model, synchronized task state, and a common interaction contract so users can move between devices without relearning the app or losing task data.

The first pass of implementation validated the personal todo workflow across shared packages plus web and mobile shells. Requirements have since expanded to include team-owned todo spaces. That shifts the core model from "tasks belong to one user" to "tasks belong to a workspace scope," where the scope is either a personal account or a team shared by multiple members.

The repository is already organized as a monorepo with `apps/*` and `packages/*` workspaces, including an existing web application. That means this design should expand the current workspace instead of inventing a new repository layout. At the same time, choosing Supabase as the backend introduces a strong opinion around authentication, Postgres-backed data modeling, and client SDK usage that should be standardized early to avoid each client implementing sync and auth differently.

## Goals / Non-Goals

**Goals:**

- Define an architecture that supports web, mobile, and desktop clients with a shared domain model and consistent task behavior.
- Use Supabase for authentication, persistent storage, and synchronized personal plus team task data.
- Keep client applications decoupled from platform-specific UI shells by centralizing domain logic, API contracts, and validation in shared packages.
- Establish clear boundaries for task CRUD flows, session handling, workspace switching, and offline-tolerant client synchronization.

**Non-Goals:**

- Deliver advanced collaboration features such as shared lists, comments, or multi-user workspaces in the first iteration.
- Deliver role-based team permissions, task assignees, comments, or invite workflows in the first iteration.
- Specify the final visual design system, branding, or platform-specific polish beyond core navigation and functional parity.
- Commit to full offline-first conflict resolution in the first release; initial support is limited to graceful retries and refresh-based reconciliation.

## Decisions

### Extend the existing monorepo with additional app targets and shared packages

The system will build on the current workspace by keeping web, mobile, and desktop as separate application targets under `apps/*` and by adding shared packages under `packages/*` for types, data access, and domain logic. This reduces duplication, keeps task behavior aligned across platforms, and respects the repository's existing structure.

Alternative considered: separate repositories per platform. This would simplify individual app setup, but it would increase coordination cost and make it easier for core task flows to diverge.

### Treat Supabase as the single backend system of record

Supabase will own authentication, workspace persistence, and server-authoritative data retrieval. Task records will be scoped either to a personal owner or to a team workspace, and clients will read and write through a shared repository layer built on the Supabase client SDK.

Alternative considered: custom backend API in front of Supabase. That could add flexibility later, but it adds an extra service before there is evidence that direct Supabase integration is insufficient.

### Share domain contracts, not UI components, across all clients

The design should prioritize shared schema definitions, validation, task service interfaces, and query/mutation behavior. UI component sharing should be optional and limited because React web, React Native, and Electron shells have different interaction and rendering needs.

Alternative considered: fully shared UI kit across all platforms. This could reduce visual drift, but it tends to create awkward lowest-common-denominator abstractions too early.

### Use feature parity as the default product rule for core task flows

Core capabilities such as sign-in, workspace selection, task listing, task creation, completion toggling, editing, and deletion must behave consistently across web, mobile, and desktop. Platform-specific enhancements can be added later, but they must not weaken the baseline capability set.

Alternative considered: staged rollout with platform-specific feature subsets. That reduces short-term implementation effort, but it makes testing, product communication, and data expectations harder.

### Design for online-first synchronization with local optimistic updates

Clients should support responsive task interactions through optimistic UI updates, then reconcile with Supabase responses and refresh flows. This keeps the first release simple while still giving users a fast experience.

Alternative considered: full offline-first sync engine with local database replication. This would improve resilience but is too large for the first iteration and adds substantial conflict-resolution complexity.

### Model workspaces as personal or team scopes

The product will support two task scopes: a personal workspace owned by the signed-in user and team workspaces shared by all team members. A user may belong to multiple teams, and each task will belong to exactly one scope. This preserves the current personal experience while adding shared collaboration without requiring lowest-common-denominator access semantics.

Alternative considered: mixed personal and team tasks inside one flat list. That would reduce navigation choices, but it makes ownership, filtering, and permissions harder to explain in the first release.

### Keep first-release team permissions intentionally simple

All members of a team workspace will be able to create, edit, complete, uncomplete, and delete tasks in that team. The first release will not distinguish admins, editors, or viewers, and it will not support task assignees. This keeps the RLS and UI model small enough to deliver while still enabling shared team task lists.

Alternative considered: introducing per-team roles in the first release. That would improve control but meaningfully increases schema, policy, and UX complexity.

## Data Model

### Workspace entities

- `public.teams`: stores team workspace metadata such as `id`, `name`, `created_by`, `created_at`, and `updated_at`.
- `public.team_members`: stores many-to-many membership between users and teams using `(team_id, user_id)` as the primary key.
- `public.todos`: evolves from purely user-owned records into scope-aware records.

### Todo ownership shape

Each todo will belong to exactly one workspace scope:

- Personal todo: `owner_user_id` is set and `team_id` is null
- Team todo: `team_id` is set and `owner_user_id` is null

The schema must include a check constraint that enforces exactly one of those columns is populated. The existing todo fields (`title`, `completed`, `created_at`, `updated_at`) remain shared across scopes.

### Team membership behavior

- A user may belong to multiple teams.
- A team creator is automatically inserted into `team_members`.
- Team tasks are visible and mutable to any authenticated user whose `user_id` is present in `team_members` for that team.

## RLS Strategy

The current personal-only `auth.uid() = user_id` rule is no longer sufficient. Policies must evolve to allow:

- Personal todo access when `auth.uid() = owner_user_id`
- Team todo access when a matching `(team_id, auth.uid())` row exists in `team_members`
- Team metadata access only for members of the corresponding team
- Team membership visibility scoped to the current user and their teams

The implementation should centralize these checks in explicit policies rather than relying on client filtering.

## Client Experience

### Workspace switcher

Each client will present a workspace switcher with:

- `My Tasks`
- One entry per team the user belongs to

Selecting a workspace changes the task query scope and the create/edit/delete mutations. The current task interaction pattern can stay mostly unchanged once the active workspace is known.

### Personal and team parity

The same task interactions must remain available in both personal and team workspaces:

- create
- edit
- complete / uncomplete
- delete
- refresh

The first release does not need mixed personal/team task aggregation on a single screen.

## Risks / Trade-offs

- [Cross-platform divergence] -> Mitigation: define shared domain contracts and spec-level parity requirements before implementation.
- [Supabase SDK behavior differs across runtimes] -> Mitigation: isolate backend access in shared adapters and validate each target during implementation.
- [Electron and React Native packaging complexity slows delivery] -> Mitigation: keep the first release feature set intentionally narrow and reuse shared domain modules.
- [Optimistic updates can show temporary states that later fail] -> Mitigation: require clear error recovery, refetch on failed mutations, and user-visible retry behavior.
- [Authentication session handling may vary by platform] -> Mitigation: define platform-specific session storage adapters behind a common auth interface.
- [Workspace scope leaks data through incorrect policies] -> Mitigation: rewrite RLS around explicit personal/team scope rules and validate with multi-user scenarios.
- [Shared team workspaces create hidden collaboration requirements] -> Mitigation: explicitly defer roles, assignees, invites, and comments from the first release.

## Migration Plan

1. Extend the existing workspace with new app targets for mobile and desktop plus common shared packages for todo domain logic and Supabase access.
2. Provision Supabase project resources, including authentication settings plus team, membership, and scope-aware todo tables.
3. Implement shared domain schemas and repository interfaces before building platform-specific screens.
4. Extend the current personal todo flow to support workspace selection and team-scoped CRUD.
5. Build web, mobile, and desktop shells against the shared task and auth flows.
6. Validate sign-in, workspace switching, CRUD, and sync behavior across all clients before enabling broader rollout.

Rollback strategy: because this is a new capability, rollback consists of disabling client deployment targets and withholding environment configuration for Supabase-backed features until the system is stable.

## Open Questions

- Which authentication providers should be enabled initially in Supabase: email magic link only, password login, or social providers?
- Do we want Electron to wrap the web UI closely, or should it have desktop-specific productivity features in later phases?
- Should team creation happen inside the app in the first release, or can we bootstrap initial teams directly in Supabase during development?
