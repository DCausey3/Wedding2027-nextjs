-- ============================================================
-- Wedding2027 — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
create type guest_type as enum (
  'COLOMBIA_ONLY', 'USA_ONLY', 'BOTH', 'CHOOSE_ONE', 'BRIDAL_PARTY'
);

create type rsvp_status as enum ('PENDING', 'ACCEPTED', 'DECLINED');

create type wedding_location as enum ('COLOMBIA', 'USA');

create type entree as enum (
  'FILET_MIGNON', 'PAN_SEARED_SALMON', 'MUSHROOM_RISOTTO', 'HERB_ROASTED_CHICKEN'
);

create type user_role as enum ('admin', 'bride', 'groom', 'guest');

-- ── user_roles ────────────────────────────────────────────────
-- Maps Supabase Auth users to their role in the wedding app.
-- Admins/bride/groom are created manually here after signing up.
create table public.user_roles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'guest',
  created_at  timestamptz not null default now(),
  unique(user_id)
);

-- ── guests ────────────────────────────────────────────────────
create table public.guests (
  id               uuid primary key default uuid_generate_v4(),
  first_name       text not null,
  last_name        text not null,
  email            text,
  phone            text,
  invitation_code  text not null unique,
  guest_type       guest_type not null default 'CHOOSE_ONE',
  plus_one_allowed boolean not null default false,
  table_number     integer,
  side             text check (side in ('BRIDE', 'GROOM', 'BOTH')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── rsvps ─────────────────────────────────────────────────────
create table public.rsvps (
  id                  uuid primary key default uuid_generate_v4(),
  guest_id            uuid not null references public.guests(id) on delete cascade,
  status              rsvp_status not null default 'PENDING',
  colombia_attending  boolean not null default false,
  usa_attending       boolean not null default false,
  submitted_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(guest_id)
);

-- ── plus_ones ─────────────────────────────────────────────────
create table public.plus_ones (
  id          uuid primary key default uuid_generate_v4(),
  rsvp_id     uuid not null references public.rsvps(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text,
  created_at  timestamptz not null default now()
);

-- ── meal_preferences ──────────────────────────────────────────
create table public.meal_preferences (
  id                    uuid primary key default uuid_generate_v4(),
  rsvp_id               uuid references public.rsvps(id) on delete cascade,
  plus_one_id           uuid references public.plus_ones(id) on delete cascade,
  entree                entree not null,
  dietary_restrictions  text,
  event_type            wedding_location not null,
  created_at            timestamptz not null default now(),
  -- one meal pref per rsvp per event, and one per plus_one per event
  unique(rsvp_id, event_type),
  unique(plus_one_id, event_type)
);

-- ── travel_info ───────────────────────────────────────────────
create table public.travel_info (
  id                   uuid primary key default uuid_generate_v4(),
  guest_id             uuid not null references public.guests(id) on delete cascade,
  flight_booked        boolean not null default false,
  hotel_booked         boolean not null default false,
  shuttle_needed       boolean not null default false,
  colombia_arrival     date,
  colombia_departure   date,
  usa_arrival          date,
  usa_departure        date,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(guest_id)
);

-- ── updated_at triggers ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger guests_updated_at
  before update on public.guests
  for each row execute function public.set_updated_at();

create trigger rsvps_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

create trigger travel_info_updated_at
  before update on public.travel_info
  for each row execute function public.set_updated_at();

-- ── Dashboard stats RPC ───────────────────────────────────────
-- Called from src/lib/data-client.ts: supabase.rpc('get_dashboard_stats')
create or replace function public.get_dashboard_stats()
returns table (
  total_invited   bigint,
  accepted        bigint,
  declined        bigint,
  pending         bigint,
  colombia_count  bigint,
  usa_count       bigint,
  both_count      bigint,
  plus_one_count  bigint,
  flights_booked  bigint,
  hotels_booked   bigint,
  shuttles_needed bigint
) language sql security definer as $$
  select
    count(g.id)                                                      as total_invited,
    count(r.id) filter (where r.status = 'ACCEPTED')                 as accepted,
    count(r.id) filter (where r.status = 'DECLINED')                 as declined,
    count(g.id) filter (where r.id is null or r.status = 'PENDING') as pending,
    count(r.id) filter (where r.colombia_attending and not r.usa_attending) as colombia_count,
    count(r.id) filter (where r.usa_attending and not r.colombia_attending) as usa_count,
    count(r.id) filter (where r.colombia_attending and r.usa_attending)     as both_count,
    (select count(*) from public.plus_ones)                          as plus_one_count,
    count(t.id) filter (where t.flight_booked)                      as flights_booked,
    count(t.id) filter (where t.hotel_booked)                       as hotels_booked,
    count(t.id) filter (where t.shuttle_needed)                     as shuttles_needed
  from public.guests g
  left join public.rsvps r on r.guest_id = g.id
  left join public.travel_info t on t.guest_id = g.id;
$$;

-- ── Row Level Security ────────────────────────────────────────

alter table public.user_roles      enable row level security;
alter table public.guests          enable row level security;
alter table public.rsvps           enable row level security;
alter table public.plus_ones       enable row level security;
alter table public.meal_preferences enable row level security;
alter table public.travel_info     enable row level security;

-- Helper: is the current user an admin/bride/groom?
create or replace function public.is_wedding_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'bride', 'groom')
  );
$$;

-- user_roles: only admins can manage, users can read their own row
create policy "Admins manage roles"
  on public.user_roles for all
  using (public.is_wedding_admin());

create policy "Users read own role"
  on public.user_roles for select
  using (user_id = auth.uid());

-- guests: admins full access; anonymous read by invitation code (for RSVP lookup)
create policy "Admins manage guests"
  on public.guests for all
  using (public.is_wedding_admin());

create policy "Public RSVP lookup by invitation code"
  on public.guests for select
  using (true);   -- invite code is the secret; restrict further if needed

-- rsvps: admins full; anyone can insert/update (service role used server-side)
create policy "Admins manage rsvps"
  on public.rsvps for all
  using (public.is_wedding_admin());

create policy "Service role writes rsvps"
  on public.rsvps for all
  using (auth.role() = 'service_role');

-- plus_ones
create policy "Admins manage plus_ones"
  on public.plus_ones for all
  using (public.is_wedding_admin());

create policy "Service role writes plus_ones"
  on public.plus_ones for all
  using (auth.role() = 'service_role');

-- meal_preferences
create policy "Admins manage meals"
  on public.meal_preferences for all
  using (public.is_wedding_admin());

create policy "Service role writes meals"
  on public.meal_preferences for all
  using (auth.role() = 'service_role');

-- travel_info
create policy "Admins manage travel"
  on public.travel_info for all
  using (public.is_wedding_admin());

create policy "Service role writes travel"
  on public.travel_info for all
  using (auth.role() = 'service_role');

-- ── Indexes ───────────────────────────────────────────────────
create index on public.guests (invitation_code);
create index on public.rsvps (guest_id);
create index on public.rsvps (status);
create index on public.plus_ones (rsvp_id);
create index on public.meal_preferences (rsvp_id);
create index on public.travel_info (guest_id);

-- ============================================================
-- SETUP: After running this schema, do the following:
--
-- 1. Create your bride/groom accounts via Supabase Auth
--    (Dashboard > Authentication > Users > Invite user)
--
-- 2. Insert their roles:
--    insert into public.user_roles (user_id, role)
--    values ('<your-user-uuid>', 'bride');
--
-- 3. Seed some guests (optional):
--    insert into public.guests (first_name, last_name, invitation_code, guest_type, plus_one_allowed)
--    values ('Mario', 'Causey', 'CAUSEY2026', 'BOTH', true);
-- ============================================================
