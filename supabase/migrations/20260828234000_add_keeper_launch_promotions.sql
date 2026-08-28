-- Keeper launch promotions and final public pricing names.
-- Additive and rerunnable: existing vehicles, service records, paid access, and
-- Stripe audit rows remain intact. Internal v1 entitlement keys are retained so
-- already-issued Keeper Unlock/Unlimited access continues to work while the UI
-- presents the final Keeper Upgrade/Infinite names.

create extension if not exists pgcrypto with schema extensions;

alter table public.account_entitlements
  drop constraint if exists account_entitlements_source_check;
alter table public.account_entitlements
  add constraint account_entitlements_source_check
  check (source in ('account', 'subscription', 'support', 'purchase', 'legacy_migration', 'launch_promo'));

alter table public.account_entitlements
  drop constraint if exists account_entitlements_status_check;
alter table public.account_entitlements
  add constraint account_entitlements_status_check
  check (status in ('active', 'inactive', 'expired', 'revoked'));

-- Keeper Infinite is the same $4.99 product whether the account is Free or
-- Upgrade. The retired $3 difference checkout remains valid only for already
-- registered sessions and historical audit rows.
alter table public.keeper_billing_purchases
  drop constraint if exists keeper_billing_purchase_exact_amount;
alter table public.keeper_billing_purchases
  add constraint keeper_billing_purchase_exact_amount check (
    (product_code = 'keeper_unlock_v1' and amount_cents = 199 and previous_plan_code = 'free' and resulting_plan_code = 'keeper_unlock_v1')
    or (product_code = 'keeper_unlimited_v1' and amount_cents = 499 and previous_plan_code in ('free', 'keeper_unlock_v1') and resulting_plan_code = 'keeper_unlimited_v1')
    or (product_code = 'keeper_unlimited_upgrade_v1' and amount_cents = 300 and previous_plan_code = 'keeper_unlock_v1' and resulting_plan_code = 'keeper_unlimited_v1')
  );

create table if not exists public.keeper_promotions (
  id uuid primary key default gen_random_uuid(),
  promotion_key text not null unique check (char_length(promotion_key) between 3 and 80),
  entitlement_key text not null check (entitlement_key in ('keeper_unlock_v1', 'keeper_unlimited_v1')),
  max_redemptions integer not null check (max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0 and redemption_count <= max_redemptions),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.keeper_promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.keeper_promotions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  identity_hash bytea not null,
  auth_provider text not null check (auth_provider = 'google'),
  entitlement_key text not null check (entitlement_key in ('keeper_unlock_v1', 'keeper_unlimited_v1')),
  redeemed_at timestamptz not null default now(),
  unique (promotion_id, user_id),
  unique (user_id),
  unique (identity_hash)
);

create table if not exists public.keeper_promotion_claim_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  promotion_key text not null check (char_length(promotion_key) between 3 and 80),
  identity_hash bytea,
  result text not null check (result in ('claimed', 'invalid', 'account_inactive', 'email_unverified', 'provider_required', 'already_claimed', 'already_owned', 'ineligible_plan', 'unavailable', 'sold_out', 'rate_limited')),
  attempted_at timestamptz not null default now()
);

create index if not exists keeper_promotion_attempts_user_time_idx
  on public.keeper_promotion_claim_attempts(user_id, attempted_at desc);
create index if not exists keeper_promotion_attempts_identity_time_idx
  on public.keeper_promotion_claim_attempts(identity_hash, attempted_at desc)
  where identity_hash is not null;

alter table public.keeper_promotions enable row level security;
alter table public.keeper_promotion_redemptions enable row level security;
alter table public.keeper_promotion_claim_attempts enable row level security;
revoke all on public.keeper_promotions, public.keeper_promotion_redemptions, public.keeper_promotion_claim_attempts from public, anon, authenticated;

insert into public.keeper_promotions(promotion_key, entitlement_key, max_redemptions, active)
values
  ('launch_upgrade_50', 'keeper_unlock_v1', 50, true),
  ('launch_infinite_10', 'keeper_unlimited_v1', 10, true)
on conflict (promotion_key) do update set
  entitlement_key = excluded.entitlement_key,
  max_redemptions = excluded.max_redemptions,
  updated_at = now();

