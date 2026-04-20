create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  token text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_invites_token_not_empty check (char_length(btrim(token)) > 0),
  constraint team_invites_expiry_after_creation check (expires_at > created_at)
);

create unique index if not exists team_invites_token_idx on public.team_invites (token);
create index if not exists team_invites_team_id_idx on public.team_invites (team_id);
create index if not exists team_invites_created_by_idx on public.team_invites (created_by);
create index if not exists team_invites_expires_at_idx on public.team_invites (expires_at);
create index if not exists team_invites_revoked_at_idx on public.team_invites (revoked_at);

drop trigger if exists team_invites_set_updated_at on public.team_invites;
create trigger team_invites_set_updated_at
before update on public.team_invites
for each row
execute function public.set_updated_at();
