-- Fix Keeper launch claims for every verified Keeper account.
--
-- The original launch migration required a linked Google identity even though
-- Keeper also supports verified email/password accounts. That made legitimate
-- accounts appear ineligible and caused real claims to fail before the atomic
-- redemption transaction. This additive migration preserves every existing
-- redemption and counter while making verified account email the stable,
-- privacy-preserving identity used for future claims.

begin;

alter table public.keeper_promotion_redemptions
  drop constraint if exists keeper_promotion_redemptions_auth_provider_check;
alter table public.keeper_promotion_redemptions
  add constraint keeper_promotion_redemptions_auth_provider_check
  check (auth_provider in ('email', 'google'));

-- Keep both definitions correct without reactivating an offer that an operator
-- intentionally paused and without changing any existing redemption count.
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
      keeper_user.email_confirmed_at is not null and keeper_user.email is not null as email_verified,
      exists (
        select 1 from public.account_entitlements entitlement
        where entitlement.user_id = keeper_user.id
          and entitlement.entitlement_key = 'authenticated_account'
          and entitlement.status = 'active'
          and (entitlement.expires_at is null or entitlement.expires_at > now())
      ) as account_active,
      exists (
        select 1 from public.keeper_promotion_redemptions redemption
        where redemption.user_id = keeper_user.id
      ) as already_redeemed,
      public.keeper_plan_code_for_user(keeper_user.id) as plan_code
    from auth.users keeper_user
    where keeper_user.id = (select auth.uid())
  ), offers as (
    select
      promotion.*,
      exists (
        select 1 from public.keeper_promotion_redemptions redemption
        where redemption.promotion_id = promotion.id
          and redemption.user_id = (select auth.uid())
      ) as claimed_by_user,
      case
        when not promotion.active
          or (promotion.starts_at is not null and promotion.starts_at > now())
          or (promotion.ends_at is not null and promotion.ends_at <= now()) then 'unavailable'
        when promotion.redemption_count >= promotion.max_redemptions then 'sold_out'
        when not exists (select 1 from viewer) then 'account_inactive'
        when not coalesce((select viewer.account_active from viewer), false) then 'account_inactive'
        when not coalesce((select viewer.email_verified from viewer), false) then 'email_unverified'
        when coalesce((select viewer.already_redeemed from viewer), false) then 'already_claimed'
        when promotion.entitlement_key = 'keeper_unlock_v1'
          and coalesce((select viewer.plan_code <> 'free' from viewer), true) then 'already_owned'
        when promotion.entitlement_key = 'keeper_unlimited_v1'
          and coalesce((select viewer.plan_code = 'keeper_unlimited_v1' from viewer), true) then 'already_owned'
        else 'available'
      end as claim_status
    from public.keeper_promotions promotion
  )
  select jsonb_build_object(
    'promotions', coalesce(jsonb_agg(jsonb_build_object(
      'promotion_key', offer.promotion_key,
      'plan_code', offer.entitlement_key,
      'max_redemptions', offer.max_redemptions,
      'redemption_count', offer.redemption_count,
      'remaining', greatest(offer.max_redemptions - offer.redemption_count, 0),
      'active', offer.active
        and (offer.starts_at is null or offer.starts_at <= now())
        and (offer.ends_at is null or offer.ends_at > now()),
      'claimed_by_user', offer.claimed_by_user,
      'claim_available', offer.claim_status = 'available',
      'claim_status', offer.claim_status
    ) order by offer.max_redemptions desc), '[]'::jsonb)
  )
  from offers offer;
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
  privacy_identity_hash bytea;
  recorded_provider text;
  promotion public.keeper_promotions%rowtype;
  current_plan text;
  granted_plan text;
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

  -- Email is unique in Keeper authentication and must be confirmed before a
  -- claim. Hashing it prevents storing another plain-text identity copy while
  -- supporting both password and Google sign-in accounts consistently.
  if keeper_user.email is not null then
    privacy_identity_hash := extensions.digest(
      pg_catalog.convert_to('email:' || pg_catalog.lower(pg_catalog.btrim(keeper_user.email)), 'UTF8'),
      'sha256'
    );
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(pg_catalog.encode(privacy_identity_hash, 'hex'), 0)
    );
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_user_id::text, 0));

  select count(*) into recent_attempts
  from public.keeper_promotion_claim_attempts attempt
  where attempt.attempted_at > now() - interval '10 minutes'
    and (attempt.user_id = current_user_id
      or (privacy_identity_hash is not null and attempt.identity_hash = privacy_identity_hash));
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

  if keeper_user.email_confirmed_at is null or keeper_user.email is null then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'email_unverified');
    return jsonb_build_object('status', 'email_unverified', 'message', 'Verify your Keeper account email before claiming launch access.');
  end if;

  recorded_provider := case when exists (
    select 1 from auth.identities identity
    where identity.user_id = current_user_id and identity.provider = 'google'
  ) then 'google' else 'email' end;

  if exists (
    select 1 from public.keeper_promotion_redemptions redemption
    where redemption.user_id = current_user_id
      or redemption.identity_hash = privacy_identity_hash
  ) then
    insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
    values (current_user_id, p_promotion_key, privacy_identity_hash, 'already_claimed');
    return jsonb_build_object('status', 'already_claimed', 'message', 'This verified Keeper account already claimed a launch offer.');
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

  insert into public.keeper_promotion_redemptions(
    promotion_id, user_id, identity_hash, auth_provider, entitlement_key
  ) values (
    promotion.id, current_user_id, privacy_identity_hash, recorded_provider, promotion.entitlement_key
  );

  update public.keeper_promotions
  set redemption_count = redemption_count + 1, updated_at = now()
  where id = promotion.id
  returning max_redemptions - redemption_count into remaining_count;

  insert into public.account_entitlements(user_id, entitlement_key, status, source, expires_at)
  values (current_user_id, promotion.entitlement_key, 'active', 'launch_promo', null::timestamptz)
  on conflict (user_id, entitlement_key) do update set
    status = 'active', source = 'launch_promo', expires_at = null, updated_at = now();

  granted_plan := public.keeper_plan_code_for_user(current_user_id);
  if granted_plan <> promotion.entitlement_key then
    raise exception 'Keeper launch entitlement verification failed' using errcode = 'P0001';
  end if;

  insert into public.keeper_promotion_claim_attempts(user_id, promotion_key, identity_hash, result)
  values (current_user_id, p_promotion_key, privacy_identity_hash, 'claimed');

  return jsonb_build_object(
    'status', 'claimed',
    'promotion_key', promotion.promotion_key,
    'plan_code', granted_plan,
    'vehicle_limit', public.keeper_vehicle_limit_for_user(current_user_id),
    'pdf_export_enabled', true,
    'entitlement_source', 'launch_promo',
    'remaining', remaining_count
  );
end;
$$;

revoke all on function public.get_keeper_launch_promotions() from public, anon;
revoke all on function public.claim_keeper_launch_promotion(text) from public, anon;
grant execute on function public.get_keeper_launch_promotions() to authenticated;
grant execute on function public.claim_keeper_launch_promotion(text) to authenticated;

commit;
