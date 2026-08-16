create table public.vehicle_maintenance_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  item_slug text not null check (char_length(item_slug) between 1 and 160),
  item_name text not null check (char_length(btrim(item_name)) between 1 and 180),
  item_type text not null check (item_type in ('known_issue', 'custom')),
  category text not null default 'Other' check (char_length(btrim(category)) between 1 and 80),
  severity text not null default 'routine' check (severity in ('critical', 'important', 'routine')),
  notes text check (notes is null or char_length(btrim(notes)) between 1 and 500),
  created_at timestamptz not null default now(),
  unique (vehicle_id, item_slug)
);

create index vehicle_maintenance_items_owner_vehicle_idx
  on public.vehicle_maintenance_items(owner_id, vehicle_id, created_at desc);

alter table public.vehicle_maintenance_items enable row level security;

grant select, insert, delete on public.vehicle_maintenance_items to authenticated;

create policy "Users can read their own vehicle maintenance items"
  on public.vehicle_maintenance_items for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = vehicle_maintenance_items.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

create policy "Users can create their own vehicle maintenance items"
  on public.vehicle_maintenance_items for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = vehicle_maintenance_items.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

create policy "Users can remove their own vehicle maintenance items"
  on public.vehicle_maintenance_items for delete
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and exists (
      select 1 from public.vehicles
      where vehicles.id = vehicle_maintenance_items.vehicle_id
        and vehicles.owner_id = (select auth.uid())
    )
  );

-- REVIEW DECISION: tracked issues and custom jobs are separate from immutable completion events, so planning can change without rewriting service history.
