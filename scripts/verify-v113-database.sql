-- Manual database regression. Run as postgres; every fixture is rolled back.
-- Requires an entitled account with a vehicle and an available garage slot.
begin;
-- Run within the migration rehearsal transaction; all fixtures roll back.
create temporary table keeper_test_context as
select v.id as vehicle_id, v.owner_id, gen_random_uuid() as record_id
from public.vehicles v
where exists (select 1 from public.account_entitlements e where e.user_id = v.owner_id and e.entitlement_key = 'authenticated_account' and e.status = 'active')
and (public.keeper_vehicle_limit_for_user(v.owner_id) is null or (select count(*) from public.vehicles v2 where v2.owner_id=v.owner_id)<public.keeper_vehicle_limit_for_user(v.owner_id))
limit 1;
create temporary table keeper_test_fitments as select distinct on (model) * from public.vehicle_catalog_fitments where brand='Chevrolet' or model like '%(JZX90)' or model like '%(JZX100)' order by model;
grant select on keeper_test_context, keeper_test_fitments to authenticated;
do $$ begin perform set_config('request.jwt.claims', json_build_object('sub',owner_id,'role','authenticated','is_anonymous',false)::text,true) from keeper_test_context; end; $$;
set local role authenticated;
do $$
declare c record; actual integer; fixture_record_id uuid; latest date; payload jsonb; f record; test_vehicle uuid;
begin
  select * into strict c from keeper_test_context;
  if not public.has_keeper_entitlement('authenticated_account') then raise exception 'Test fixture needs current account entitlement'; end if;
  -- Use a unique fixture slug, and roll everything back at the end.
  insert into public.maintenance_records (id,owner_id,vehicle_id,maintenance_slug,maintenance_name,work_performed,mileage,completed_at,cost_cents)
    values (c.record_id,c.owner_id,c.vehicle_id,'v113-transaction-test','Release regression','Historical service',100,'2026-08-01',30000);
  update public.maintenance_records set notes='Edited legacy note' where maintenance_records.id=c.record_id;
  select cost_cents into actual from public.maintenance_records where maintenance_records.id=c.record_id and parts_cost_cents is null and labor_cost_cents is null;
  if actual is distinct from 30000 then raise exception 'Legacy cost changed'; end if;
  for actual in 1..4 loop
    insert into public.maintenance_records (owner_id,vehicle_id,maintenance_slug,maintenance_name,work_performed,mileage,completed_at,parts_cost_cents,labor_cost_cents)
      values(c.owner_id,c.vehicle_id,'v113-transaction-test','Release regression','Split service',90,'2026-07-01',case when actual in (1,3) then 25000 else 0 end,case when actual in (2,3) then 18000 else 0 end)
      returning maintenance_records.id into fixture_record_id;
    if (select cost_cents is distinct from parts_cost_cents+labor_cost_cents from public.maintenance_records where maintenance_records.id=fixture_record_id) then raise exception 'Incorrect split total'; end if;
    update public.maintenance_records set parts_cost_cents=parts_cost_cents+1 where maintenance_records.id=fixture_record_id;
    if (select cost_cents is distinct from parts_cost_cents+labor_cost_cents from public.maintenance_records where maintenance_records.id=fixture_record_id) then raise exception 'Edit total incorrect'; end if;
    delete from public.maintenance_records where maintenance_records.id=fixture_record_id;
    if exists(select 1 from public.maintenance_records where maintenance_records.id=fixture_record_id) then raise exception 'Fixture delete failed'; end if;
  end loop;
  insert into public.maintenance_records (owner_id,vehicle_id,maintenance_slug,maintenance_name,work_performed,mileage,completed_at,parts_cost_cents,labor_cost_cents)
    values(c.owner_id,c.vehicle_id,'v113-transaction-test','Release regression','Older backfill',90,'2026-07-01',25000,18000);
  select completed_at into latest from public.maintenance_records where maintenance_slug='v113-transaction-test' order by completed_at desc,created_at desc limit 1;
  if latest <> '2026-08-01' then raise exception 'Backfill replaced latest date'; end if;
  if (select sum(cost_cents) from public.maintenance_records where maintenance_slug='v113-transaction-test') <> 73000 then raise exception 'Spending mismatch'; end if;
  payload := public.get_keeper_vehicle_export(c.vehicle_id);
  if not exists(select 1 from jsonb_array_elements(payload->'records') r where r->>'maintenance_slug'='v113-transaction-test' and (r->>'parts_cost_cents')::integer=25000 and (r->>'labor_cost_cents')::integer=18000) then raise exception 'Export missing split data'; end if;
  if (public.get_keeper_billing_status()->>'plan_code') = 'free' then
    begin perform public.get_keeper_vehicle_pdf_export(c.vehicle_id); raise exception 'Paid export allowed for free plan'; exception when insufficient_privilege then null; end;
  else
    payload := public.get_keeper_vehicle_pdf_export(c.vehicle_id);
    if payload->'records' is null then raise exception 'Paid export missing records'; end if;
  end if;
  if (select count(*) from keeper_test_fitments) <> 10 then raise exception 'Ten vehicle fixtures required'; end if;
  for f in select * from keeper_test_fitments loop
    insert into public.vehicles(owner_id,nickname,brand,model,model_year,trim,engine_code,drivetrain,transmission,mileage,is_primary)
    values(c.owner_id,'v113 transaction fixture',f.brand,f.model,f.model_year,f.trim,f.engine_code,f.drivetrain,f.transmission,100,false) returning vehicles.id into test_vehicle;
    if not exists(select 1 from public.vehicles where vehicles.id=test_vehicle and model=f.model) then raise exception 'New vehicle reload failed'; end if;
    if exists(select 1 from public.maintenance_records where vehicle_id=test_vehicle) then raise exception 'Vehicle switching leaked history'; end if;
    delete from public.vehicles where vehicles.id=test_vehicle;
    if exists(select 1 from public.vehicles where vehicles.id=test_vehicle) then raise exception 'New vehicle removal failed'; end if;
  end loop;
  begin
    update public.maintenance_records set parts_cost_cents=-1 where maintenance_records.id=c.record_id;
    raise exception 'Negative cost accepted';
  exception when check_violation then null; end;
  begin
    update public.maintenance_records set owner_id=gen_random_uuid() where maintenance_records.id=c.record_id;
    raise exception 'Identity edit permitted';
  exception when insufficient_privilege then null; end;
end;
$$;
-- A different identity cannot read or edit the first account's fixture.
do $$ begin perform set_config('request.jwt.claims',json_build_object('sub',gen_random_uuid(),'role','authenticated','is_anonymous',false)::text,true); end; $$;
do $$ begin
  if exists(select 1 from public.maintenance_records where maintenance_slug='v113-transaction-test') then raise exception 'RLS read leak'; end if;
  update public.maintenance_records set cost_cents=0 where maintenance_slug='v113-transaction-test';
  if found then raise exception 'RLS update leak'; end if;
  begin perform public.get_keeper_vehicle_pdf_export(gen_random_uuid()); raise exception 'Paid export allowed without entitlement'; exception when insufficient_privilege then null; end;
end; $$;
reset role;


rollback;
select 'v1.1.3 authenticated CRUD, vehicle isolation, export and entitlement regression passed; all fixtures rolled back' as result;
