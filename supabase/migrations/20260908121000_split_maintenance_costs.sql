-- Additive only: historical totals remain untouched, with no guessed breakdown.
alter table public.maintenance_records
  add column parts_cost_cents integer,
  add column labor_cost_cents integer,
  add constraint maintenance_records_parts_cost_check check (parts_cost_cents is null or parts_cost_cents between 0 and 100000000),
  add constraint maintenance_records_labor_cost_check check (labor_cost_cents is null or labor_cost_cents between 0 and 100000000),
  add constraint maintenance_records_split_total_check check (
    (parts_cost_cents is null and labor_cost_cents is null)
    or (coalesce(parts_cost_cents, 0)::bigint + coalesce(labor_cost_cents, 0)::bigint <= 100000000
      and cost_cents is not null
      and cost_cents = coalesce(parts_cost_cents, 0) + coalesce(labor_cost_cents, 0))
  );

create function public.sync_keeper_maintenance_costs()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.parts_cost_cents is not null or new.labor_cost_cents is not null then
    -- Old clients may edit other details, but cannot overwrite a split total.
    if tg_op = 'UPDATE' then
      if (old.parts_cost_cents is not null or old.labor_cost_cents is not null)
        and new.parts_cost_cents is not distinct from old.parts_cost_cents
        and new.labor_cost_cents is not distinct from old.labor_cost_cents
        and new.cost_cents is distinct from old.cost_cents then
        raise exception 'Edit parts and labor costs with the current Keeper application.' using errcode = '23514';
      end if;
    end if;
    new.cost_cents := coalesce(new.parts_cost_cents, 0) + coalesce(new.labor_cost_cents, 0);
  end if;
  return new;
end;
$$;
revoke all on function public.sync_keeper_maintenance_costs() from public, anon, authenticated;
create trigger maintenance_records_sync_costs
  before insert or update of cost_cents, parts_cost_cents, labor_cost_cents
  on public.maintenance_records for each row execute function public.sync_keeper_maintenance_costs();

-- Permit edits to service details only. Identity, vehicle, slug and creation
-- timestamp stay immutable to browser clients. Retain existing entitlement RLS.
grant update (work_performed, completed_at, mileage, notes, fluid_brand, fluid_product,
  fluid_type, fluid_viscosity, fluid_specification, fluid_quantity, fluid_unit,
  filter_product, cost_cents, parts_cost_cents, labor_cost_cents)
  on public.maintenance_records to authenticated;
create policy "Keeper accounts can edit their own maintenance records"
  on public.maintenance_records for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles v where v.id = maintenance_records.vehicle_id and v.owner_id = (select auth.uid()))
  )
  with check (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles v where v.id = maintenance_records.vehicle_id and v.owner_id = (select auth.uid()))
  );
