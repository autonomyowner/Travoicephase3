-- Enable UUID and crypto extensions (if not already enabled)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- USERS TABLE (profile linked to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
for each row execute function public.set_updated_at();

-- MAPS TABLE
create table if not exists public.maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'Untitled',
  description text,
  graph jsonb not null,
  layout jsonb,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_maps_updated on public.maps;
create trigger trg_maps_updated before update on public.maps
for each row execute function public.set_updated_at();

-- MAP VERSIONS
create table if not exists public.map_versions (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references public.maps(id) on delete cascade,
  version int not null,
  label text,
  graph jsonb not null,
  layout jsonb,
  created_at timestamptz not null default now()
);

-- TEMPLATES
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  graph jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;
alter table public.maps enable row level security;
alter table public.map_versions enable row level security;
alter table public.templates enable row level security;

-- Users can see and manage only their own profile
drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (id = auth.uid());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = auth.uid());
drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
  for insert with check (id = auth.uid());

-- Maps policies: owner only
drop policy if exists maps_select_own on public.maps;
create policy maps_select_own on public.maps
  for select using (user_id = auth.uid());
drop policy if exists maps_insert_own on public.maps;
create policy maps_insert_own on public.maps
  for insert with check (user_id = auth.uid());
drop policy if exists maps_update_own on public.maps;
create policy maps_update_own on public.maps
  for update using (user_id = auth.uid());
drop policy if exists maps_delete_own on public.maps;
create policy maps_delete_own on public.maps
  for delete using (user_id = auth.uid());

-- Map versions: allowed if owns parent map
drop policy if exists map_versions_select_own on public.map_versions;
create policy map_versions_select_own on public.map_versions
  for select using (exists (select 1 from public.maps m where m.id = map_id and m.user_id = auth.uid()));
drop policy if exists map_versions_insert_own on public.map_versions;
create policy map_versions_insert_own on public.map_versions
  for insert with check (exists (select 1 from public.maps m where m.id = map_id and m.user_id = auth.uid()));

-- Templates: view public or own, modify own
drop policy if exists templates_select_public_or_own on public.templates;
create policy templates_select_public_or_own on public.templates
  for select using (is_public or user_id = auth.uid());
drop policy if exists templates_insert_own on public.templates;
create policy templates_insert_own on public.templates
  for insert with check (user_id = auth.uid());
drop policy if exists templates_update_own on public.templates;
create policy templates_update_own on public.templates
  for update using (user_id = auth.uid());
drop policy if exists templates_delete_own on public.templates;
create policy templates_delete_own on public.templates
  for delete using (user_id = auth.uid());

-- Helpful index
create index if not exists idx_maps_user_id on public.maps(user_id);
create index if not exists idx_map_versions_map_id on public.map_versions(map_id);


