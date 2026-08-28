-- Release-blocking, data-preserving integration verification for launch claims.
-- This migration exercises the real deployed tables and RPCs with synthetic,
-- verified email/password accounts. All synthetic rows are removed and the
-- exact pre-test promotion state is restored before commit. Any failed
-- assertion aborts the migration and rolls the entire transaction back.

begin;

create temporary table keeper_promotion_state_before_test on commit drop as
select id, redemption_count, active, starts_at, ends_at
from public.keeper_promotions
where promotion_key in ('launch_upgrade_50', 'launch_infinite_10')
for update;

create temporary table keeper_promotion_test_users(
  user_id uuid primary key
) on commit drop;

create or replace function pg_temp.keeper_create_promotion_test_user(p_label text)
returns uuid
language plpgsql
as $$
declare
  test_user_id uuid := gen_random_uuid();
begin
  insert into auth.users(
    instance_id, id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000', test_user_id,
    'authenticated', 'authenticated',
    p_label || '-' || test_user_id::text || '@keeper-promo-test.invalid', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
  );
  insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
  values (test_user_id, 'authenticated_account', 'active', 'account', null::timestamptz);
  insert into keeper_promotion_test_users(user_id) values (test_user_id);
  return test_user_id;
end;
$$;

create or replace function pg_temp.keeper_use_promotion_test_user(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id, 'role', 'authenticated')::text,
    true
  );
  if (select auth.uid()) is distinct from p_user_id then
    raise exception 'Promotion test could not establish auth.uid()';
  end if;
end;
$$;

do $$
begin
  if (select count(*) from keeper_promotion_state_before_test) <> 2 then
    raise exception 'Both Keeper launch promotions must exist before verification';
  end if;
  if not exists (
    select 1 from public.keeper_promotions
    where promotion_key = 'launch_upgrade_50'
      and entitlement_key = 'keeper_unlock_v1'
      and max_redemptions = 50
  ) then raise exception 'Upgrade launch definition is incorrect'; end if;
  if not exists (
    select 1 from public.keeper_promotions
    where promotion_key = 'launch_infinite_10'
      and entitlement_key = 'keeper_unlimited_v1'
      and max_redemptions = 10
  ) then raise exception 'Infinite launch definition is incorrect'; end if;
end;
$$;

-- Row locks above prevent real claims from observing the temporary counters.
update public.keeper_promotions
set redemption_count = 0, active = true, starts_at = null, ends_at = null
where promotion_key in ('launch_upgrade_50', 'launch_infinite_10');

do $$
declare
  test_user_id uuid;
  claim jsonb;
  reloaded jsonb;
  position integer;
begin
  -- Upgrade 1-50, then 51 sold out. Infinite must remain untouched.
  for position in 1..50 loop
    test_user_id := pg_temp.keeper_create_promotion_test_user('upgrade-' || position);
    perform pg_temp.keeper_use_promotion_test_user(test_user_id);
    claim := public.claim_keeper_launch_promotion('launch_upgrade_50');
    if claim->>'status' <> 'claimed'
      or claim->>'plan_code' <> 'keeper_unlock_v1'
      or (claim->>'vehicle_limit')::integer <> 3
      or (claim->>'pdf_export_enabled')::boolean is not true
      or claim->>'entitlement_source' <> 'launch_promo' then
      raise exception 'Upgrade claim % failed: %', position, claim;
    end if;
  end loop;
  test_user_id := pg_temp.keeper_create_promotion_test_user('upgrade-51');
  perform pg_temp.keeper_use_promotion_test_user(test_user_id);
  claim := public.claim_keeper_launch_promotion('launch_upgrade_50');
  if claim->>'status' <> 'sold_out' then raise exception 'Upgrade claim 51 was not sold out: %', claim; end if;
  if (select redemption_count from public.keeper_promotions where promotion_key = 'launch_upgrade_50') <> 50
    or (select redemption_count from public.keeper_promotions where promotion_key = 'launch_infinite_10') <> 0 then
    raise exception 'Upgrade claims did not preserve independent counters';
  end if;

  -- Infinite 1-10, then 11 sold out. Upgrade must remain exactly 50.
  for position in 1..10 loop
    test_user_id := pg_temp.keeper_create_promotion_test_user('infinite-' || position);
    perform pg_temp.keeper_use_promotion_test_user(test_user_id);
    claim := public.claim_keeper_launch_promotion('launch_infinite_10');
    if claim->>'status' <> 'claimed'
      or claim->>'plan_code' <> 'keeper_unlimited_v1'
      or claim->'vehicle_limit' <> 'null'::jsonb
      or (claim->>'pdf_export_enabled')::boolean is not true
      or claim->>'entitlement_source' <> 'launch_promo' then
      raise exception 'Infinite claim % failed: %', position, claim;
    end if;

    -- A fresh auth context must resolve the same database entitlement.
    perform set_config('request.jwt.claim.sub', '', true);
    perform pg_temp.keeper_use_promotion_test_user(test_user_id);
    reloaded := public.get_keeper_billing_status();
    if reloaded->>'plan_code' <> 'keeper_unlimited_v1'
      or reloaded->'vehicle_limit' <> 'null'::jsonb
      or (reloaded->>'pdf_export_enabled')::boolean is not true
      or reloaded->>'entitlement_source' <> 'launch_promo' then
      raise exception 'Infinite entitlement did not persist: %', reloaded;
    end if;
  end loop;
  test_user_id := pg_temp.keeper_create_promotion_test_user('infinite-11');
  perform pg_temp.keeper_use_promotion_test_user(test_user_id);
  claim := public.claim_keeper_launch_promotion('launch_infinite_10');
  if claim->>'status' <> 'sold_out' then raise exception 'Infinite claim 11 was not sold out: %', claim; end if;
  if (select redemption_count from public.keeper_promotions where promotion_key = 'launch_upgrade_50') <> 50
    or (select redemption_count from public.keeper_promotions where promotion_key = 'launch_infinite_10') <> 10 then
    raise exception 'Infinite claims changed the Upgrade counter';
  end if;
