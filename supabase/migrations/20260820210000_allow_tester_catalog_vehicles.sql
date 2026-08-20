-- Temporary Keeper tester-mode migration.
-- Keep owner-only RLS intact, but remove the stale vehicle fitment allow-list
-- so newly added catalog vehicles can be saved during public testing.
--
-- IMPORTANT: Reintroduce a generated/catalog-backed validation strategy
-- before relying on this constraint for production billing/entitlement logic.

alter table public.vehicles
  drop constraint if exists vehicles_supported_fitment,
  drop constraint if exists vehicles_supported_bmw_fitment,
  drop constraint if exists vehicles_brand_check;
