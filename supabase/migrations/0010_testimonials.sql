-- Member quotes shown in the "Community" band on the homepage, managed from
-- /admin/community. Run this once in Supabase -> SQL Editor, after
-- 0009_events.sql.

create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  quote        text not null check (char_length(quote) between 1 and 1000),
  name         text not null check (char_length(name) between 1 and 160),
  role         text,
  position     integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.testimonials enable row level security;

drop policy if exists "an admin may insert testimonials" on public.testimonials;
create policy "an admin may insert testimonials"
  on public.testimonials for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update testimonials" on public.testimonials;
create policy "an admin may update testimonials"
  on public.testimonials for update
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

drop policy if exists "an admin may delete testimonials" on public.testimonials;
create policy "an admin may delete testimonials"
  on public.testimonials for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

-- The public band reads every testimonial (see 0011_public_read.sql).