end;
$$;

-- Remove the first synthetic batch while the promotion rows remain locked.
delete from public.keeper_promotion_claim_attempts
where user_id in (select user_id from keeper_promotion_test_users);
delete from auth.users
where id in (select user_id from keeper_promotion_test_users);
truncate table keeper_promotion_test_users;
update public.keeper_promotions set redemption_count = 0
where promotion_key in ('launch_upgrade_50', 'launch_infinite_10');

-- One email-only Keeper account can choose Infinite directly, but can never
-- claim the same offer twice or cross into the Upgrade pool.
do $$
declare
  test_user_id uuid := pg_temp.keeper_create_promotion_test_user('one-account');
  first_claim jsonb;
  repeat_claim jsonb;
  cross_claim jsonb;
begin
  perform pg_temp.keeper_use_promotion_test_user(test_user_id);
  first_claim := public.claim_keeper_launch_promotion('launch_infinite_10');
  repeat_claim := public.claim_keeper_launch_promotion('launch_infinite_10');
  cross_claim := public.claim_keeper_launch_promotion('launch_upgrade_50');
  if first_claim->>'status' <> 'claimed'
    or repeat_claim->>'status' <> 'already_claimed'
    or cross_claim->>'status' <> 'already_claimed' then
    raise exception 'One-account promotion enforcement failed: %, %, %', first_claim, repeat_claim, cross_claim;
  end if;
  if (select redemption_count from public.keeper_promotions where promotion_key = 'launch_infinite_10') <> 1
    or (select redemption_count from public.keeper_promotions where promotion_key = 'launch_upgrade_50') <> 0 then
    raise exception 'One-account test changed the wrong counter';
  end if;
end;
$$;

delete from public.keeper_promotion_claim_attempts
where user_id in (select user_id from keeper_promotion_test_users);
delete from auth.users
where id in (select user_id from keeper_promotion_test_users);

-- Restore the exact state that existed before the test and prove no synthetic
-- identity or redemption remains.
update public.keeper_promotions promotion
set redemption_count = original.redemption_count,
    active = original.active,
    starts_at = original.starts_at,
    ends_at = original.ends_at,
    updated_at = now()
from keeper_promotion_state_before_test original
where promotion.id = original.id;

do $$
begin
  if exists (select 1 from auth.users where email like '%@keeper-promo-test.invalid') then
    raise exception 'Synthetic Keeper promotion users were not cleaned up';
  end if;
  if exists (
    select 1
    from public.keeper_promotions promotion
    join keeper_promotion_state_before_test original on original.id = promotion.id
    where promotion.redemption_count <> original.redemption_count
      or promotion.active <> original.active
      or promotion.starts_at is distinct from original.starts_at
      or promotion.ends_at is distinct from original.ends_at
  ) then raise exception 'Promotion state was not restored after verification'; end if;
end;
$$;

commit;
