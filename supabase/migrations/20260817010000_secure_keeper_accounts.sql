create table if not exists public.legal_documents (
  document_type text not null check (document_type in ('terms', 'privacy')),
  version text not null check (char_length(version) between 1 and 80),
  status text not null default 'draft' check (status in ('draft', 'active', 'retired')),
  effective_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (document_type, version)
);

create unique index if not exists legal_documents_one_active_version
  on public.legal_documents(document_type)
  where status = 'active';

insert into public.legal_documents (document_type, version, status, effective_at)
values
  ('terms', '2026-08-16-prelaunch', 'active', now()),
  ('privacy', '2026-08-16-prelaunch', 'active', now())
on conflict (document_type, version) do nothing;

create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  acceptance_source text not null default 'web' check (acceptance_source in ('web', 'legacy_upgrade')),
  unique (user_id, terms_version, privacy_version)
);

create table if not exists public.account_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key text not null check (char_length(entitlement_key) between 1 and 80),
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  source text not null default 'account' check (source in ('account', 'subscription', 'support')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, entitlement_key)
);

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'cancelled', 'completed')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('account_activated', 'legacy_upgrade', 'login', 'logout', 'password_reset_requested', 'export_generated', 'account_deletion_requested')),
  metadata jsonb not null default '{}'::jsonb check (octet_length(metadata::text) <= 2048),
  occurred_at timestamptz not null default now()
);

create index if not exists security_events_user_time_idx
  on public.security_events(user_id, occurred_at desc);

alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.account_entitlements enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.security_events enable row level security;

revoke all on public.legal_acceptances, public.account_entitlements, public.account_deletion_requests, public.security_events from anon;
revoke all on public.legal_acceptances, public.account_entitlements, public.account_deletion_requests, public.security_events from authenticated;
grant select on public.legal_documents to anon, authenticated;
grant select on public.legal_acceptances, public.account_entitlements, public.account_deletion_requests to authenticated;

drop policy if exists "Anyone can read active legal documents" on public.legal_documents;
create policy "Anyone can read active legal documents"
  on public.legal_documents for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "Users can read their own legal acceptances" on public.legal_acceptances;
create policy "Users can read their own legal acceptances"
  on public.legal_acceptances for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own entitlements" on public.account_entitlements;
create policy "Users can read their own entitlements"
  on public.account_entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own deletion request" on public.account_deletion_requests;
create policy "Users can read their own deletion request"
  on public.account_deletion_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.keeper_is_permanent_user()
returns boolean
language sql
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, true) is false;
$$;

create or replace function public.has_keeper_entitlement(requested_entitlement text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.keeper_is_permanent_user()
    and exists (
      select 1
      from public.account_entitlements entitlement
      where entitlement.user_id = (select auth.uid())
        and entitlement.entitlement_key = requested_entitlement
        and entitlement.status = 'active'
        and (entitlement.expires_at is null or entitlement.expires_at > now())
    )
    and (
      requested_entitlement <> 'authenticated_account'
      or exists (
        select 1
        from public.legal_acceptances acceptance
        where acceptance.user_id = (select auth.uid())
          and exists (
            select 1 from public.legal_documents document
            where document.document_type = 'terms'
              and document.status = 'active'
              and document.version = acceptance.terms_version
          )
          and exists (
            select 1 from public.legal_documents document
            where document.document_type = 'privacy'
              and document.status = 'active'
              and document.version = acceptance.privacy_version
          )
      )
    );
$$;

revoke all on function public.keeper_is_permanent_user() from public;
revoke all on function public.has_keeper_entitlement(text) from public;
grant execute on function public.keeper_is_permanent_user() to authenticated;
grant execute on function public.has_keeper_entitlement(text) to authenticated;

create or replace function public.accept_keeper_legal(p_terms_version text, p_privacy_version text, p_source text default 'web')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.keeper_is_permanent_user() then
    raise exception 'A permanent Keeper account is required' using errcode = '42501';
  end if;

  if p_source not in ('web', 'legacy_upgrade') then
    raise exception 'Invalid acceptance source' using errcode = '22023';
  end if;

  if not exists (select 1 from public.legal_documents where document_type = 'terms' and version = p_terms_version and status = 'active')
    or not exists (select 1 from public.legal_documents where document_type = 'privacy' and version = p_privacy_version and status = 'active') then
    raise exception 'The legal document version is no longer current' using errcode = '22023';
  end if;

  insert into public.legal_acceptances (user_id, terms_version, privacy_version, acceptance_source)
  values ((select auth.uid()), p_terms_version, p_privacy_version, p_source)
  on conflict (user_id, terms_version, privacy_version) do nothing;

  insert into public.account_entitlements (user_id, entitlement_key, status, source)
  values ((select auth.uid()), 'authenticated_account', 'active', 'account')
  on conflict (user_id, entitlement_key) do update
    set status = 'active', source = 'account', expires_at = null, updated_at = now();

  insert into public.security_events (user_id, event_type, metadata)
  values ((select auth.uid()), case when p_source = 'legacy_upgrade' then 'legacy_upgrade' else 'account_activated' end, jsonb_build_object('terms_version', p_terms_version, 'privacy_version', p_privacy_version));

  return jsonb_build_object('entitlement', 'authenticated_account', 'active', true);
end;
$$;

create or replace function public.get_keeper_account_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'permanent_identity', public.keeper_is_permanent_user(),
    'entitlements', coalesce((
      select jsonb_agg(entitlement.entitlement_key order by entitlement.entitlement_key)
      from public.account_entitlements entitlement
      where entitlement.user_id = (select auth.uid())
        and public.has_keeper_entitlement(entitlement.entitlement_key)
    ), '[]'::jsonb)
  );
