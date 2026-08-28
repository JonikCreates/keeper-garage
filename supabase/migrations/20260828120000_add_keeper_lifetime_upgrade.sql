-- Keeper has one permanent purchase: $0.99 USD for three total vehicle slots and PDF export.
-- This migration adds controls without deleting or rewriting any garage, vehicle, or service records.

alter table public.account_entitlements
  drop constraint if exists account_entitlements_source_check;

alter table public.account_entitlements
  add constraint account_entitlements_source_check
  -- `launch_promo` is included for safe reconciliation when a database had
  -- the later promotion SQL applied manually before migration history caught
  -- up. The later launch migration keeps the same complete source set.
  check (source in ('account', 'subscription', 'support', 'purchase', 'legacy_migration', 'launch_promo'));

create table if not exists public.keeper_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null check (product_id = 'keeper_lifetime'),
  provider text not null check (char_length(provider) between 1 and 40),
  provider_transaction_id text not null check (char_length(provider_transaction_id) between 1 and 255),
  amount_cents integer not null check (amount_cents = 99),
  currency text not null check (currency = 'USD'),
  status text not null check (status in ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (provider, provider_transaction_id)
);

create index if not exists keeper_purchases_user_created_idx
  on public.keeper_purchases(user_id, created_at desc);

alter table public.keeper_purchases enable row level security;
revoke all on public.keeper_purchases from public, anon, authenticated;
grant select on public.keeper_purchases to authenticated;

drop policy if exists "Users can read their own Keeper purchases" on public.keeper_purchases;
create policy "Users can read their own Keeper purchases"
  on public.keeper_purchases for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Preserve paid/unlocked development accounts from the retired multi-tier model.
-- Old rows remain in place for audit compatibility; new code reads keeper_lifetime.
insert into public.account_entitlements (user_id, entitlement_key, status, source, expires_at)
select entitlement.user_id, 'keeper_lifetime', 'active', 'legacy_migration', null
from public.account_entitlements entitlement
where entitlement.entitlement_key in ('project_car', 'collector')
  and entitlement.status = 'active'
  and (entitlement.expires_at is null or entitlement.expires_at > now())
on conflict (user_id, entitlement_key) do update
  set status = 'active', expires_at = null, updated_at = now();

create or replace function public.keeper_max_vehicles()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case when public.has_keeper_entitlement('keeper_lifetime') then 3 else 1 end;
$$;

create or replace function public.enforce_keeper_vehicle_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.owner_id <> (select auth.uid()) then
    raise exception 'Vehicle owner does not match the signed-in Keeper account' using errcode = '42501';
  end if;

  if (select count(*) from public.vehicles vehicle where vehicle.owner_id = new.owner_id) >= public.keeper_max_vehicles() then
    raise exception 'Keeper vehicle slot limit reached' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists vehicles_enforce_keeper_limit on public.vehicles;
create trigger vehicles_enforce_keeper_limit
  before insert on public.vehicles
  for each row execute function public.enforce_keeper_vehicle_limit();

revoke all on function public.keeper_max_vehicles() from public, anon, authenticated;
revoke all on function public.enforce_keeper_vehicle_limit() from public, anon, authenticated;

create or replace function public.get_keeper_vehicle_pdf_export(p_vehicle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_keeper_entitlement('keeper_lifetime') then
    raise exception 'Keeper lifetime upgrade required for PDF export' using errcode = '42501';
  end if;

  return public.get_keeper_vehicle_export(p_vehicle_id);
end;
$$;

revoke all on function public.get_keeper_vehicle_pdf_export(uuid) from public, anon;
grant execute on function public.get_keeper_vehicle_pdf_export(uuid) to authenticated;

create or replace function public.get_keeper_purchase_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'lifetime_upgrade', public.has_keeper_entitlement('keeper_lifetime'),
    'latest_status', (
      select purchase.status
      from public.keeper_purchases purchase
      where purchase.user_id = (select auth.uid())
        and purchase.product_id = 'keeper_lifetime'
      order by purchase.created_at desc
      limit 1
    )
  );
$$;

revoke all on function public.get_keeper_purchase_status() from public, anon;
grant execute on function public.get_keeper_purchase_status() to authenticated;

-- Only a trusted payment callback using the service role may call this idempotent recorder.
-- Browsers cannot grant keeper_lifetime or write purchase rows.
create or replace function public.record_keeper_purchase(
  p_user_id uuid,
  p_provider text,
  p_provider_transaction_id text,
  p_status text,
  p_amount_cents integer default 99,
  p_currency text default 'USD'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  recorded_purchase public.keeper_purchases%rowtype;
begin
  if p_status not in ('pending', 'completed', 'failed', 'cancelled') then
    raise exception 'Invalid purchase status' using errcode = '22023';
  end if;

  if p_amount_cents <> 99 or upper(p_currency) <> 'USD' then
    raise exception 'Keeper lifetime purchase amount mismatch' using errcode = '22023';
  end if;

  if not exists (select 1 from auth.users keeper_user where keeper_user.id = p_user_id) then
    raise exception 'Keeper account not found' using errcode = '22023';
  end if;

  insert into public.keeper_purchases (
    user_id, product_id, provider, provider_transaction_id, amount_cents, currency,
    status, completed_at
  ) values (
    p_user_id, 'keeper_lifetime', lower(p_provider), p_provider_transaction_id,
    p_amount_cents, upper(p_currency), p_status,
    case when p_status = 'completed' then now() else null end
  )
  on conflict (provider, provider_transaction_id) do update
    set status = case
          when public.keeper_purchases.status = 'completed' then 'completed'
          else excluded.status
        end,
        completed_at = case
          when public.keeper_purchases.completed_at is not null then public.keeper_purchases.completed_at
          when excluded.status = 'completed' then now()
          else null
        end,
        updated_at = now()
  returning * into recorded_purchase;

  if recorded_purchase.user_id <> p_user_id then
    raise exception 'Provider transaction belongs to another Keeper account' using errcode = '23505';
  end if;

  if recorded_purchase.status = 'completed' then
    insert into public.account_entitlements (user_id, entitlement_key, status, source, expires_at)
    values (p_user_id, 'keeper_lifetime', 'active', 'purchase', null)
    on conflict (user_id, entitlement_key) do update
      set status = 'active', source = 'purchase', expires_at = null, updated_at = now();
  end if;

  return jsonb_build_object(
    'purchase_id', recorded_purchase.id,
    'status', recorded_purchase.status,
    'entitlement_granted', recorded_purchase.status = 'completed'
  );
end;
$$;

revoke all on function public.record_keeper_purchase(uuid, text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.record_keeper_purchase(uuid, text, text, text, integer, text) to service_role;

-- Existing vehicles are intentionally untouched. The insert trigger only prevents new vehicles
-- above the account's current allowance, including for accounts already over the new limit.
