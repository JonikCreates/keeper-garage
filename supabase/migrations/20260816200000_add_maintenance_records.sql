create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  maintenance_slug text not null check (char_length(maintenance_slug) between 1 and 160),
  maintenance_name text not null check (char_length(maintenance_name) between 1 and 180),
  completed_at date not null default current_date,
  mileage integer not null check (mileage between 0 and 1000000),
  created_at timestamptz not null default now()
);

create index maintenance_records_vehicle_item_idx
  on public.maintenance_records(vehicle_id, maintenance_slug, completed_at desc, created_at desc);

alter table public.maintenance_records enable row level security;

grant select, insert, delete on public.maintenance_records to authenticated;

create policy "Users can read their own maintenance records"
  on public.maintenance_records for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = maintenance_records.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

create policy "Users can create their own maintenance records"
  on public.maintenance_records for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = maintenance_records.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete their own maintenance records"
  on public.maintenance_records for delete
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = maintenance_records.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

-- REVIEW DECISION: service history is append-only so repeat maintenance keeps a real timeline instead of overwriting the previous mileage.
