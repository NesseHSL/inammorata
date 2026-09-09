-- Wine & Wellness Retreat — full registration/booking details
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- This is separate from innamo_retreat_registrations (the lightweight
-- "register your interest" table from the main retreat page) — this one
-- captures the full booking form: personal details, room/roommate,
-- optional extras, dietary needs, and payment preference.
create table if not exists innamo_retreat_bookings (
  id                bigint generated always as identity primary key,
  first_name        text not null,
  last_name         text not null,
  address           text not null,
  mobile            text not null,
  email             text not null,
  gender            text not null,
  room_type         text not null,              -- 'single' | 'shared'
  roommate_name     text,
  roommate_email    text,
  extra_pt          boolean not null default false,
  extra_nutrition   boolean not null default false,
  extra_massage     boolean not null default false,
  extra_wine_tasting boolean not null default false,
  dietary           text,
  payment_method    text not null,               -- 'bacs' | 'card'
  house_rules_ack   boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table innamo_retreat_bookings enable row level security;

-- No public policies — this table holds full names, home addresses, and
-- mobile numbers, so it's service-role-only, same pattern as
-- innamo_retreat_registrations. All reads/writes go through
-- api/register-retreat-details.js using the service role key.