create or replace function public.get_keeper_launch_promotions()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select
      keeper_user.id,
      keeper_user.email_confirmed_at is not null as email_verified,
      exists (
        select 1 from auth.identities identity
        where identity.user_id = keeper_user.id and identity.provider = 'google'
      ) as has_google_identity,
      exists (
        select 1 from public.account_entitlements entitlement
        where entitlement.user_id = keeper_user.id
          and entitlement.entitlement_key = 'authenticated_account'
          and entitlement.status = 'active'
          and (entitlement.expires_at is null or entitlement.expires_at > now())
      ) as account_active,
      public.keeper_plan_code_for_user(keeper_user.id) as plan_code
    from auth.users keeper_user
    where keeper_user.id = (select auth.uid())
  )
  select jsonb_build_object(
    'promotions', coalesce(jsonb_agg(jsonb_build_object(
      'promotion_key', promotion.promotion_key,
      'plan_code', promotion.entitlement_key,
      'max_redemptions', promotion.max_redemptions,
      'redemption_count', promotion.redemption_count,
      'remaining', greatest(promotion.max_redemptions - promotion.redemption_count, 0),
      'active', promotion.active
        and (promotion.starts_at is null or promotion.starts_at <= now())
        and (promotion.ends_at is null or promotion.ends_at > now()),
      'claimed_by_user', exists (
        select 1 from public.keeper_promotion_redemptions redemption
        where redemption.promotion_id = promotion.id and redemption.user_id = (select auth.uid())
      ),
      'claim_available', promotion.active
        and promotion.redemption_count < promotion.max_redemptions
        and (promotion.starts_at is null or promotion.starts_at <= now())
        and (promotion.ends_at is null or promotion.ends_at > now())
        and coalesce((select viewer.account_active and viewer.email_verified and viewer.has_google_identity from viewer), false)
        and not exists (
          select 1 from public.keeper_promotion_redemptions redemption
          where redemption.user_id = (select auth.uid())
        )
        and case promotion.entitlement_key
          when 'keeper_unlock_v1' then coalesce((select viewer.plan_code = 'free' from viewer), false)
          when 'keeper_unlimited_v1' then coalesce((select viewer.plan_code <> 'keeper_unlimited_v1' from viewer), false)
          else false
        end
    ) order by promotion.max_redemptions desc), '[]'::jsonb)
  )
  from public.keeper_promotions promotion;
$$;

create or replace function public.claim_keeper_launch_promotion(p_promotion_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  keeper_user auth.users%rowtype;
  google_provider_id text;
  privacy_identity_hash bytea;
  promotion public.keeper_promotions%rowtype;
  current_plan text;
  recent_attempts integer;
  remaining_count integer;
begin
  if current_user_id is null then
    return jsonb_build_object('status', 'account_inactive', 'message', 'A signed-in Keeper account is required.');
  end if;

  select * into keeper_user from auth.users where id = current_user_id;
  if not found then
    return jsonb_build_object('status', 'account_inactive', 'message', 'Keeper account not found.');
  end if;

  select identity.provider_id into google_provider_id
  from auth.identities identity
  where identity.user_id = current_user_id and identity.provider = 'google'
  order by identity.created_at
  limit 1;

  if google_provider_id is not null then
    privacy_identity_hash := extensions.digest(pg_catalog.convert_to('google:' || google_provider_id, 'UTF8'), 'sha256');
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(pg_catalog.encode(privacy_identity_hash, 'hex'), 0));
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_user_id::text, 0));

  select count(*) into recent_attempts
  from public.keeper_promotion_claim_attempts attempt
  where attempt.attempted_at > now() - interval '10 minutes'
    and (attempt.user_id = current_user_id or (privacy_identity_hash is not null and attempt.identity_hash = privacy_identity_hash));
  if recent_attempts >= 5 then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, left(coalesce(p_promotion_key, 'invalid'), 80), privacy_identity_hash, 'rate_limited');
    return jsonb_build_object('status', 'rate_limited', 'message', 'Too many launch claim attempts. Try again later.');
  end if;

  select * into promotion
  from public.keeper_promotions candidate
  where candidate.promotion_key = p_promotion_key
  for update;
  if not found then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, left(coalesce(p_promotion_key, 'invalid'), 80), privacy_identity_hash, 'invalid');
    return jsonb_build_object('status', 'invalid', 'message', 'Unknown Keeper launch offer.');
  end if;

  if not exists (
    select 1 from public.account_entitlements entitlement
    where entitlement.user_id = current_user_id
      and entitlement.entitlement_key = 'authenticated_account'
      and entitlement.status = 'active'
      and (entitlement.expires_at is null or entitlement.expires_at > now())
  ) then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'account_inactive');
    return jsonb_build_object('status', 'account_inactive', 'message', 'Finish setting up this Keeper Profile first.');
  end if;

  if keeper_user.email_confirmed_at is null then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'email_unverified');
    return jsonb_build_object('status', 'email_unverified', 'message', 'A verified email is required for launch access.');
  end if;

  if google_provider_id is null then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, null, 'provider_required');
    return jsonb_build_object('status', 'provider_required', 'message', 'Connect a verified Google identity to claim launch access.');
  end if;

  if exists (
    select 1 from public.keeper_promotion_redemptions redemption
    where redemption.user_id = current_user_id or redemption.identity_hash = privacy_identity_hash
  ) then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'already_claimed');
    return jsonb_build_object('status', 'already_claimed', 'message', 'This verified identity already claimed a Keeper launch offer.');
  end if;

  current_plan := public.keeper_plan_code_for_user(current_user_id);
  if current_plan = 'keeper_unlimited_v1'
    or (promotion.entitlement_key = 'keeper_unlock_v1' and current_plan <> 'free') then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'already_owned');
    return jsonb_build_object('status', 'already_owned', 'plan_code', current_plan, 'message', 'This account already has the same or higher Keeper access.');
  end if;

  if not promotion.active
    or (promotion.starts_at is not null and promotion.starts_at > now())
    or (promotion.ends_at is not null and promotion.ends_at <= now()) then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'unavailable');
    return jsonb_build_object('status', 'unavailable', 'message', 'This Keeper launch offer is not active.');
  end if;

  if promotion.redemption_count >= promotion.max_redemptions then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'sold_out');
    return jsonb_build_object('status', 'sold_out', 'message', 'All free launch spots have been claimed.');
  end if;

  insert into public.keeper_promotion_redemptions(promotion_id, user_id, identity_hash, auth_provider, entitlement_key)
  values (promotion.id, current_user_id, privacy_identity_hash, 'google', promotion.entitlement_key);

  update public.keeper_promotions
  set redemption_count = redemption_count + 1, updated_at = now()
  where id = promotion.id
  returning max_redemptions - redemption_count into remaining_count;

  insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
  values (current_user_id, promotion.entitlement_key, 'active', 'launch_promo', null)
  on conflict (user_id, entitlement_key) do update set
    status = 'active', source = 'launch_promo', expires_at = null, updated_at = now();

  insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
  values (current_user_id, p_promotion_key, privacy_identity_hash, 'claimed');

  return jsonb_build_object(
    'status', 'claimed',
    'promotion_key', promotion.promotion_key,
    'plan_code', public.keeper_plan_code_for_user(current_user_id),
    'remaining', remaining_count
  );
