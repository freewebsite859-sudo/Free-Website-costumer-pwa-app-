-- ============================================================================
-- Nexora Salon Booking - initial schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type booking_status as enum ('CONFIRMED', 'PENDING', 'PAST', 'COMPLETED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type waitlist_status as enum ('ACTIVE', 'NOTIFIED', 'EXPIRED', 'CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('reminder_1h', 'booking_confirmed', 'general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum ('sms', 'push', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('OPEN', 'RESOLVED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_category as enum ('Unisex', 'Women Only', 'Men Only');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- PUBLIC CATALOG (readable by everyone, written by admins/service role only)
-- ===========================================================================

create table if not exists public.salons (
  id              text primary key,
  name            text not null,
  area            text not null,
  city            text not null,
  distance_km     numeric(5,2) not null default 0,
  rating          numeric(2,1) not null default 0,
  review_count    integer not null default 0,
  verified        boolean not null default false,
  is_new          boolean not null default false,
  image           text not null default '',
  gallery         jsonb not null default '[]'::jsonb,
  starting_price  integer not null default 0,
  tags            jsonb not null default '[]'::jsonb,
  gender_category gender_category default 'Unisex',
  address         text not null default '',
  hours           text not null default '',
  description     text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.services (
  id               text primary key,
  salon_id         text not null references public.salons(id) on delete cascade,
  name             text not null,
  duration_minutes integer not null default 45,
  price            integer not null default 0,
  category         text not null default 'Beauty',
  description      text,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists services_salon_id_idx on public.services(salon_id);

create table if not exists public.staff (
  id            text primary key,
  salon_id      text not null references public.salons(id) on delete cascade,
  name          text not null,
  role          text not null default 'Stylist',
  rating        numeric(2,1) not null default 0,
  reviews_count integer not null default 0,
  avatar        text not null default '',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists staff_salon_id_idx on public.staff(salon_id);

-- ===========================================================================
-- PER-USER DATA (row level security scoped to auth.uid())
-- ===========================================================================

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null default '',
  email           text,
  phone           text,
  avatar_url      text,
  date_of_birth   date,
  gender          text,
  preferred_city  text,
  preferred_area  text,
  language        text not null default 'English',
  theme           text not null default 'light',
  -- App/notification preferences (previously scattered localStorage flags)
  preferences     jsonb not null default '{}'::jsonb,
  location        jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null default 'Home',
  flat_number text not null default '',
  street      text not null default '',
  landmark    text,
  city        text not null default '',
  pincode     text not null default '',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists addresses_user_id_idx on public.addresses(user_id);
-- At most one default address per user.
create unique index if not exists addresses_one_default_per_user
  on public.addresses(user_id) where is_default;

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null,
  user_id       uuid not null references auth.users(id) on delete cascade,
  salon_id      text references public.salons(id) on delete set null,
  salon_name    text not null,
  services      jsonb not null default '[]'::jsonb,
  total_amount  integer not null default 0,
  date_str      text not null,
  time_slot     text not null,
  status        booking_status not null default 'CONFIRMED',
  staff_name    text,
  location_area text not null default '',
  is_reviewed   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists bookings_user_id_idx on public.bookings(user_id, created_at desc);
create unique index if not exists bookings_user_reference_idx on public.bookings(user_id, reference);

create table if not exists public.favorite_salons (
  user_id    uuid not null references auth.users(id) on delete cascade,
  salon_id   text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, salon_id)
);

create table if not exists public.favorite_professionals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  pro_id     text not null,
  salon_id   text,
  name       text not null,
  role       text not null default '',
  rating     numeric(2,1) not null default 0,
  avatar     text not null default '',
  salon_name text not null default '',
  skills     jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, pro_id)
);
create index if not exists favorite_professionals_user_idx on public.favorite_professionals(user_id);

create table if not exists public.favorite_services (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  service_id       text not null,
  salon_id         text,
  name             text not null,
  duration_minutes integer not null default 45,
  price            integer not null default 0,
  salon_name       text not null default '',
  category         text not null default '',
  created_at       timestamptz not null default now(),
  unique (user_id, service_id)
);
create index if not exists favorite_services_user_idx on public.favorite_services(user_id);

-- Reviews are written by their author but readable by everyone.
create table if not exists public.service_reviews (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  salon_id          text not null,
  service_id        text,
  service_name      text not null,
  author            text not null default 'Verified Client',
  rating            numeric(2,1) not null check (rating >= 0 and rating <= 5),
  comment           text not null default '',
  verified_booking  boolean not null default false,
  created_at        timestamptz not null default now()
);
create index if not exists service_reviews_salon_idx on public.service_reviews(salon_id, created_at desc);

create table if not exists public.waitlist_entries (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  salon_id                text not null,
  salon_name              text not null default '',
  service_names           jsonb not null default '[]'::jsonb,
  date_str                text not null,
  time_slot               text not null,
  client_name             text not null default '',
  client_phone            text not null default '',
  notification_preference notification_channel not null default 'both',
  position                integer not null default 1,
  status                  waitlist_status not null default 'ACTIVE',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists waitlist_user_idx on public.waitlist_entries(user_id, created_at desc);

create table if not exists public.notifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  booking_id       uuid references public.bookings(id) on delete cascade,
  salon_name       text not null default '',
  time_slot        text not null default '',
  date_str         text not null default '',
  services_summary text not null default '',
  message          text not null default '',
  type             notification_type not null default 'general',
  read             boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject    text not null,
  category   text not null default 'Booking',
  status     ticket_status not null default 'OPEN',
  messages   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'salons','profiles','addresses','bookings','waitlist_entries','support_tickets'
  ] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', t);
    execute format(
      'create trigger set_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.salons                enable row level security;
alter table public.services              enable row level security;
alter table public.staff                 enable row level security;
alter table public.profiles              enable row level security;
alter table public.addresses             enable row level security;
alter table public.bookings              enable row level security;
alter table public.favorite_salons       enable row level security;
alter table public.favorite_professionals enable row level security;
alter table public.favorite_services     enable row level security;
alter table public.service_reviews       enable row level security;
alter table public.waitlist_entries      enable row level security;
alter table public.notifications         enable row level security;
alter table public.support_tickets       enable row level security;

-- Catalog: readable by anyone (including anonymous visitors).
drop policy if exists "catalog_read_salons" on public.salons;
create policy "catalog_read_salons" on public.salons for select using (true);

drop policy if exists "catalog_read_services" on public.services;
create policy "catalog_read_services" on public.services for select using (true);

drop policy if exists "catalog_read_staff" on public.staff;
create policy "catalog_read_staff" on public.staff for select using (true);

-- Reviews: world readable, but only the author may write/modify their own.
drop policy if exists "reviews_read_all" on public.service_reviews;
create policy "reviews_read_all" on public.service_reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.service_reviews;
create policy "reviews_insert_own" on public.service_reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.service_reviews;
create policy "reviews_update_own" on public.service_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.service_reviews;
create policy "reviews_delete_own" on public.service_reviews
  for delete using (auth.uid() = user_id);

-- Profiles: a user can only see and edit their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Everything else: full CRUD restricted to the owning user.
do $$
declare t text;
begin
  foreach t in array array[
    'addresses','bookings','favorite_salons','favorite_professionals',
    'favorite_services','waitlist_entries','notifications','support_tickets'
  ] loop
    execute format('drop policy if exists "%1$s_owner_all" on public.%1$s', t);
    execute format(
      'create policy "%1$s_owner_all" on public.%1$s
         for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;
