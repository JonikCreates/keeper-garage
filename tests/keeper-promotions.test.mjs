import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL("../supabase/migrations/20260828234000_add_keeper_launch_promotions.sql", import.meta.url);

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

test("one verified Google identity can claim only one launch promotion", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /email_confirmed_at is null/i);
  assert.match(sql, /provider = 'google'/i);
  assert.match(sql, /extensions\.digest/i);
  assert.match(sql, /unique \(user_id\)/i);
  assert.match(sql, /unique \(identity_hash\)/i);
  assert.match(sql, /already_claimed/i);
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
