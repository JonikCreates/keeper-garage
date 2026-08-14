create extension if not exists pgcrypto;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default 'My F30' check (char_length(nickname) between 1 and 60),
  brand text not null default 'BMW' check (brand = 'BMW'),
  model text not null default '3 Series (F30)' check (model = '3 Series (F30)'),
  model_year integer not null default 2016 check (model_year = 2016),
  trim text not null check (trim in ('320i', '328i', '328d', '330e', '340i')),
  engine_code text not null check (engine_code in ('N20', 'N26', 'N47T', 'B48-PHEV', 'B58')),
  drivetrain text not null check (drivetrain in ('RWD', 'xDrive')),
  transmission text not null check (transmission in ('8-speed automatic', '6-speed manual')),
  mileage integer check (mileage is null or mileage between 0 and 1000000),
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_owner_id_idx on public.vehicles(owner_id);
create unique index vehicles_one_primary_per_owner_idx
  on public.vehicles(owner_id)
  where is_primary;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.vehicles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their own vehicles"
  on public.vehicles for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Users can create their own vehicles"
  on public.vehicles for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Users can update their own vehicles"
  on public.vehicles for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own vehicles"
  on public.vehicles for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
