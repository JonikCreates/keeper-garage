import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  KEEPER_FREE_ENTITLEMENTS,
  KEEPER_UNLOCK_ENTITLEMENTS,
  KEEPER_UNLIMITED_ENTITLEMENTS,
  KEEPER_PRODUCTS,
  canAddVehicle,
  canExportPdf,
  checkoutProductsForPlan,
  getKeeperEntitlements,
} from "../src/keeperEntitlements.ts";

test("Keeper plans expose the exact one-time pricing and capabilities", () => {
  assert.equal(KEEPER_PRODUCTS.keeper_unlock_v1.amountCents, 199);
  assert.equal(KEEPER_PRODUCTS.keeper_unlimited_v1.amountCents, 499);
  assert.equal(KEEPER_PRODUCTS.keeper_unlimited_upgrade_v1.amountCents, 300);
  assert.deepEqual(KEEPER_FREE_ENTITLEMENTS, { planCode: "free", maxVehicles: 1, canExportPdf: false, lifetimeUpgrade: false });
  assert.equal(canAddVehicle(KEEPER_UNLOCK_ENTITLEMENTS, 2), true);
  assert.equal(canAddVehicle(KEEPER_UNLOCK_ENTITLEMENTS, 3), false);
  assert.equal(canAddVehicle(KEEPER_UNLIMITED_ENTITLEMENTS, 10000), true);
  assert.equal(canExportPdf(KEEPER_UNLOCK_ENTITLEMENTS), true);
  assert.equal(canExportPdf(KEEPER_UNLIMITED_ENTITLEMENTS), true);
});

test("only the three allowed plan transitions are offered", () => {
  assert.deepEqual(checkoutProductsForPlan("free"), ["keeper_unlock_v1", "keeper_unlimited_v1"]);
  assert.deepEqual(checkoutProductsForPlan("keeper_unlock_v1"), ["keeper_unlimited_upgrade_v1"]);
  assert.deepEqual(checkoutProductsForPlan("keeper_unlimited_v1"), []);
});

test("legacy paid server entitlements map to Unlock without inventing Unlimited", () => {
  for (const key of ["keeper_lifetime", "project_car", "collector"]) assert.equal(getKeeperEntitlements(new Set([key])).planCode, "keeper_unlock_v1");
  assert.equal(getKeeperEntitlements(new Set(["keeper_unlimited_v1"])).planCode, "keeper_unlimited_v1");
  assert.equal(getKeeperEntitlements(new Set(["basic_traffic"])).planCode, "free");
});

test("browser billing code cannot grant entitlements or choose trusted amounts", async () => {
  const payments = await readFile(new URL("../src/payments.ts", import.meta.url), "utf8");
  assert.doesNotMatch(payments, /from\("account_entitlements"\)|from\("keeper_billing_purchases"\)|\.insert\(|\.update\(/);
  assert.match(payments, /body: \{ productCode \}/);
  assert.doesNotMatch(payments, /priceId|userId|amountCents/);
  assert.match(payments, /create-keeper-checkout/);
});

test("profile states exact one-time prices and no subscription", async () => {
  const profile = await readFile(new URL("../src/ProfilePage.tsx", import.meta.url), "utf8");
  for (const copy of ["Keeper Free", "Keeper Unlock", "Keeper Unlimited", "$1.99", "$4.99", "$3.00", "No subscription"]) assert.match(profile, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(profile, /\/ month|monthlyPrice|subscription plan/i);
});
