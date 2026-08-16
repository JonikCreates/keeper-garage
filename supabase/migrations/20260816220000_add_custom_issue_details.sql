alter table public.vehicle_maintenance_items
  drop constraint if exists vehicle_maintenance_items_item_type_check;

alter table public.vehicle_maintenance_items
  add constraint vehicle_maintenance_items_item_type_check
  check (item_type in ('known_issue', 'custom', 'custom_issue'));

alter table public.vehicle_maintenance_items
  add column if not exists date_found date,
  add column if not exists mileage_found integer,
  add column if not exists issue_status text;

alter table public.vehicle_maintenance_items
  drop constraint if exists vehicle_maintenance_items_mileage_found_check,
  drop constraint if exists vehicle_maintenance_items_issue_status_check;

alter table public.vehicle_maintenance_items
  add constraint vehicle_maintenance_items_mileage_found_check
  check (mileage_found is null or mileage_found between 0 and 1000000),
  add constraint vehicle_maintenance_items_issue_status_check
  check (issue_status is null or issue_status in ('watching', 'needs_repair', 'repaired'));

-- REVIEW DECISION: custom issue observations stay separate from completed service events; removing an active issue never deletes repair history.
