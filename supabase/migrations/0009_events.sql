-- Events shown in the "What's on" band on the homepage, managed from
-- /admin/events. Run this once in Supabase -> SQL Editor, after
-- 0008_messages_admin_update.sql.
--
-- `event_date` is nullable on purpose: an event that is still "coming soon"
-- carries no date, and the public band renders "TBA" in its place. `time_text`
-- and `location` are free text (e.g. "6pm", "Dates to be announced",
-- "Kigali and online").

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 160),
  kind         text,
  event_date   date,
  time_text    text,
  location     text,
  position     integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "an admin may insert events" on public.events;
create policy "an admin may insert events"
  on public.events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update events" on public.events;
create policy "an admin may update events"
  on public.events for update
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

drop policy if exists "an admin may delete events" on public.events;
create policy "an admin may delete events"
  on public.events for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

-- The public band reads every event (see 0011_public_read.sql for the select
-- policy). The admin area still filters and orders as it likes.
