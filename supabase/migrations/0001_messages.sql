-- Contact form submissions.
-- Run this once in Supabase -> SQL Editor.

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 254),
  message    text not null check (char_length(message) between 1 and 5000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone (the public website) may INSERT a message, nothing else.
-- Reading, updating and deleting stay closed until the admin area adds
-- policies for signed-in admins.
drop policy if exists "public can send messages" on public.messages;
create policy "public can send messages"
  on public.messages for insert
  to anon, authenticated
  with check (is_read = false);
