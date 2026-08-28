import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../supabase/migrations/20260828234000_add_keeper_launch_promotions.sql", import.meta.url);
const fixMigrationUrl = new URL("../supabase/migrations/20260828235500_fix_keeper_launch_promotion_claims.sql", import.meta.url);

test("Infinite and Upgrade use independent 10 and 50 redemption pools", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /launch_infinite_10[\s\S]*10, true/i);
  assert.match(sql, /launch_upgrade_50[\s\S]*50, true/i);
  assert.doesNotMatch(sql, /max_redemptions[^;]*60/i);
  assert.match(sql, /where candidate\.promotion_key = p_promotion_key[\s\S]*for update/i);
});

test("the final promotion slot cannot be awarded twice", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  const lock = sql.indexOf("for update;");
  const capacity = sql.indexOf("promotion.redemption_count >= promotion.max_redemptions");
  const redemption = sql.indexOf("insert into public.keeper_promotion_redemptions", capacity);
  const increment = sql.indexOf("redemption_count = redemption_count + 1", redemption);
  assert.ok(lock >= 0 && lock < capacity && capacity < redemption && redemption < increment);
  assert.match(sql, /check \(redemption_count >= 0 and redemption_count <= max_redemptions\)/i);
});

test("one verified Keeper identity can claim only one launch promotion", async () => {
  const sql = await readFile(fixMigrationUrl, "utf8");
  assert.match(sql, /email_confirmed_at is null or keeper_user\.email is null/i);
  assert.match(sql, /'email:' \|\| pg_catalog\.lower/i);
  assert.match(sql, /extensions\.digest/i);
  assert.match(sql, /redemption\.user_id = current_user_id[\s\S]*redemption\.identity_hash = privacy_identity_hash/i);
  assert.match(sql, /already_claimed/i);
  assert.doesNotMatch(sql, /provider_required|Connect a verified Google identity/i);
});

test("launch claims work independently of the paid-checkout switch", async () => {
  const promotionSource = await readFile(new URL("../src/keeperPromotions.ts", import.meta.url), "utf8");
  const paymentSource = await readFile(new URL("../src/payments.ts", import.meta.url), "utf8");
  assert.doesNotMatch(promotionSource, /VITE_KEEPER_CHECKOUT_ENABLED/);
  assert.match(paymentSource, /VITE_KEEPER_CHECKOUT_ENABLED/);
  assert.match(promotionSource, /refreshAuthoritativeAccountState/);
  assert.match(promotionSource, /The claim succeeded; Keeper is still refreshing/);
});

test("the fix preserves counters and verifies the granted entitlement before commit", async () => {
  const sql = await readFile(fixMigrationUrl, "utf8");
  assert.match(sql, /^begin;/im);
  assert.match(sql, /for update;/i);
  assert.match(sql, /redemption_count = redemption_count \+ 1/i);
  assert.match(sql, /granted_plan := public\.keeper_plan_code_for_user/i);
  assert.match(sql, /if granted_plan <> promotion\.entitlement_key then[\s\S]*raise exception/i);
  assert.match(sql, /'vehicle_limit', public\.keeper_vehicle_limit_for_user/i);
  assert.match(sql, /'pdf_export_enabled', true/i);
  assert.match(sql, /'entitlement_source', 'launch_promo'/i);
  assert.doesNotMatch(sql, /set redemption_count\s*=\s*0|truncate|delete from public\.keeper_promotion/i);
  assert.match(sql, /commit;/i);
});

test("the browser only requests an authoritative promotion key", async () => {
  const source = await readFile(new URL("../src/keeperPromotions.ts", import.meta.url), "utf8");
  assert.match(source, /claim_keeper_launch_promotion/);
  assert.match(source, /p_promotion_key: promotionKey/);
  assert.doesNotMatch(source, /account_entitlements|keeper_promotion_redemptions|redemption_count\s*[+\-]=|localStorage|sessionStorage/);
});

test("sold-out launch offers fall back to normal permanent pricing", async () => {
  const profile = await readFile(new URL("../src/ProfilePage.tsx", import.meta.url), "utf8");
  for (const copy of ["Purchase ${title}", "Claim ${title} Free", "of {offer.max_redemptions} launch spots remaining", "Founder Launch Access"]) {
    assert.match(profile, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
