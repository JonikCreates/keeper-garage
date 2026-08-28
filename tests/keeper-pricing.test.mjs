import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  KEEPER_FREE_ENTITLEMENTS,
  KEEPER_UPGRADED_ENTITLEMENTS,
  canAddVehicle,
  canExportPdf,
  getKeeperEntitlements,
} from "../src/keeperEntitlements.ts";

test("free Keeper has one vehicle slot and no PDF export", () => {
  assert.equal(KEEPER_FREE_ENTITLEMENTS.maxVehicles, 1);
  assert.equal(canAddVehicle(KEEPER_FREE_ENTITLEMENTS, 0), true);
  assert.equal(canAddVehicle(KEEPER_FREE_ENTITLEMENTS, 1), false);
  assert.equal(canExportPdf(KEEPER_FREE_ENTITLEMENTS), false);
});

test("upgraded Keeper has three total slots and PDF export", () => {
  assert.equal(KEEPER_UPGRADED_ENTITLEMENTS.maxVehicles, 3);
  assert.equal(canAddVehicle(KEEPER_UPGRADED_ENTITLEMENTS, 1), true);
  assert.equal(canAddVehicle(KEEPER_UPGRADED_ENTITLEMENTS, 2), true);
  assert.equal(canAddVehicle(KEEPER_UPGRADED_ENTITLEMENTS, 3), false);
  assert.equal(canExportPdf(KEEPER_UPGRADED_ENTITLEMENTS), true);
  assert.deepEqual(getKeeperEntitlements(new Set(["keeper_lifetime"])), KEEPER_UPGRADED_ENTITLEMENTS);
});

test("legacy paid server entitlements preserve upgraded access", () => {
  assert.equal(getKeeperEntitlements(new Set(["project_car"])).lifetimeUpgrade, true);
  assert.equal(getKeeperEntitlements(new Set(["collector"])).lifetimeUpgrade, true);
  assert.equal(getKeeperEntitlements(new Set(["basic_traffic"])).lifetimeUpgrade, false);
});

test("browser code cannot permanently grant the lifetime entitlement", async () => {
  const access = await readFile(new URL("../src/access.ts", import.meta.url), "utf8");
  const payments = await readFile(new URL("../src/payments.ts", import.meta.url), "utf8");
  assert.doesNotMatch(access, /localStorage|setPremium|setLifetime|keeper-dev-plan/);
  assert.doesNotMatch(payments, /from\("account_entitlements"\)|from\("keeper_purchases"\)|\.insert\(|\.update\(/);
  assert.match(payments, /create-keeper-upgrade-checkout/);
});

test("profile presents one $0.99 lifetime upgrade and no retired tiers", async () => {
  const profile = await readFile(new URL("../src/ProfilePage.tsx", import.meta.url), "utf8");
  assert.match(profile, /Keeper Free/);
  assert.match(profile, /Keeper Upgraded/);
  assert.match(profile, /\$0\.99/);
  assert.match(profile, /One-time purchase\. No subscription\./);
  assert.doesNotMatch(profile, /Basic Traffic|Project Car|Collector|\/ month|monthlyPrice|planOptions/);
});
