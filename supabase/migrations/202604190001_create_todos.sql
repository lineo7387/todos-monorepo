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

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint todos_title_not_empty check (char_length(btrim(title)) > 0),
  constraint todos_title_length check (char_length(btrim(title)) <= 280)
);

create index if not exists todos_user_id_idx on public.todos (user_id);
create index if not exists todos_user_id_updated_at_idx on public.todos (user_id, updated_at desc);

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at
before update on public.todos
for each row
execute function public.set_updated_at();

alter table public.todos enable row level security;

drop policy if exists "todos_select_own_rows" on public.todos;
create policy "todos_select_own_rows"
on public.todos
for select
using (auth.uid() = user_id);

drop policy if exists "todos_insert_own_rows" on public.todos;
create policy "todos_insert_own_rows"
on public.todos
for insert
with check (auth.uid() = user_id);

drop policy if exists "todos_update_own_rows" on public.todos;
create policy "todos_update_own_rows"
on public.todos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "todos_delete_own_rows" on public.todos;
create policy "todos_delete_own_rows"
on public.todos
for delete
using (auth.uid() = user_id);
