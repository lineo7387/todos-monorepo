create or replace function public.redeem_team_invite(target_token text)
returns public.team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_token text := btrim(coalesce(target_token, ''));
  invite_record public.team_invites%rowtype;
  membership_record public.team_members%rowtype;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to redeem a team invite.'
      using errcode = '42501';
  end if;

  if char_length(normalized_token) = 0 then
    raise exception 'Invite token is required.'
      using errcode = '22023';
  end if;

  select *
  into invite_record
  from public.team_invites
  where token = normalized_token;

  if not found then
    raise exception 'Invite is invalid or no longer active.'
      using errcode = '22023';
  end if;

  if invite_record.revoked_at is not null then
    raise exception 'Invite has been revoked.'
      using errcode = '22023';
  end if;

  if invite_record.expires_at <= timezone('utc', now()) then
    raise exception 'Invite has expired.'
      using errcode = '22023';
  end if;

  insert into public.team_members (team_id, user_id)
  values (invite_record.team_id, current_user_id)
  on conflict (team_id, user_id) do nothing
  returning *
  into membership_record;

  if membership_record.team_id is null then
    select *
    into membership_record
    from public.team_members
    where team_id = invite_record.team_id
      and user_id = current_user_id;
  end if;

  return membership_record;
end;
$$;
