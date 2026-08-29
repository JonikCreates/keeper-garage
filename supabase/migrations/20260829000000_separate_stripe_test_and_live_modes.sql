-- Keeper 1.0 billing-mode separation.
-- Test and live Stripe objects can have overlapping identifiers and each mode
-- requires its own customer, prices, return URL, signature secret, and audit
-- scope. Existing rows are test-mode rows and remain unchanged otherwise.

begin;

alter table public.keeper_billing_customers
  add column if not exists livemode boolean not null default false;
alter table public.keeper_billing_purchases
  add column if not exists livemode boolean not null default false;

alter table public.keeper_billing_customers
  drop constraint if exists keeper_billing_customers_pkey,
  drop constraint if exists keeper_billing_customers_provider_customer_id_key;
alter table public.keeper_billing_customers
  add primary key (user_id, livemode),
  add constraint keeper_billing_customers_mode_customer_unique unique (livemode, provider_customer_id);

alter table public.keeper_billing_purchases
  drop constraint if exists keeper_billing_purchases_provider_checkout_session_id_key,
  drop constraint if exists keeper_billing_purchases_provider_payment_intent_id_key;
create unique index if not exists keeper_billing_purchases_mode_checkout_unique
  on public.keeper_billing_purchases(livemode, provider_checkout_session_id);
create unique index if not exists keeper_billing_purchases_mode_payment_unique
  on public.keeper_billing_purchases(livemode, provider_payment_intent_id)
  where provider_payment_intent_id is not null;

alter table public.keeper_stripe_webhook_events
  drop constraint if exists keeper_stripe_webhook_events_pkey;
alter table public.keeper_stripe_webhook_events
  add primary key (livemode, stripe_event_id);

create or replace function public.get_keeper_checkout_context(p_user_id uuid, p_livemode boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'plan_code', public.keeper_plan_code_for_user(p_user_id),
    'account_active', exists (
      select 1 from public.account_entitlements entitlement
      where entitlement.user_id = p_user_id
        and entitlement.entitlement_key = 'authenticated_account'
        and entitlement.status = 'active'
        and (entitlement.expires_at is null or entitlement.expires_at > now())
    ),
    'stripe_customer_id', (
      select customer.provider_customer_id
      from public.keeper_billing_customers customer
      where customer.user_id = p_user_id and customer.livemode = p_livemode
    )
  );
$$;

create or replace function public.register_keeper_checkout(
  p_user_id uuid, p_livemode boolean, p_product_code text,
  p_checkout_session_id text, p_customer_id text, p_amount_cents integer,
  p_currency text, p_previous_plan_code text, p_resulting_plan_code text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  current_plan text;
  recorded public.keeper_billing_purchases%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  if not exists (select 1 from auth.users keeper_user where keeper_user.id = p_user_id) then
    raise exception 'Keeper account not found' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.account_entitlements entitlement
    where entitlement.user_id = p_user_id
      and entitlement.entitlement_key = 'authenticated_account'
      and entitlement.status = 'active'
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  ) then raise exception 'Active Keeper account required' using errcode = '42501'; end if;

  current_plan := public.keeper_plan_code_for_user(p_user_id);
  if current_plan <> p_previous_plan_code then
    raise exception 'Keeper plan changed before checkout registration' using errcode = '40001';
  end if;
  if not (
    (current_plan = 'free' and p_product_code in ('keeper_unlock_v1', 'keeper_unlimited_v1'))
    or (current_plan = 'keeper_unlock_v1' and p_product_code = 'keeper_unlimited_v1')
  ) then raise exception 'Invalid Keeper purchase transition' using errcode = '22023'; end if;

  insert into public.keeper_billing_customers(user_id, livemode, provider_customer_id)
  values (p_user_id, p_livemode, p_customer_id)
  on conflict (user_id, livemode) do update set
    provider_customer_id = excluded.provider_customer_id, updated_at = now();

  insert into public.keeper_billing_purchases(
    user_id, livemode, product_code, provider_checkout_session_id,
    provider_customer_id, amount_cents, currency, status,
    previous_plan_code, resulting_plan_code
  ) values (
    p_user_id, p_livemode, p_product_code, p_checkout_session_id,
    p_customer_id, p_amount_cents, upper(p_currency), 'pending',
    p_previous_plan_code, p_resulting_plan_code
  )
  on conflict (livemode, provider_checkout_session_id) do update set updated_at = now()
  returning * into recorded;

  if recorded.user_id <> p_user_id
    or recorded.livemode <> p_livemode
    or recorded.product_code <> p_product_code then
    raise exception 'Checkout session collision' using errcode = '23505';
  end if;
  return jsonb_build_object('purchase_id', recorded.id, 'status', recorded.status, 'livemode', recorded.livemode);
end;
$$;

