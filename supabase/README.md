# Supabase Setup

This directory captures the first-release Supabase contract for the cross-platform todos product.

## Database

Apply the migration files in `supabase/migrations/` to provision the workspace-scoped todo schema.

Current schema decisions:

- Table: `public.todos`
- Workspace tables: `public.teams`, `public.team_members`, `public.team_invites`
- Ownership: every todo belongs to exactly one workspace scope
- Personal scope: `owner_user_id` is set and `team_id` is null
- Team scope: `team_id` is set and `owner_user_id` is null
- Security: row-level security is enabled and policies allow access to personal todos owned by the current user plus team todos for teams the current user belongs to
- Sync shape: tasks are fetched per workspace and ordered by most recently updated first

Current migration note:

- The workspace migration keeps the legacy `todos.user_id` column temporarily aligned with `owner_user_id` for personal tasks so existing personal-only clients can continue to run while shared packages move to the new scope model.
- New team-scoped writes should use `team_id` and leave both `owner_user_id` and `user_id` null on insert input. The database trigger will preserve the correct scope semantics.

## Required Auth Settings

Configure Supabase Auth before connecting any client:

- Enable email-based authentication for the first release. Password and magic-link flows can both be enabled, but at least one email flow must be available.
- Set the site URL to the local web client during development, for example `http://localhost:5173`.
- Add redirect URLs for every supported client shell that participates in auth callbacks.
- Keep anonymous sign-in disabled unless the product intentionally adds guest-mode support later.
- Treat the anon key as a client-side public credential only when combined with row-level security; never ship the service-role key to app clients.

Recommended redirect URL placeholders:

- Web: `http://localhost:5173`
- React Native: your Expo or native deep-link callback URL once task `4.2` wires the shell
- Electron: a desktop callback URL or custom protocol once task `4.3` wires the shell

## Team Workspace Setup Notes

- Team creators are automatically inserted into `public.team_members` by the database trigger.
- Team invites are persisted in `public.team_invites` with token, expiry, and revocation metadata so later server-side join flows can validate active, expired, and revoked states safely.
- Invite creation should go through the `public.create_team_invite(target_team_id, target_expires_at)` database function so the database can verify membership before inserting an invite row.
- Invite redemption should go through the `public.redeem_team_invite(target_token)` database function so the database can validate the invite and insert the caller's membership idempotently.
- `public.team_invites` is protected by row-level security and only visible to current team members; non-members must go through the constrained redemption function instead of reading invite rows directly.
- Execute access for invite RPCs is explicitly limited to the Supabase `authenticated` role.
- In the current first-release model, all team members can create, edit, complete, uncomplete, and delete tasks for that team.
- Team roles, invitations, assignees, and comments are intentionally out of scope for the first release.

## Next Steps

- Task `6.2` will update shared domain types, repositories, and application state to target workspace-scoped task data.
- Tasks `6.3` through `6.5` will add workspace switching and team todo flows to the web, mobile, and desktop clients.
