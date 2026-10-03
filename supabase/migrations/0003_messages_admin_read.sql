-- Lets a signed-in admin read contact messages. Run this once in Supabase ->
-- SQL Editor, after 0002_admins.sql.

drop policy if exists "an admin may read messages" on public.messages;
create policy "an admin may read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.admins
      where admins.email = (select auth.jwt() ->> 'email')
    )
  );
