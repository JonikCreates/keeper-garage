alter table public.security_events
  drop constraint if exists security_events_event_type_check;
alter table public.security_events
  add constraint security_events_event_type_check check (event_type in (
    'account_activated',
    'legacy_upgrade',
    'legacy_imported',
    'login',
    'logout',
    'password_reset_requested',
    'export_generated',
    'account_deletion_requested',
    'vehicle_deleted'
  ));

create or replace function public.get_vehicle_removal_summary(p_vehicle_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  owned_vehicle public.vehicles%rowtype;
  maintenance_count bigint;
  tracked_item_count bigint;
begin
  if current_user_id is null or not public.has_keeper_entitlement('authenticated_account') then
    raise exception 'Keeper account required' using errcode = '42501';
  end if;

  select vehicle.*
  into owned_vehicle
  from public.vehicles vehicle
  where vehicle.id = p_vehicle_id
    and vehicle.owner_id = current_user_id;

  if not found then
    raise exception 'Vehicle not found' using errcode = '42501';
  end if;

  select count(*) into maintenance_count
  from public.maintenance_records record
  where record.vehicle_id = owned_vehicle.id
    and record.owner_id = current_user_id;

  select count(*) into tracked_item_count
  from public.vehicle_maintenance_items item
  where item.vehicle_id = owned_vehicle.id
    and item.owner_id = current_user_id;

  return jsonb_build_object(
    'vehicle_id', owned_vehicle.id,
    'maintenance_record_count', maintenance_count,
    'maintenance_item_count', tracked_item_count,
    'total_record_count', maintenance_count + tracked_item_count
  );
end;
$$;

create or replace function public.remove_keeper_vehicle(p_vehicle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  owned_vehicle public.vehicles%rowtype;
  next_vehicle_id uuid;
  maintenance_count bigint;
  tracked_item_count bigint;
begin
  if current_user_id is null or not public.has_keeper_entitlement('authenticated_account') then
    raise exception 'Keeper account required' using errcode = '42501';
  end if;

  select vehicle.*
  into owned_vehicle
  from public.vehicles vehicle
  where vehicle.id = p_vehicle_id
    and vehicle.owner_id = current_user_id
  for update;

  if not found then
    raise exception 'Vehicle not found' using errcode = '42501';
  end if;

  select count(*) into maintenance_count
  from public.maintenance_records record
  where record.vehicle_id = owned_vehicle.id
    and record.owner_id = current_user_id;

  select count(*) into tracked_item_count
  from public.vehicle_maintenance_items item
  where item.vehicle_id = owned_vehicle.id
    and item.owner_id = current_user_id;

  delete from public.vehicles vehicle
  where vehicle.id = owned_vehicle.id
    and vehicle.owner_id = current_user_id;

  if owned_vehicle.is_primary then
    select vehicle.id
    into next_vehicle_id
    from public.vehicles vehicle
    where vehicle.owner_id = current_user_id
    order by vehicle.updated_at desc, vehicle.created_at desc, vehicle.id
    limit 1
    for update;

    if next_vehicle_id is not null then
      update public.vehicles
      set is_primary = true
      where id = next_vehicle_id
        and owner_id = current_user_id;
    end if;
  else
    select vehicle.id
    into next_vehicle_id
    from public.vehicles vehicle
    where vehicle.owner_id = current_user_id
      and vehicle.is_primary
    limit 1;
  end if;

  insert into public.security_events (user_id, event_type, metadata)
  values (
    current_user_id,
    'vehicle_deleted',
    jsonb_build_object(
      'vehicle_id', owned_vehicle.id,
      'maintenance_record_count', maintenance_count,
      'maintenance_item_count', tracked_item_count
    )
  );

  return jsonb_build_object(
    'removed_vehicle_id', owned_vehicle.id,
    'next_vehicle_id', next_vehicle_id,
    'maintenance_record_count', maintenance_count,
    'maintenance_item_count', tracked_item_count
  );
end;
$$;

revoke all on function public.get_vehicle_removal_summary(uuid) from public, anon;
revoke all on function public.remove_keeper_vehicle(uuid) from public, anon;
grant execute on function public.get_vehicle_removal_summary(uuid) to authenticated;
grant execute on function public.remove_keeper_vehicle(uuid) to authenticated;

-- REVIEW DECISION: deleting the owned vehicle is the single cascade root. Vehicle-specific maintenance rows already reference it with ON DELETE CASCADE, while shared catalog research is code-owned and is never touched.
