-- RegenOrtho lead log. Every appointment request from the contact form and the
-- concierge assistant lands here as well as in the FormSubmit email, so leads
-- can be counted and tied back to traffic.
--
-- Column names and the status/'test' convention match First Rehab's
-- intake_leads, so the analytics skill's lead query runs unchanged:
--   where coalesce(status,'new') <> 'test'
--
-- Contact-and-scheduling details ONLY, the same fields FormSubmit already
-- receives. The two /forms/* patient questionnaires never write here: they
-- collect PHI and transmit nothing (see CLAUDE.md, "Patient forms — HIPAA").

create table if not exists public.intake_leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  source         text not null check (source in ('contact_form', 'assistant')),
  full_name      text not null check (char_length(full_name) between 1 and 200),
  phone          text not null check (char_length(phone) between 1 and 40),
  email          text check (char_length(email) <= 254),
  service        text check (char_length(service) <= 200),
  preferred_time text check (char_length(preferred_time) <= 200),
  message        text check (char_length(message) <= 4000),
  page           text check (char_length(page) <= 500),
  status         text not null default 'new'
);

create index if not exists intake_leads_created_at_idx on public.intake_leads (created_at desc);

-- The site writes with the public (anon/publishable) key, so RLS is the only
-- thing standing between that key and the data: anon may INSERT and nothing
-- else. No select/update/delete policy exists for anon, so the key cannot read
-- a single lead back. Reads happen through the dashboard / service role.
alter table public.intake_leads enable row level security;

drop policy if exists "anon may submit intake leads" on public.intake_leads;
create policy "anon may submit intake leads"
  on public.intake_leads for insert to anon
  with check (status = 'new');

-- Column-level belt and braces: anon can only ever supply the visitor-entered
-- columns; id, created_at and status always come from the defaults.
revoke all on public.intake_leads from anon, authenticated;
grant insert (source, full_name, phone, email, service, preferred_time, message, page)
  on public.intake_leads to anon;
