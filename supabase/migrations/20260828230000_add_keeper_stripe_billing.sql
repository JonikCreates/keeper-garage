-- Keeper one-time billing v1. This migration is additive: existing purchases, vehicles,
-- maintenance history, and legacy entitlements remain intact.

create table if not exists public.keeper_billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  provider_customer_id text not null unique check (char_length(provider_customer_id) between 3 and 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keeper_billing_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'stripe' check (provider = 'stripe'),
  product_code text not null check (product_code in ('keeper_unlock_v1', 'keeper_unlimited_v1', 'keeper_unlimited_upgrade_v1')),
  provider_checkout_session_id text not null unique check (char_length(provider_checkout_session_id) between 3 and 255),
  provider_payment_intent_id text unique check (provider_payment_intent_id is null or char_length(provider_payment_intent_id) between 3 and 255),
  provider_customer_id text not null check (char_length(provider_customer_id) between 3 and 255),
  amount_cents integer not null,
  currency text not null check (currency = 'USD'),
  status text not null check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  previous_plan_code text not null check (previous_plan_code in ('free', 'keeper_unlock_v1')),
  resulting_plan_code text not null check (resulting_plan_code in ('keeper_unlock_v1', 'keeper_unlimited_v1')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  constraint keeper_billing_purchase_exact_amount check (
    (product_code = 'keeper_unlock_v1' and amount_cents = 199 and previous_plan_code = 'free' and resulting_plan_code = 'keeper_unlock_v1')
    or (product_code = 'keeper_unlimited_v1' and amount_cents = 499 and previous_plan_code = 'free' and resulting_plan_code = 'keeper_unlimited_v1')
    or (product_code = 'keeper_unlimited_upgrade_v1' and amount_cents = 300 and previous_plan_code = 'keeper_unlock_v1' and resulting_plan_code = 'keeper_unlimited_v1')
  )
);

create index if not exists keeper_billing_purchases_user_created_idx on public.keeper_billing_purchases(user_id, created_at desc);
create index if not exists keeper_billing_purchases_payment_intent_idx on public.keeper_billing_purchases(provider_payment_intent_id) where provider_payment_intent_id is not null;

create table if not exists public.keeper_stripe_webhook_events (
  stripe_event_id text primary key check (char_length(stripe_event_id) between 3 and 255),
  event_type text not null check (char_length(event_type) between 3 and 255),
  livemode boolean not null,
  processing_status text not null default 'processing' check (processing_status in ('processing', 'processed', 'ignored')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  result jsonb not null default '{}'::jsonb check (jsonb_typeof(result) = 'object')
);

alter table public.keeper_billing_customers enable row level security;
alter table public.keeper_billing_purchases enable row level security;
alter table public.keeper_stripe_webhook_events enable row level security;
revoke all on public.keeper_billing_customers, public.keeper_billing_purchases, public.keeper_stripe_webhook_events from public, anon, authenticated;
grant select on public.keeper_billing_purchases to authenticated;

drop policy if exists "Users can read their own Keeper billing purchases" on public.keeper_billing_purchases;
create policy "Users can read their own Keeper billing purchases" on public.keeper_billing_purchases for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.keeper_plan_code_for_user(p_user_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when exists (
      select 1 from public.account_entitlements entitlement
      where entitlement.user_id = p_user_id and entitlement.entitlement_key = 'keeper_unlimited_v1'
        and entitlement.status = 'active' and (entitlement.expires_at is null or entitlement.expires_at > now())
    ) then 'keeper_unlimited_v1'
    when exists (
      select 1 from public.account_entitlements entitlement
      where entitlement.user_id = p_user_id
        and entitlement.entitlement_key in ('keeper_unlock_v1', 'keeper_lifetime', 'project_car', 'collector')
        and entitlement.status = 'active' and (entitlement.expires_at is null or entitlement.expires_at > now())
    ) then 'keeper_unlock_v1'
    else 'free'
  end;
$$;

-- Earlier paid access promised three vehicles and PDF export, which is exactly Keeper Unlock.
insert into public.account_entitlements (user_id, entitlement_key, status, source, expires_at)
select distinct entitlement.user_id, 'keeper_unlock_v1', 'active', 'legacy_migration', null::timestamptz
from public.account_entitlements entitlement
where entitlement.entitlement_key in ('keeper_lifetime', 'project_car', 'collector')
  and entitlement.status = 'active' and (entitlement.expires_at is null or entitlement.expires_at > now())
on conflict (user_id, entitlement_key) do update set status = 'active', expires_at = null, updated_at = now();

create or replace function public.keeper_vehicle_limit_for_user(p_user_id uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select case public.keeper_plan_code_for_user(p_user_id)
    when 'keeper_unlimited_v1' then null
    when 'keeper_unlock_v1' then 3
    else 1
  end;
$$;

create or replace function public.keeper_max_vehicles()
returns integer language sql stable security definer set search_path = '' as $$
  select public.keeper_vehicle_limit_for_user((select auth.uid()));
$$;

create or replace function public.enforce_keeper_vehicle_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare vehicle_limit integer;
begin
  if (select auth.uid()) is not null and new.owner_id <> (select auth.uid()) then
    raise exception 'Vehicle owner does not match the signed-in Keeper account' using errcode = '42501';
  end if;
  vehicle_limit := public.keeper_vehicle_limit_for_user(new.owner_id);
  if vehicle_limit is not null and (select count(*) from public.vehicles vehicle where vehicle.owner_id = new.owner_id) >= vehicle_limit then
    raise exception 'Keeper vehicle slot limit reached' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists vehicles_enforce_keeper_limit on public.vehicles;
create trigger vehicles_enforce_keeper_limit before insert on public.vehicles for each row execute function public.enforce_keeper_vehicle_limit();

create or replace function public.get_keeper_vehicle_pdf_export(p_vehicle_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public.keeper_plan_code_for_user((select auth.uid())) = 'free' then
    raise exception 'Keeper Unlock or Unlimited required for PDF export' using errcode = '42501';
  end if;
  return public.get_keeper_vehicle_export(p_vehicle_id);
end;
$$;

create or replace function public.get_keeper_billing_status()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'plan_code', public.keeper_plan_code_for_user((select auth.uid())),
    'vehicle_limit', public.keeper_vehicle_limit_for_user((select auth.uid())),
    'vehicle_count', (select count(*) from public.vehicles vehicle where vehicle.owner_id = (select auth.uid())),
    'pdf_export_enabled', public.keeper_plan_code_for_user((select auth.uid())) <> 'free',
    'latest_status', (select purchase.status from public.keeper_billing_purchases purchase where purchase.user_id = (select auth.uid()) order by purchase.created_at desc limit 1),
    'latest_product_code', (select purchase.product_code from public.keeper_billing_purchases purchase where purchase.user_id = (select auth.uid()) order by purchase.created_at desc limit 1)
  );
$$;

create or replace function public.get_keeper_checkout_context(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'plan_code', public.keeper_plan_code_for_user(p_user_id),
    'account_active', exists (
      select 1 from public.account_entitlements entitlement
      where entitlement.user_id = p_user_id and entitlement.entitlement_key = 'authenticated_account'
        and entitlement.status = 'active' and (entitlement.expires_at is null or entitlement.expires_at > now())
    ),
    'stripe_customer_id', (select customer.provider_customer_id from public.keeper_billing_customers customer where customer.user_id = p_user_id)
  );
$$;

create or replace function public.register_keeper_checkout(
  p_user_id uuid, p_product_code text, p_checkout_session_id text, p_customer_id text,
  p_amount_cents integer, p_currency text, p_previous_plan_code text, p_resulting_plan_code text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_plan text; recorded public.keeper_billing_purchases%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  if not exists (select 1 from auth.users keeper_user where keeper_user.id = p_user_id) then raise exception 'Keeper account not found' using errcode = '22023'; end if;
  if not exists (
    select 1 from public.account_entitlements entitlement
    where entitlement.user_id = p_user_id and entitlement.entitlement_key = 'authenticated_account'
      and entitlement.status = 'active' and (entitlement.expires_at is null or entitlement.expires_at > now())
  ) then raise exception 'Active Keeper account required' using errcode = '42501'; end if;
  current_plan := public.keeper_plan_code_for_user(p_user_id);
  if current_plan <> p_previous_plan_code then raise exception 'Keeper plan changed before checkout registration' using errcode = '40001'; end if;
  if not ((current_plan = 'free' and p_product_code in ('keeper_unlock_v1', 'keeper_unlimited_v1')) or (current_plan = 'keeper_unlock_v1' and p_product_code = 'keeper_unlimited_upgrade_v1')) then
    raise exception 'Invalid Keeper purchase transition' using errcode = '22023';
  end if;
  insert into public.keeper_billing_customers(user_id, provider_customer_id) values (p_user_id, p_customer_id)
  on conflict (user_id) do update set provider_customer_id = excluded.provider_customer_id, updated_at = now();
  insert into public.keeper_billing_purchases(user_id, product_code, provider_checkout_session_id, provider_customer_id, amount_cents, currency, status, previous_plan_code, resulting_plan_code)
  values (p_user_id, p_product_code, p_checkout_session_id, p_customer_id, p_amount_cents, upper(p_currency), 'pending', p_previous_plan_code, p_resulting_plan_code)
  on conflict (provider_checkout_session_id) do update set updated_at = now()
  returning * into recorded;
  if recorded.user_id <> p_user_id or recorded.product_code <> p_product_code then raise exception 'Checkout session collision' using errcode = '23505'; end if;
  return jsonb_build_object('purchase_id', recorded.id, 'status', recorded.status);
end;
$$;

create or replace function public.process_keeper_stripe_event(
  p_event_id text, p_event_type text, p_livemode boolean, p_action text,
  p_user_id uuid, p_checkout_session_id text, p_payment_intent_id text,
  p_customer_id text, p_product_code text, p_amount_cents integer, p_currency text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare inserted_count integer; purchase public.keeper_billing_purchases%rowtype; next_plan text; event_result jsonb;
begin
  insert into public.keeper_stripe_webhook_events(stripe_event_id, event_type, livemode)
  values (p_event_id, p_event_type, p_livemode) on conflict (stripe_event_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('status', 'duplicate'); end if;

  if p_action = 'ignored' then
    event_result := jsonb_build_object('status', 'ignored');
    update public.keeper_stripe_webhook_events set processing_status = 'ignored', processed_at = now(), result = event_result where stripe_event_id = p_event_id;
    return event_result;
  end if;

  if p_action in ('checkout_failed', 'checkout_cancelled') then
    update public.keeper_billing_purchases set status = case when p_action = 'checkout_cancelled' then 'cancelled' else 'failed' end, updated_at = now()
    where provider_checkout_session_id = p_checkout_session_id and status = 'pending' returning * into purchase;
    event_result := jsonb_build_object('status', 'processed', 'purchase_status', coalesce(purchase.status, 'not_found'));
  elsif p_action = 'checkout_paid' then
    if p_user_id is null or p_checkout_session_id is null or p_payment_intent_id is null or p_customer_id is null or p_product_code is null or p_amount_cents is null or p_currency is null then raise exception 'Paid checkout is missing trusted identifiers' using errcode = '22023'; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
    select * into purchase from public.keeper_billing_purchases where provider_checkout_session_id = p_checkout_session_id for update;
    if not found then raise exception 'Unregistered Keeper checkout session' using errcode = '22023'; end if;
    if purchase.user_id <> p_user_id or purchase.product_code <> p_product_code or purchase.provider_customer_id <> p_customer_id or purchase.amount_cents <> p_amount_cents or purchase.currency <> upper(p_currency) then
      raise exception 'Stripe checkout does not match the registered Keeper purchase' using errcode = '22023';
    end if;
    update public.keeper_billing_purchases set provider_payment_intent_id = p_payment_intent_id, status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now() where id = purchase.id returning * into purchase;
    if purchase.resulting_plan_code = 'keeper_unlock_v1' and public.keeper_plan_code_for_user(p_user_id) <> 'keeper_unlimited_v1' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at) values (p_user_id, 'keeper_unlock_v1', 'active', 'purchase', null)
      on conflict (user_id, entitlement_key) do update set status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    elsif purchase.resulting_plan_code = 'keeper_unlimited_v1' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at) values (p_user_id, 'keeper_unlimited_v1', 'active', 'purchase', null)
      on conflict (user_id, entitlement_key) do update set status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    end if;
    event_result := jsonb_build_object('status', 'processed', 'purchase_status', 'paid', 'plan_code', public.keeper_plan_code_for_user(p_user_id));
  elsif p_action = 'payment_refunded' then
    select * into purchase from public.keeper_billing_purchases where provider_payment_intent_id = p_payment_intent_id for update;
    if not found then
      event_result := jsonb_build_object('status', 'ignored', 'reason', 'not_a_keeper_purchase');
      update public.keeper_stripe_webhook_events set processing_status = 'ignored', processed_at = now(), result = event_result where stripe_event_id = p_event_id;
      return event_result;
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(purchase.user_id::text, 0));
    update public.keeper_billing_purchases set status = 'refunded', refunded_at = coalesce(refunded_at, now()), updated_at = now() where id = purchase.id;
    update public.account_entitlements set status = 'revoked', updated_at = now() where user_id = purchase.user_id and source = 'purchase' and entitlement_key in ('keeper_unlock_v1', 'keeper_unlimited_v1');
    select case
      when exists (select 1 from public.keeper_billing_purchases remaining where remaining.user_id = purchase.user_id and remaining.status = 'paid' and remaining.resulting_plan_code = 'keeper_unlimited_v1') then 'keeper_unlimited_v1'
      when exists (select 1 from public.keeper_billing_purchases remaining where remaining.user_id = purchase.user_id and remaining.status = 'paid' and remaining.resulting_plan_code = 'keeper_unlock_v1') then 'keeper_unlock_v1'
      else 'free' end into next_plan;
    if next_plan <> 'free' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at) values (purchase.user_id, next_plan, 'active', 'purchase', null)
      on conflict (user_id, entitlement_key) do update set status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    end if;
    event_result := jsonb_build_object('status', 'processed', 'purchase_status', 'refunded', 'plan_code', public.keeper_plan_code_for_user(purchase.user_id));
  else raise exception 'Unsupported Keeper Stripe event action' using errcode = '22023';
  end if;
  update public.keeper_stripe_webhook_events set processing_status = 'processed', processed_at = now(), result = event_result where stripe_event_id = p_event_id;
  return event_result;
end;
$$;

revoke all on function public.keeper_plan_code_for_user(uuid), public.keeper_vehicle_limit_for_user(uuid), public.keeper_max_vehicles(), public.enforce_keeper_vehicle_limit(), public.get_keeper_checkout_context(uuid), public.register_keeper_checkout(uuid, text, text, text, integer, text, text, text), public.process_keeper_stripe_event(text, text, boolean, text, uuid, text, text, text, text, integer, text) from public, anon, authenticated;
revoke all on function public.get_keeper_vehicle_pdf_export(uuid), public.get_keeper_billing_status() from public, anon;
grant execute on function public.get_keeper_vehicle_pdf_export(uuid), public.get_keeper_billing_status() to authenticated;
grant execute on function public.keeper_plan_code_for_user(uuid), public.keeper_vehicle_limit_for_user(uuid), public.get_keeper_checkout_context(uuid), public.register_keeper_checkout(uuid, text, text, text, integer, text, text, text), public.process_keeper_stripe_event(text, text, boolean, text, uuid, text, text, text, text, integer, text) to service_role;

-- Existing vehicles are intentionally untouched. Downgrades and refunds only affect future
-- inserts and PDF access; no garage or service record is deleted or hidden.
