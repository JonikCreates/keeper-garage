alter table public.maintenance_records
  add column if not exists work_performed text;

update public.maintenance_records
set work_performed = 'Completed service — details not recorded'
where work_performed is null;

alter table public.maintenance_records
  alter column work_performed set not null;

alter table public.maintenance_records
  drop constraint if exists maintenance_records_work_performed_length;

alter table public.maintenance_records
  add constraint maintenance_records_work_performed_length
  check (char_length(btrim(work_performed)) between 1 and 240);

-- REVIEW DECISION: legacy records receive an explicit unknown-detail label instead of being deleted or assigned invented repair details.
