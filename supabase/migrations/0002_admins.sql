-- Allowlist of admin emails. Run this once in Supabase -> SQL Editor.
-- Create the actual login (email + password) in
-- Supabase -> Authentication -> Users, then add that same email here.

create table if not exists public.admins (
  email      text primary key check (char_length(email) between 3 and 254),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may check only their own row, so the app can ask
-- "is the current session an admin?" without a service-role key. Nothing
-- else is open: no public select, no insert/update/delete — those stay on
-- the service role key (server only) for the add/remove-admin page later.
drop policy if exists "a user may read their own admin row" on public.admins;
create policy "a user may read their own admin row"
  on public.admins for select
  to authenticated
  using (email = (select auth.jwt() ->> 'email'));

insert into public.admins (email)
values ('info@forgehubrwanda.com')
on conflict (email) do nothing;
