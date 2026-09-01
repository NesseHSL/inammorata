-- Innamo Wine & Wellness Retreat — registration backup log
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Registrations only ever existed as an email (guest confirmation + Nesse
-- notification via Gmail/Nodemailer) with nothing else recording them - if
-- the email pipeline ever breaks, that lead is gone with no way to recover
-- it. This table captures every submission independently of whether the
-- email actually sends, so a future Gmail hiccup never costs a real lead.
--
-- No RLS policies are defined on purpose - this table is only ever written
-- to (and read from) using the service role key from api/register-retreat.js
-- and the Supabase dashboard directly, never from the browser, so leaving
-- RLS enabled with zero policies blocks all public API access by default.
create table if not exists innamo_retreat_registrations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  room       text,
  message    text,
  created_at timestamptz not null default now()
);

alter table innamo_retreat_registrations enable row level security;
