create table if not exists public.app_data (
  key text primary key check (key in ('tasks', 'buildings', 'problems', 'projects')),
  data jsonb not null default '[]'::jsonb
);

alter table public.app_data enable row level security;
revoke all on table public.app_data from anon;
grant select, insert, update on table public.app_data to authenticated;

drop policy if exists "Signed-in users can read office data" on public.app_data;
create policy "Signed-in users can read office data"
  on public.app_data for select to authenticated
  using (true);

drop policy if exists "Signed-in users can create office data" on public.app_data;
create policy "Signed-in users can create office data"
  on public.app_data for insert to authenticated
  with check (true);

drop policy if exists "Signed-in users can update office data" on public.app_data;
create policy "Signed-in users can update office data"
  on public.app_data for update to authenticated
  using (true)
  with check (true);
