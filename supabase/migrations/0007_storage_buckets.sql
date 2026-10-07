-- Public image buckets for team, blog and portfolio content.
-- Run this once in Supabase -> SQL Editor, after 0006_portfolio.sql.

insert into storage.buckets (id, name, public)
values
  ('team-images', 'team-images', true),
  ('blog-images', 'blog-images', true),
  ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- Public buckets still need an explicit select policy for anon/authenticated
-- to actually read objects — "public" on the bucket only enables the
-- possibility, this grants it.
drop policy if exists "public can view team images" on storage.objects;
create policy "public can view team images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'team-images');

drop policy if exists "public can view blog images" on storage.objects;
create policy "public can view blog images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "public can view portfolio images" on storage.objects;
create policy "public can view portfolio images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');

-- Writes (upload/replace/delete) stay admin-only, same allowlist check used
-- throughout the rest of the schema.
drop policy if exists "admins can manage team images" on storage.objects;
create policy "admins can manage team images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'team-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  )
  with check (
    bucket_id = 'team-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "admins can manage blog images" on storage.objects;
create policy "admins can manage blog images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'blog-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  )
  with check (
    bucket_id = 'blog-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );

drop policy if exists "admins can manage portfolio images" on storage.objects;
create policy "admins can manage portfolio images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'portfolio-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  )
  with check (
    bucket_id = 'portfolio-images'
    and exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );
