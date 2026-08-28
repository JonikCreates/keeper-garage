import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PRODUCTS, productForTransition } from "../supabase/functions/_shared/billing.ts";

test("server transition map fixes amount and resulting entitlement", () => {
  assert.deepEqual(productForTransition("free", "keeper_unlock_v1"), PRODUCTS.keeper_unlock_v1);
  assert.deepEqual(productForTransition("free", "keeper_unlimited_v1"), PRODUCTS.keeper_unlimited_v1);
  assert.deepEqual(productForTransition("keeper_unlock_v1", "keeper_unlimited_v1"), PRODUCTS.keeper_unlimited_v1);
  assert.equal(productForTransition("keeper_unlimited_v1", "keeper_unlock_v1"), null);
  assert.equal(productForTransition("keeper_unlimited_v1", "keeper_unlimited_v1"), null);
});

test("checkout trusts only authenticated identity and one productCode", async () => {
  const source = await readFile(new URL("../supabase/functions/create-keeper-checkout/index.ts", import.meta.url), "utf8");
  assert.match(source, /withSupabase\(\{ auth: "user" \}/);
  assert.match(source, /Object\.keys\(body\)\.length !== 1/);
  assert.match(source, /ctx\.userClaims\?\.sub/);
  assert.match(source, /account_active/);
  assert.match(source, /mode: "payment"/);
  assert.match(source, /KEEPER_STRIPE_LIVE_ENABLED/);
  assert.match(source, /line_items: \[\{ price: priceId, quantity: 1 \}\]/);
  assert.doesNotMatch(source, /body\.(userId|amount|priceId)|body\["userId"\]/);
});

test("webhook rejects invalid signatures before database processing and uses raw body", async () => {
  const source = await readFile(new URL("../supabase/functions/stripe-webhook/index.ts", import.meta.url), "utf8");
  const raw = source.indexOf("await req.text()");
  const verify = source.indexOf("constructEventAsync");
  const process = source.indexOf("process_keeper_stripe_event");
  assert.ok(raw >= 0 && raw < verify && verify < process);
  assert.match(source, /Invalid Stripe signature[\s\S]*status: 400/);
  assert.match(source, /event\.id/);
  assert.match(source, /checkout\.session\.expired/);
  assert.match(source, /event\.livemode[\s\S]*KEEPER_STRIPE_LIVE_ENABLED/);
  assert.doesNotMatch(source, /req\.json\(\)/);
});

test("success UI polls status but never grants access", async () => {
  const source = await readFile(new URL("../src/PaymentResultPage.tsx", import.meta.url), "utf8");
  assert.match(source, /getBillingStatus\(\)/);
  assert.match(source, /refreshAccountState\(\)/);
  assert.doesNotMatch(source, /account_entitlements|\.insert\(|\.update\(/);
});
