alter table public.maintenance_records
  add column if not exists cost_cents integer;

alter table public.maintenance_records
  drop constraint if exists maintenance_records_cost_cents_check;

alter table public.maintenance_records
  add constraint maintenance_records_cost_cents_check
  check (cost_cents is null or cost_cents between 0 and 100000000);

-- REVIEW DECISION: costs are stored as integer U.S. cents so totals remain exact; existing records stay null rather than receiving an invented price.
