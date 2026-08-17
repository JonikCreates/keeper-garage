create table if not exists public.legacy_garage_claims (
  claim_id uuid primary key default gen_random_uuid(),
  claim_secret uuid not null default gen_random_uuid(),
  legacy_user_id uuid not null references auth.users(id) on delete cascade,
  claimed_by uuid references auth.users(id) on delete set null,
  vehicle_count integer not null default 0 check (vehicle_count >= 0),
  maintenance_record_count integer not null default 0 check (maintenance_record_count >= 0),
  maintenance_item_count integer not null default 0 check (maintenance_item_count >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  consumed_at timestamptz,
  check (expires_at > created_at)
);

create unique index if not exists legacy_garage_claims_one_open_per_owner
  on public.legacy_garage_claims(legacy_user_id)
  where consumed_at is null;

create index if not exists legacy_garage_claims_expiration_idx
  on public.legacy_garage_claims(expires_at)
  where consumed_at is null;

alter table public.legacy_garage_claims enable row level security;
revoke all on public.legacy_garage_claims from anon, authenticated;

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
    'account_deletion_requested'
  ));

create or replace function public.prepare_legacy_garage_claim()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  prepared_claim public.legacy_garage_claims%rowtype;
begin
  if current_user_id is null
    or coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) is not true then
    raise exception 'An existing anonymous garage is required' using errcode = '42501';
  end if;

  update public.legacy_garage_claims
  set consumed_at = now()
  where legacy_user_id = current_user_id
    and consumed_at is null
    and expires_at <= now();

  select * into prepared_claim
  from public.legacy_garage_claims
  where legacy_user_id = current_user_id
    and consumed_at is null
  for update;

  if not found then
    insert into public.legacy_garage_claims (
      legacy_user_id,
      vehicle_count,
      maintenance_record_count,
      maintenance_item_count
    ) values (
      current_user_id,
      (select count(*) from public.vehicles where owner_id = current_user_id),
      (select count(*) from public.maintenance_records where owner_id = current_user_id),
      (select count(*) from public.vehicle_maintenance_items where owner_id = current_user_id)
    )
    returning * into prepared_claim;
  end if;

  return jsonb_build_object(
    'claim_id', prepared_claim.claim_id,
    'claim_secret', prepared_claim.claim_secret,
    'vehicle_count', prepared_claim.vehicle_count,
    'maintenance_record_count', prepared_claim.maintenance_record_count,
    'maintenance_item_count', prepared_claim.maintenance_item_count,
    'expires_at', prepared_claim.expires_at
  );
end;
$$;

create or replace function public.get_legacy_garage_claim_summary(p_claim_id uuid, p_claim_secret uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  prepared_claim public.legacy_garage_claims%rowtype;
begin
  if not public.keeper_is_permanent_user() then
    raise exception 'A permanent Keeper account is required' using errcode = '42501';
  end if;

  select * into prepared_claim
  from public.legacy_garage_claims
  where claim_id = p_claim_id
    and claim_secret = p_claim_secret;

  if not found or prepared_claim.expires_at <= now() then
    raise exception 'The existing garage claim is invalid or expired' using errcode = '42501';
  end if;

  if prepared_claim.consumed_at is not null and prepared_claim.claimed_by <> (select auth.uid()) then
    raise exception 'The existing garage claim is unavailable' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'claim_id', prepared_claim.claim_id,
    'vehicle_count', prepared_claim.vehicle_count,
    'maintenance_record_count', prepared_claim.maintenance_record_count,
    'maintenance_item_count', prepared_claim.maintenance_item_count,
    'expires_at', prepared_claim.expires_at,
    'already_imported', prepared_claim.consumed_at is not null
  );
end;
$$;

create or replace function public.claim_legacy_garage(p_claim_id uuid, p_claim_secret uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  prepared_claim public.legacy_garage_claims%rowtype;
begin
  if not public.has_keeper_entitlement('authenticated_account') then
    raise exception 'An active Keeper Profile is required' using errcode = '42501';
  end if;

  select * into prepared_claim
  from public.legacy_garage_claims
  where claim_id = p_claim_id
    and claim_secret = p_claim_secret
  for update;

  if not found or prepared_claim.expires_at <= now() then
    raise exception 'The existing garage claim is invalid or expired' using errcode = '42501';
  end if;

  if prepared_claim.consumed_at is not null then
    if prepared_claim.claimed_by = current_user_id then
      return jsonb_build_object(
        'imported', true,
        'already_imported', true,
        'vehicle_count', prepared_claim.vehicle_count,
        'maintenance_record_count', prepared_claim.maintenance_record_count,
        'maintenance_item_count', prepared_claim.maintenance_item_count
      );
    end if;
    raise exception 'The existing garage claim is unavailable' using errcode = '42501';
  end if;

  if exists (select 1 from public.vehicles where owner_id = current_user_id and is_primary) then
    update public.vehicles
    set is_primary = false
    where owner_id = prepared_claim.legacy_user_id
      and is_primary;
  end if;

  update public.maintenance_records
  set owner_id = current_user_id
  where owner_id = prepared_claim.legacy_user_id;

  update public.vehicle_maintenance_items
  set owner_id = current_user_id
  where owner_id = prepared_claim.legacy_user_id;

  update public.vehicles
  set owner_id = current_user_id,
      updated_at = now()
  where owner_id = prepared_claim.legacy_user_id;

  update public.legacy_garage_claims
  set claimed_by = current_user_id,
      consumed_at = now()
  where claim_id = prepared_claim.claim_id;

  insert into public.security_events (user_id, event_type, metadata)
  values (
    current_user_id,
    'legacy_imported',
    jsonb_build_object(
      'claim_id', prepared_claim.claim_id,
      'vehicle_count', prepared_claim.vehicle_count,
      'maintenance_record_count', prepared_claim.maintenance_record_count,
      'maintenance_item_count', prepared_claim.maintenance_item_count
    )
  );

  return jsonb_build_object(
    'imported', true,
    'already_imported', false,
    'vehicle_count', prepared_claim.vehicle_count,
    'maintenance_record_count', prepared_claim.maintenance_record_count,
    'maintenance_item_count', prepared_claim.maintenance_item_count
  );
end;
$$;

revoke all on function public.prepare_legacy_garage_claim() from public;
revoke all on function public.get_legacy_garage_claim_summary(uuid, uuid) from public;
revoke all on function public.claim_legacy_garage(uuid, uuid) from public;
grant execute on function public.prepare_legacy_garage_claim() to authenticated;
grant execute on function public.get_legacy_garage_claim_summary(uuid, uuid) to authenticated;
grant execute on function public.claim_legacy_garage(uuid, uuid) to authenticated;

-- REVIEW DECISION: a claim ticket is minted only while the anonymous owner is authenticated, expires after 24 hours, transfers all ownership in one transaction, and can be consumed only once by a permanent entitled account.
