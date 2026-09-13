-- Cardinal Propulsion Lab member schedule
-- Run this in the Supabase SQL editor once after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.member_allowlist (
  email text primary key check (email = lower(email)),
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 1 and 80),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  activity text not null check (char_length(activity) between 1 and 120),
  notes text,
  created_at timestamptz not null default now(),
  constraint valid_schedule_range check (ends_at > starts_at)
);

alter table public.member_allowlist enable row level security;
alter table public.schedule_entries enable row level security;

create or replace function public.is_cpl_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.is_cpl_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
  );
$$;

grant execute on function public.is_cpl_member() to authenticated;
grant execute on function public.is_cpl_admin() to authenticated;

-- Allow each approved member to read their own allowlist row; admins can read all.
drop policy if exists "allowlist_select" on public.member_allowlist;
create policy "allowlist_select"
on public.member_allowlist
for select
to authenticated
using (
  email = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_cpl_admin()
);

-- Only admins can add/update/remove access.
drop policy if exists "allowlist_insert_admin" on public.member_allowlist;
create policy "allowlist_insert_admin"
on public.member_allowlist
for insert
to authenticated
with check (public.is_cpl_admin());

drop policy if exists "allowlist_update_admin" on public.member_allowlist;
create policy "allowlist_update_admin"
on public.member_allowlist
for update
to authenticated
using (public.is_cpl_admin())
with check (public.is_cpl_admin());

drop policy if exists "allowlist_delete_admin" on public.member_allowlist;
create policy "allowlist_delete_admin"
on public.member_allowlist
for delete
to authenticated
using (public.is_cpl_admin());

-- Approved members can view the schedule.
drop policy if exists "schedule_select_members" on public.schedule_entries;
create policy "schedule_select_members"
on public.schedule_entries
for select
to authenticated
using (public.is_cpl_member());

-- Only administrators can modify it.
drop policy if exists "schedule_insert_admin" on public.schedule_entries;
create policy "schedule_insert_admin"
on public.schedule_entries
for insert
to authenticated
with check (public.is_cpl_admin());

drop policy if exists "schedule_update_admin" on public.schedule_entries;
create policy "schedule_update_admin"
on public.schedule_entries
for update
to authenticated
using (public.is_cpl_admin())
with check (public.is_cpl_admin());

drop policy if exists "schedule_delete_admin" on public.schedule_entries;
create policy "schedule_delete_admin"
on public.schedule_entries
for delete
to authenticated
using (public.is_cpl_admin());

-- Seed Colette as the first administrator.
insert into public.member_allowlist (email, role)
values ('colettef@stanford.edu', 'admin')
on conflict (email) do update set role = excluded.role;