end;
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
  if not ((current_plan = 'free' and p_product_code in ('keeper_unlock_v1', 'keeper_unlimited_v1')) or (current_plan = 'keeper_unlock_v1' and p_product_code = 'keeper_unlimited_v1')) then
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

create or replace function public.get_keeper_billing_status()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'plan_code', public.keeper_plan_code_for_user((select auth.uid())),
    'vehicle_limit', public.keeper_vehicle_limit_for_user((select auth.uid())),
    'vehicle_count', (select count(*) from public.vehicles vehicle where vehicle.owner_id = (select auth.uid())),
    'pdf_export_enabled', public.keeper_plan_code_for_user((select auth.uid())) <> 'free',
    'latest_status', (select purchase.status from public.keeper_billing_purchases purchase where purchase.user_id = (select auth.uid()) order by purchase.created_at desc limit 1),
    'latest_product_code', (select purchase.product_code from public.keeper_billing_purchases purchase where purchase.user_id = (select auth.uid()) order by purchase.created_at desc limit 1),
    'entitlement_source', (
      select entitlement.source from public.account_entitlements entitlement
      where entitlement.user_id = (select auth.uid())
        and entitlement.entitlement_key = public.keeper_plan_code_for_user((select auth.uid()))
        and entitlement.status = 'active'
      limit 1
    ),
    'promotion_key', (
      select promotion.promotion_key
      from public.keeper_promotion_redemptions redemption
      join public.keeper_promotions promotion on promotion.id = redemption.promotion_id
      where redemption.user_id = (select auth.uid())
      limit 1
    )
  );
$$;

create or replace function public.get_keeper_vehicle_pdf_export(p_vehicle_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public.keeper_plan_code_for_user((select auth.uid())) = 'free' then
    raise exception 'Keeper Upgrade or Infinite required for PDF export' using errcode = '42501';
  end if;
  return public.get_keeper_vehicle_export(p_vehicle_id);
end;
$$;

revoke all on function public.get_keeper_launch_promotions() from public, anon;
revoke all on function public.claim_keeper_launch_promotion(text) from public, anon;
grant execute on function public.get_keeper_launch_promotions() to authenticated;
grant execute on function public.claim_keeper_launch_promotion(text) to authenticated;

revoke all on function public.register_keeper_checkout(uuid, text, text, text, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.register_keeper_checkout(uuid, text, text, text, integer, text, text, text) to service_role;

revoke all on function public.get_keeper_billing_status() from public, anon;
grant execute on function public.get_keeper_billing_status() to authenticated;
revoke all on function public.get_keeper_vehicle_pdf_export(uuid) from public, anon;
grant execute on function public.get_keeper_vehicle_pdf_export(uuid) to authenticated;

-- Operational controls (service role / dashboard only):
-- update public.keeper_promotions set active = false where promotion_key = 'launch_infinite_10';
-- update public.keeper_promotions set active = false where promotion_key = 'launch_upgrade_50';
