create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint teams_name_not_empty check (char_length(btrim(name)) > 0)
);

create index if not exists teams_created_by_idx on public.teams (created_by);

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (team_id, user_id)
);

create index if not exists team_members_user_id_idx on public.team_members (user_id);

create or replace function public.add_team_creator_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id)
  values (new.id, new.created_by)
  on conflict (team_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists teams_add_creator_membership on public.teams;
create trigger teams_add_creator_membership
after insert on public.teams
for each row
execute function public.add_team_creator_membership();

create or replace function public.is_team_member(target_team_id uuid, target_user_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members
    where team_id = target_team_id and user_id = target_user_id
  );
$$;

alter table public.todos
add column if not exists owner_user_id uuid references auth.users (id) on delete cascade,
add column if not exists team_id uuid references public.teams (id) on delete cascade;

update public.todos
set owner_user_id = user_id
where owner_user_id is null and user_id is not null;

alter table public.todos
alter column user_id drop not null;

create or replace function public.sync_todo_owner_columns()
returns trigger
language plpgsql
as $$
begin
  if new.team_id is null then
    if new.owner_user_id is null and new.user_id is not null then
      new.owner_user_id = new.user_id;
    end if;

    if new.user_id is null and new.owner_user_id is not null then
      new.user_id = new.owner_user_id;
    end if;

    if new.owner_user_id is not null then
      new.user_id = new.owner_user_id;
    end if;
  else
    new.owner_user_id = null;
    new.user_id = null;
  end if;

  return new;
end;
$$;

drop trigger if exists todos_sync_owner_columns on public.todos;
create trigger todos_sync_owner_columns
before insert or update on public.todos
for each row
execute function public.sync_todo_owner_columns();

alter table public.todos
drop constraint if exists todos_scope_exactly_one_owner;

alter table public.todos
add constraint todos_scope_exactly_one_owner
check (
  (owner_user_id is not null and team_id is null)
  or (owner_user_id is null and team_id is not null)
);

create index if not exists todos_owner_user_id_idx on public.todos (owner_user_id);
create index if not exists todos_owner_user_id_updated_at_idx
on public.todos (owner_user_id, updated_at desc);
create index if not exists todos_team_id_idx on public.todos (team_id);
create index if not exists todos_team_id_updated_at_idx
on public.todos (team_id, updated_at desc);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "todos_select_own_rows" on public.todos;
drop policy if exists "todos_insert_own_rows" on public.todos;
drop policy if exists "todos_update_own_rows" on public.todos;
drop policy if exists "todos_delete_own_rows" on public.todos;

drop policy if exists "teams_select_visible_rows" on public.teams;
create policy "teams_select_visible_rows"
on public.teams
for select
using (
  auth.uid() = created_by
  or public.is_team_member(id, auth.uid())
);

drop policy if exists "teams_insert_own_rows" on public.teams;
create policy "teams_insert_own_rows"
on public.teams
for insert
with check (auth.uid() = created_by);

drop policy if exists "teams_update_created_rows" on public.teams;
create policy "teams_update_created_rows"
on public.teams
for update
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

drop policy if exists "teams_delete_created_rows" on public.teams;
create policy "teams_delete_created_rows"
on public.teams
for delete
using (auth.uid() = created_by);

drop policy if exists "team_members_select_visible_rows" on public.team_members;
create policy "team_members_select_visible_rows"
on public.team_members
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.teams
    where id = team_id and created_by = auth.uid()
  )
);

drop policy if exists "team_members_insert_created_team_rows" on public.team_members;
create policy "team_members_insert_created_team_rows"
on public.team_members
for insert
with check (
  exists (
    select 1
    from public.teams
    where id = team_id and created_by = auth.uid()
  )
);

drop policy if exists "team_members_delete_created_team_rows" on public.team_members;
create policy "team_members_delete_created_team_rows"
on public.team_members
for delete
using (
  exists (
    select 1
    from public.teams
    where id = team_id and created_by = auth.uid()
  )
);

drop policy if exists "todos_select_visible_rows" on public.todos;
create policy "todos_select_visible_rows"
on public.todos
for select
using (
  auth.uid() = owner_user_id
  or (
    team_id is not null
    and public.is_team_member(team_id, auth.uid())
  )
);

drop policy if exists "todos_insert_visible_rows" on public.todos;
create policy "todos_insert_visible_rows"
on public.todos
for insert
with check (
  auth.uid() = owner_user_id
  or (
    team_id is not null
    and public.is_team_member(team_id, auth.uid())
  )
);

drop policy if exists "todos_update_visible_rows" on public.todos;
create policy "todos_update_visible_rows"
on public.todos
for update
using (
  auth.uid() = owner_user_id
  or (
    team_id is not null
    and public.is_team_member(team_id, auth.uid())
  )
)
with check (
  auth.uid() = owner_user_id
  or (
    team_id is not null
    and public.is_team_member(team_id, auth.uid())
  )
);

drop policy if exists "todos_delete_visible_rows" on public.todos;
create policy "todos_delete_visible_rows"
on public.todos
for delete
using (
  auth.uid() = owner_user_id
  or (
    team_id is not null
    and public.is_team_member(team_id, auth.uid())
  )
);
