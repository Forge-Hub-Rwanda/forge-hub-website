-- Team member profiles, managed from /admin/team.
-- Run this once in Supabase -> SQL Editor, after 0003_messages_admin_read.sql.

create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  role       text not null check (char_length(role) between 1 and 120),
  bio        text check (char_length(bio) <= 2000),
  photo_url  text,
  photo_path text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

-- No public page reads this table yet, so only admins may touch it at all.
drop policy if exists "an admin may read team members" on public.team_members;
create policy "an admin may read team members"
  on public.team_members for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may insert team members" on public.team_members;
create policy "an admin may insert team members"
  on public.team_members for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update team members" on public.team_members;
create policy "an admin may update team members"
  on public.team_members for update
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may delete team members" on public.team_members;
create policy "an admin may delete team members"
  on public.team_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );
