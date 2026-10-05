-- Lets a signed-in admin mark a message read. Run this once in Supabase ->
-- SQL Editor, after 0007_storage_buckets.sql.

drop policy if exists "an admin may update messages" on public.messages;
create policy "an admin may update messages"
  on public.messages for update
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
