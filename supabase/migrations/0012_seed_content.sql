-- Copies the content that used to be hand-written in src/lib/site.ts into the
-- CMS tables, so the admin panel and the public site show the same records.
-- Run this once in Supabase -> SQL Editor, after 0011_public_read.sql.
--
-- Safe to run more than once: each insert skips rows that already exist
-- (projects by slug, everything else by name/quote), so it never duplicates.
--
-- After this, the admin panel is the only source for these sections. Edit or
-- delete any of these rows from /admin, including the placeholder ones.

-- Portfolio: listed oldest first, so the created_at offsets keep the original
-- order (the real project first, then the two placeholder slots).
insert into public.portfolio_items
  (slug, name, blurb, client, year, disciplines, status, is_published, created_at, updated_at)
values
  ('forgehub-rwanda-website', 'forgehubrwanda.com',
   'Our own site — designed, built and shipped in-house.',
   'In-house', '2026', array['Software development', 'Design'], 'Live', true,
   now() - interval '3 minutes', now() - interval '3 minutes'),
  ('client-build-slot', 'A client build',
   'A commissioned product. Naming it is the client''s call, not ours.',
   'Client to be named', 'To be confirmed', array['Software development'],
   'Write-up in preparation', true,
   now() - interval '2 minutes', now() - interval '2 minutes'),
  ('training-engagement-slot', 'A training engagement',
   'Software training delivered for a team, rather than an individual.',
   'Organization to be named', 'To be confirmed', array['Training & education'],
   'Write-up in preparation', true,
   now() - interval '1 minute', now() - interval '1 minute')
on conflict (slug) do nothing;

-- Team, in the order the Team page shows them.
insert into public.team_members (name, role, position)
select v.name, v.role, v.position
from (values
  ('Jimmy Shimwa', 'Founder', 0),
  ('Fadhiri Ihirwe Ndegeya', 'Co-Founder', 1),
  ('Benjamin Inema', 'Founding team', 2),
  ('Ishimwe Valentin', 'Founding team', 3)
) as v(name, role, position)
where not exists (
  select 1 from public.team_members t where t.name = v.name
);

-- Anyone already added through /admin/team keeps their place, but after the
-- four founders. Only rows still inside the founders' 0–3 range move, so a
-- second run changes nothing.
update public.team_members
set position = position + 4
where name not in (
  'Jimmy Shimwa', 'Fadhiri Ihirwe Ndegeya', 'Benjamin Inema', 'Ishimwe Valentin'
)
and position < 4;

-- What's on: the holding row. No date, so the site shows "TBA".
insert into public.events (name, kind, event_date, time_text, location, position)
select 'Community meetups and demo days', 'Coming soon', null,
       'Dates to be announced', 'Kigali and online', 0
where not exists (
  select 1 from public.events e where e.name = 'Community meetups and demo days'
);

-- Community: the holding quote.
insert into public.testimonials (quote, name, role, position)
select 'Our first cohort has not finished yet. When it has, this space belongs to their words rather than ours.',
       'Member stories', 'Coming soon', 0
where not exists (
  select 1 from public.testimonials t where t.name = 'Member stories'
);