create or replace function public.process_keeper_stripe_event(
  p_event_id text, p_event_type text, p_livemode boolean, p_action text,
  p_user_id uuid, p_checkout_session_id text, p_payment_intent_id text,
  p_customer_id text, p_product_code text, p_amount_cents integer, p_currency text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  inserted_count integer;
  purchase public.keeper_billing_purchases%rowtype;
  next_plan text;
  event_result jsonb;
begin
  insert into public.keeper_stripe_webhook_events(stripe_event_id, event_type, livemode)
  values (p_event_id, p_event_type, p_livemode)
  on conflict (livemode, stripe_event_id) do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return jsonb_build_object('status', 'duplicate'); end if;

  if p_action = 'ignored' then
    event_result := jsonb_build_object('status', 'ignored');
    update public.keeper_stripe_webhook_events
    set processing_status = 'ignored', processed_at = now(), result = event_result
    where livemode = p_livemode and stripe_event_id = p_event_id;
    return event_result;
  end if;

  if p_action in ('checkout_failed', 'checkout_cancelled') then
    update public.keeper_billing_purchases
    set status = case when p_action = 'checkout_cancelled' then 'cancelled' else 'failed' end,
        updated_at = now()
    where livemode = p_livemode
      and provider_checkout_session_id = p_checkout_session_id
      and status = 'pending'
    returning * into purchase;
    event_result := jsonb_build_object('status', 'processed', 'purchase_status', coalesce(purchase.status, 'not_found'));
  elsif p_action = 'checkout_paid' then
    if p_user_id is null or p_checkout_session_id is null or p_payment_intent_id is null
      or p_customer_id is null or p_product_code is null or p_amount_cents is null or p_currency is null then
      raise exception 'Paid checkout is missing trusted identifiers' using errcode = '22023';
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
    select * into purchase
    from public.keeper_billing_purchases
    where livemode = p_livemode and provider_checkout_session_id = p_checkout_session_id
    for update;
    if not found then raise exception 'Unregistered Keeper checkout session' using errcode = '22023'; end if;
    if purchase.user_id <> p_user_id
      or purchase.product_code <> p_product_code
      or purchase.provider_customer_id <> p_customer_id
      or purchase.amount_cents <> p_amount_cents
      or purchase.currency <> upper(p_currency) then
      raise exception 'Stripe checkout does not match the registered Keeper purchase' using errcode = '22023';
    end if;

    update public.keeper_billing_purchases
    set provider_payment_intent_id = p_payment_intent_id,
        status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now()
    where id = purchase.id returning * into purchase;

    if purchase.resulting_plan_code = 'keeper_unlock_v1'
      and public.keeper_plan_code_for_user(p_user_id) <> 'keeper_unlimited_v1' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
      values (p_user_id, 'keeper_unlock_v1', 'active', 'purchase', null::timestamptz)
      on conflict (user_id, entitlement_key) do update set
        status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    elsif purchase.resulting_plan_code = 'keeper_unlimited_v1' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
      values (p_user_id, 'keeper_unlimited_v1', 'active', 'purchase', null::timestamptz)
      on conflict (user_id, entitlement_key) do update set
        status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    end if;
    event_result := jsonb_build_object(
      'status', 'processed', 'purchase_status', 'paid',
      'plan_code', public.keeper_plan_code_for_user(p_user_id), 'livemode', p_livemode
    );
  elsif p_action = 'payment_refunded' then
    select * into purchase
    from public.keeper_billing_purchases
    where livemode = p_livemode and provider_payment_intent_id = p_payment_intent_id
    for update;
    if not found then
      event_result := jsonb_build_object('status', 'ignored', 'reason', 'not_a_keeper_purchase');
      update public.keeper_stripe_webhook_events
      set processing_status = 'ignored', processed_at = now(), result = event_result
      where livemode = p_livemode and stripe_event_id = p_event_id;
      return event_result;
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(purchase.user_id::text, 0));
    update public.keeper_billing_purchases
    set status = 'refunded', refunded_at = coalesce(refunded_at, now()), updated_at = now()
    where id = purchase.id;
    update public.account_entitlements set status = 'revoked', updated_at = now()
    where user_id = purchase.user_id and source = 'purchase'
      and entitlement_key in ('keeper_unlock_v1', 'keeper_unlimited_v1');
    select case
      when exists (
        select 1 from public.keeper_billing_purchases remaining
        where remaining.user_id = purchase.user_id and remaining.livemode = p_livemode
          and remaining.status = 'paid'
          and remaining.resulting_plan_code = 'keeper_unlimited_v1'
      ) then 'keeper_unlimited_v1'
      when exists (
        select 1 from public.keeper_billing_purchases remaining
        where remaining.user_id = purchase.user_id and remaining.livemode = p_livemode
          and remaining.status = 'paid'
          and remaining.resulting_plan_code = 'keeper_unlock_v1'
      ) then 'keeper_unlock_v1'
      else 'free' end into next_plan;
    if next_plan <> 'free' then
      insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
      values (purchase.user_id, next_plan, 'active', 'purchase', null::timestamptz)
      on conflict (user_id, entitlement_key) do update set
        status = 'active', source = 'purchase', expires_at = null, updated_at = now();
    end if;
    event_result := jsonb_build_object(
      'status', 'processed', 'purchase_status', 'refunded',
      'plan_code', public.keeper_plan_code_for_user(purchase.user_id), 'livemode', p_livemode
    );
  else
    raise exception 'Unsupported Keeper Stripe event action' using errcode = '22023';
  end if;

  update public.keeper_stripe_webhook_events
  set processing_status = 'processed', processed_at = now(), result = event_result
  where livemode = p_livemode and stripe_event_id = p_event_id;
  return event_result;
end;
$$;

revoke all on function public.get_keeper_checkout_context(uuid, boolean) from public, anon, authenticated;
revoke all on function public.register_keeper_checkout(uuid, boolean, text, text, text, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.process_keeper_stripe_event(text, text, boolean, text, uuid, text, text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.get_keeper_checkout_context(uuid, boolean) to service_role;
grant execute on function public.register_keeper_checkout(uuid, boolean, text, text, text, integer, text, text, text) to service_role;
grant execute on function public.process_keeper_stripe_event(text, text, boolean, text, uuid, text, text, text, text, integer, text) to service_role;

-- Remove the obsolete mode-agnostic overloads so only the explicit test/live
-- interfaces remain available to the billing service.
drop function if exists public.get_keeper_checkout_context(uuid);
drop function if exists public.register_keeper_checkout(uuid, text, text, text, integer, text, text, text);

commit;
