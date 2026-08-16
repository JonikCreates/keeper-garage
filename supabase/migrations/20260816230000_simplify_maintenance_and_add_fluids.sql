alter table public.vehicle_maintenance_items
  add column if not exists plan_type text not null default 'none',
  add column if not exists mileage_interval integer,
  add column if not exists time_interval_months integer,
  add column if not exists tracks_fluid boolean not null default false;

alter table public.vehicle_maintenance_items
  drop constraint if exists vehicle_maintenance_items_plan_type_check,
  drop constraint if exists vehicle_maintenance_items_mileage_interval_check,
  drop constraint if exists vehicle_maintenance_items_time_interval_check;

alter table public.vehicle_maintenance_items
  add constraint vehicle_maintenance_items_plan_type_check
  check (plan_type in ('mileage', 'time', 'both', 'none')),
  add constraint vehicle_maintenance_items_mileage_interval_check
  check (mileage_interval is null or mileage_interval between 1 and 500000),
  add constraint vehicle_maintenance_items_time_interval_check
  check (time_interval_months is null or time_interval_months between 1 and 600);

alter table public.maintenance_records
  add column if not exists notes text,
  add column if not exists fluid_brand text,
  add column if not exists fluid_product text,
  add column if not exists fluid_type text,
  add column if not exists fluid_viscosity text,
  add column if not exists fluid_specification text,
  add column if not exists fluid_quantity numeric(8,2),
  add column if not exists fluid_unit text,
  add column if not exists filter_product text;

alter table public.maintenance_records
  drop constraint if exists maintenance_records_optional_details_check,
  drop constraint if exists maintenance_records_fluid_quantity_check;

alter table public.maintenance_records
  add constraint maintenance_records_optional_details_check
  check (
    (notes is null or char_length(btrim(notes)) between 1 and 1000)
    and (fluid_brand is null or char_length(btrim(fluid_brand)) between 1 and 100)
    and (fluid_product is null or char_length(btrim(fluid_product)) between 1 and 160)
    and (fluid_type is null or char_length(btrim(fluid_type)) between 1 and 100)
    and (fluid_viscosity is null or char_length(btrim(fluid_viscosity)) between 1 and 60)
    and (fluid_specification is null or char_length(btrim(fluid_specification)) between 1 and 120)
    and (fluid_unit is null or char_length(btrim(fluid_unit)) between 1 and 30)
    and (filter_product is null or char_length(btrim(filter_product)) between 1 and 120)
  ),
  add constraint maintenance_records_fluid_quantity_check
  check (fluid_quantity is null or fluid_quantity between 0 and 10000);

-- REVIEW DECISION: every fluid entry belongs to its completed service event; existing schedules and history remain untouched and valid.