$$;

create or replace function public.request_keeper_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_keeper_entitlement('authenticated_account') then
    raise exception 'A Keeper account is required' using errcode = '42501';
  end if;

  insert into public.account_deletion_requests (user_id, status, requested_at, updated_at)
  values ((select auth.uid()), 'pending', now(), now())
  on conflict (user_id) do update
    set status = 'pending', requested_at = now(), updated_at = now();

  insert into public.security_events (user_id, event_type)
  values ((select auth.uid()), 'account_deletion_requested');

  return jsonb_build_object('status', 'pending');
end;
$$;

create or replace function public.get_keeper_vehicle_export(p_vehicle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_vehicle public.vehicles%rowtype;
  completed_records jsonb;
begin
  if not public.has_keeper_entitlement('authenticated_account') then
    raise exception 'A Keeper account is required' using errcode = '42501';
  end if;

  select * into owned_vehicle
  from public.vehicles vehicle
  where vehicle.id = p_vehicle_id
    and vehicle.owner_id = (select auth.uid());

  if not found then
    raise exception 'Vehicle not found' using errcode = '42501';
  end if;

  if (select count(*) from public.security_events event where event.user_id = (select auth.uid()) and event.event_type = 'export_generated' and event.occurred_at > now() - interval '1 hour') >= 20 then
    raise exception 'Export limit reached. Try again later.' using errcode = '42900';
  end if;

  select coalesce(jsonb_agg(to_jsonb(record) order by record.completed_at desc, record.created_at desc), '[]'::jsonb)
  into completed_records
  from public.maintenance_records record
  where record.owner_id = (select auth.uid())
    and record.vehicle_id = p_vehicle_id;

  insert into public.security_events (user_id, event_type, metadata)
  values ((select auth.uid()), 'export_generated', jsonb_build_object('vehicle_id', p_vehicle_id));

  return jsonb_build_object('vehicle', to_jsonb(owned_vehicle), 'records', completed_records);
end;
$$;

revoke all on function public.accept_keeper_legal(text, text, text) from public;
revoke all on function public.get_keeper_account_state() from public;
revoke all on function public.request_keeper_account_deletion() from public;
revoke all on function public.get_keeper_vehicle_export(uuid) from public;
grant execute on function public.accept_keeper_legal(text, text, text) to authenticated;
grant execute on function public.get_keeper_account_state() to authenticated;
grant execute on function public.request_keeper_account_deletion() to authenticated;
grant execute on function public.get_keeper_vehicle_export(uuid) to authenticated;

drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Keeper accounts can create their own profile" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and public.has_keeper_entitlement('authenticated_account'));
create policy "Keeper accounts can update their own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id and public.has_keeper_entitlement('authenticated_account'))
  with check ((select auth.uid()) = user_id and public.has_keeper_entitlement('authenticated_account'));

drop policy if exists "Users can create their own vehicles" on public.vehicles;
drop policy if exists "Users can update their own vehicles" on public.vehicles;
drop policy if exists "Users can delete their own vehicles" on public.vehicles;
create policy "Keeper accounts can create their own vehicles" on public.vehicles for insert to authenticated
  with check ((select auth.uid()) = owner_id and public.has_keeper_entitlement('authenticated_account'));
create policy "Keeper accounts can update their own vehicles" on public.vehicles for update to authenticated
  using ((select auth.uid()) = owner_id and public.has_keeper_entitlement('authenticated_account'))
  with check ((select auth.uid()) = owner_id and public.has_keeper_entitlement('authenticated_account'));
create policy "Keeper accounts can delete their own vehicles" on public.vehicles for delete to authenticated
  using ((select auth.uid()) = owner_id and public.has_keeper_entitlement('authenticated_account'));

drop policy if exists "Users can create their own maintenance records" on public.maintenance_records;
drop policy if exists "Users can delete their own maintenance records" on public.maintenance_records;
create policy "Keeper accounts can create their own maintenance records" on public.maintenance_records for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles vehicle where vehicle.id = maintenance_records.vehicle_id and vehicle.owner_id = (select auth.uid()))
  );
create policy "Keeper accounts can delete their own maintenance records" on public.maintenance_records for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles vehicle where vehicle.id = maintenance_records.vehicle_id and vehicle.owner_id = (select auth.uid()))
  );

drop policy if exists "Users can create their own vehicle maintenance items" on public.vehicle_maintenance_items;
drop policy if exists "Users can remove their own vehicle maintenance items" on public.vehicle_maintenance_items;
create policy "Keeper accounts can create their own vehicle maintenance items" on public.vehicle_maintenance_items for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles vehicle where vehicle.id = vehicle_maintenance_items.vehicle_id and vehicle.owner_id = (select auth.uid()))
  );
create policy "Keeper accounts can remove their own vehicle maintenance items" on public.vehicle_maintenance_items for delete to authenticated
  using (
    (select auth.uid()) = owner_id
    and public.has_keeper_entitlement('authenticated_account')
    and exists (select 1 from public.vehicles vehicle where vehicle.id = vehicle_maintenance_items.vehicle_id and vehicle.owner_id = (select auth.uid()))
  );

revoke all on public.profiles, public.vehicles, public.maintenance_records, public.vehicle_maintenance_items from anon;

-- REVIEW DECISION: legacy anonymous owners retain read-only access to their existing rows so identity linking can preserve the same user ID; every write requires the server-controlled authenticated_account entitlement.
