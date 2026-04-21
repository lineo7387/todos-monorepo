create or replace function public.create_team_invite(
  target_team_id uuid,
  target_expires_at timestamptz default null
)
returns public.team_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  effective_expires_at timestamptz :=
    coalesce(target_expires_at, timezone('utc', now()) + interval '7 days');
  created_invite public.team_invites%rowtype;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create a team invite.'
      using errcode = '42501';
  end if;

  if effective_expires_at <= timezone('utc', now()) then
    raise exception 'Invite expiry must be in the future.'
      using errcode = '22007';
  end if;

  if not public.is_team_member(target_team_id, current_user_id) then
    raise exception 'You do not have access to create invites for this team.'
      using errcode = '42501';
  end if;

  insert into public.team_invites (
    team_id,
    created_by,
    token,
    expires_at
  )
  values (
    target_team_id,
    current_user_id,
    replace(gen_random_uuid()::text, '-', ''),
    effective_expires_at
  )
  returning *
  into created_invite;

  return created_invite;
end;
$$;
