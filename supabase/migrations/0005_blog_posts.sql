-- Blog posts, managed from /admin/blog.
-- Run this once in Supabase -> SQL Editor, after 0004_team_members.sql.

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique check (char_length(slug) between 1 and 200),
  excerpt          text check (char_length(excerpt) <= 400),
  body             text not null check (char_length(body) between 1 and 50000),
  cover_image_url  text,
  cover_image_path text,
  is_published     boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- No public page reads this table yet, so only admins may touch it at all.
drop policy if exists "an admin may read blog posts" on public.blog_posts;
create policy "an admin may read blog posts"
  on public.blog_posts for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may insert blog posts" on public.blog_posts;
create policy "an admin may insert blog posts"
  on public.blog_posts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "an admin may update blog posts" on public.blog_posts;
create policy "an admin may update blog posts"
  on public.blog_posts for update
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

drop policy if exists "an admin may delete blog posts" on public.blog_posts;
create policy "an admin may delete blog posts"
  on public.blog_posts for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );
