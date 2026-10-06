-- Open the public-facing content tables for reading by anyone (signed in or
-- not). Run this once in Supabase -> SQL Editor, after 0010_testimonials.sql.
--
-- Until now every content table was admin-only, which is why nothing a visitor
-- loaded could ever show CMS content. These policies grant SELECT only — all
-- writes stay behind the admin policies defined in each table's own migration.
--
-- `blog_posts` is deliberately NOT included: there is no public blog page yet,
-- so its rows stay admin-only. The storage buckets (0007) already allow public
-- select, so images referenced by these rows load without further policy.

drop policy if exists "anyone may read portfolio items" on public.portfolio_items;
create policy "anyone may read portfolio items"
  on public.portfolio_items for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may read portfolio images" on public.portfolio_images;
create policy "anyone may read portfolio images"
  on public.portfolio_images for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may read team members" on public.team_members;
create policy "anyone may read team members"
  on public.team_members for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may read events" on public.events;
create policy "anyone may read events"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may read testimonials" on public.testimonials;
create policy "anyone may read testimonials"
  on public.testimonials for select
  to anon, authenticated
  using (true);
