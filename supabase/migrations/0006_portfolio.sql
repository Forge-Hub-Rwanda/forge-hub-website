-- Portfolio items and their image galleries, managed from /admin/portfolio.
-- Run this once in Supabase -> SQL Editor, after 0005_blog_posts.sql.

create table if not exists public.portfolio_items (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (char_length(slug) between 1 and 200),
  name         text not null check (char_length(name) between 1 and 160),
  blurb        text check (char_length(blurb) <= 400),
  client       text,
  year         text,
  disciplines  text[] not null default '{}',
  status       text,
  href         text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

drop policy if exists "an admin may read portfolio items" on public.portfolio_items;
create policy "an admin may read portfolio items"
  on public.portfolio_items for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may insert portfolio items" on public.portfolio_items;
create policy "an admin may insert portfolio items"
  on public.portfolio_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update portfolio items" on public.portfolio_items;
create policy "an admin may update portfolio items"
  on public.portfolio_items for update
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

drop policy if exists "an admin may delete portfolio items" on public.portfolio_items;
create policy "an admin may delete portfolio items"
  on public.portfolio_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

-- A gallery of images belonging to a portfolio item. Deleting the item
-- cascades the rows here, but NOT the storage objects they point at — the
-- delete action must remove those explicitly before/while deleting the item.
create table if not exists public.portfolio_images (
  id                uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references public.portfolio_items(id) on delete cascade,
  image_url         text not null,
  image_path        text not null,
  alt               text not null default '',
  position          integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.portfolio_images enable row level security;

drop policy if exists "an admin may read portfolio images" on public.portfolio_images;
create policy "an admin may read portfolio images"
  on public.portfolio_images for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may insert portfolio images" on public.portfolio_images;
create policy "an admin may insert portfolio images"
  on public.portfolio_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update portfolio images" on public.portfolio_images;
create policy "an admin may update portfolio images"
  on public.portfolio_images for update
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

drop policy if exists "an admin may delete portfolio images" on public.portfolio_images;
create policy "an admin may delete portfolio images"
  on public.portfolio_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );
