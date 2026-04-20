alter table public.team_invites enable row level security;

drop policy if exists "team_members_select_visible_rows" on public.team_members;
create policy "team_members_select_visible_rows"
on public.team_members
for select
using (
  auth.uid() = user_id
  or public.is_team_member(team_id, auth.uid())
);

drop policy if exists "team_invites_select_visible_rows" on public.team_invites;
create policy "team_invites_select_visible_rows"
on public.team_invites
for select
using (public.is_team_member(team_id, auth.uid()));

drop policy if exists "team_invites_insert_member_rows" on public.team_invites;
create policy "team_invites_insert_member_rows"
on public.team_invites
for insert
with check (
  auth.uid() = created_by
  and public.is_team_member(team_id, auth.uid())
);

drop policy if exists "team_invites_update_member_rows" on public.team_invites;
create policy "team_invites_update_member_rows"
on public.team_invites
for update
using (public.is_team_member(team_id, auth.uid()))
with check (
  auth.uid() = created_by
  and public.is_team_member(team_id, auth.uid())
);

drop policy if exists "team_invites_delete_member_rows" on public.team_invites;
create policy "team_invites_delete_member_rows"
on public.team_invites
for delete
using (public.is_team_member(team_id, auth.uid()));

revoke all on function public.create_team_invite(uuid, timestamptz) from public;
revoke all on function public.redeem_team_invite(text) from public;

grant execute on function public.create_team_invite(uuid, timestamptz) to authenticated;
grant execute on function public.redeem_team_invite(text) to authenticated;
