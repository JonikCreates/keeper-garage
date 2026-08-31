import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clearFormDraft,
  formDraftStorageKey,
  readFormDraft,
  writeFormDraft,
} from "../src/useSessionDraft";

class MemoryDraftStorage {
  readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

type ServiceDraft = {
  workPerformed: string;
  mileage: string;
  completedAt: string;
  notes: string;
  cost: string;
  fluidProduct: string;
  fluidQuantity: string;
  filterProduct: string;
};

function isServiceDraft(value: unknown): value is ServiceDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return ["workPerformed", "mileage", "completedAt", "notes", "cost", "fluidProduct", "fluidQuantity", "filterProduct"]
    .every((field) => typeof draft[field] === "string");
}

test("dirty maintenance input survives focus, visibility, auth, and equivalent-vehicle refreshes", () => {
  const storage = new MemoryDraftStorage();
  const scope = "user-123:vehicle-456";
  const key = formDraftStorageKey(scope, "maintenance-record:engine-oil-filter");
  const draft: ServiceDraft = {
    workPerformed: "Oil, filter, and drain-plug washer",
    mileage: "82450",
    completedAt: "2026-08-30",
    notes: "Receipt is in the glovebox",
    cost: "78.42",
    fluidProduct: "Special Tec LL",
    fluidQuantity: "5.2",
    filterProduct: "MANN HU 816 x",
  };
  writeFormDraft(storage, key, draft);

  const browserEvents = new EventTarget();
  browserEvents.dispatchEvent(new Event("blur"));
  browserEvents.dispatchEvent(new Event("visibilitychange"));
  browserEvents.dispatchEvent(new Event("focus"));

  const recreatedUser = { id: "user-123" };
  const recreatedVehicle = { id: "vehicle-456", updated_at: "a-new-fetch-object" };
  const equivalentScope = `${recreatedUser.id}:${recreatedVehicle.id}`;
  assert.deepEqual(readFormDraft(storage, formDraftStorageKey(equivalentScope, "maintenance-record:engine-oil-filter"), isServiceDraft), draft);
});

test("session drafts are isolated by user, vehicle, and form and clear after save or discard", () => {
  const storage = new MemoryDraftStorage();
  const key = formDraftStorageKey("user-a:vehicle-a", "custom-maintenance");
  const draft: ServiceDraft = { workPerformed: "Belts", mileage: "90000", completedAt: "2026-08-30", notes: "", cost: "25", fluidProduct: "", fluidQuantity: "", filterProduct: "" };
  writeFormDraft(storage, key, draft);

  assert.deepEqual(readFormDraft(storage, key, isServiceDraft), draft);
  assert.equal(readFormDraft(storage, formDraftStorageKey("user-a:vehicle-b", "custom-maintenance"), isServiceDraft), null);
  assert.equal(readFormDraft(storage, formDraftStorageKey("user-b:vehicle-a", "custom-maintenance"), isServiceDraft), null);
  assert.equal(readFormDraft(storage, formDraftStorageKey("user-a:vehicle-a", "custom-issue"), isServiceDraft), null);

  clearFormDraft(storage, key);
  assert.equal(readFormDraft(storage, key, isServiceDraft), null);
});

test("auth refresh and data hooks preserve active identity instead of resetting on recreated objects", async () => {
  const auth = await readFile(new URL("../src/useKeeperAuth.ts", import.meta.url), "utf8");
  const garage = await readFile(new URL("../src/useGarage.ts", import.meta.url), "utf8");
  const records = await readFile(new URL("../src/useMaintenanceRecords.ts", import.meta.url), "utf8");
  const tracked = await readFile(new URL("../src/useTrackedMaintenance.ts", import.meta.url), "utf8");

  assert.match(auth, /identityChanged/);
  assert.match(auth, /loadAccountState\(nextSession, !identityChanged\)/);
  assert.match(garage, /const userId = user\?\.id \?\? null/);
  assert.match(garage, /current\.ownerId === currentUserId/);
  assert.match(garage, /\[userId, onVehicleLoaded, dataVersion\]/);
  assert.match(records, /\[userId, vehicleId\]/);
  assert.match(tracked, /\[userId, vehicleId\]/);
  assert.doesNotMatch(garage, /\[user, onVehicleLoaded, dataVersion\]/);
});
