import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { hasSplitCosts, maintenanceCostDetails, maintenanceTotalCents, parseCostCents, recordTotalCents, serializeMaintenanceCosts } from "../src/maintenanceCosts";

for (const [name, parts, labor, total] of [
  ["parts only", "250.00", "", 25000], ["labor only", "", "180.00", 18000],
  ["both", "250.00", "180.00", 43000], ["neither", "", "", 0],
  ["decimal cents", "0.10", "0.20", 30],
] as const) {
  test(`create, serialize, reload, edit and remove ${name}`, () => {
    const row = serializeMaintenanceCosts({ partsCostCents: parseCostCents(parts) ?? 0, laborCostCents: parseCostCents(labor) ?? 0 });
    const reloaded = JSON.parse(JSON.stringify(row));
    assert.equal(recordTotalCents(reloaded), total);
    assert.equal(maintenanceTotalCents([reloaded]), total); // cached total is not counted twice
    assert.ok(hasSplitCosts(reloaded));
    const edited = serializeMaintenanceCosts({ partsCostCents: reloaded.parts_cost_cents + 1, laborCostCents: reloaded.labor_cost_cents });
    assert.equal(maintenanceTotalCents([edited]), total + 1);
    const removed = [edited].filter((record) => record !== edited);
    assert.equal(maintenanceTotalCents(removed), 0);
  });
}

test("historical costs remain totals without an invented split", () => {
  const old = { cost_cents: 30000 };
  assert.equal(recordTotalCents(old), 30000);
  assert.equal(hasSplitCosts(old), false);
  assert.equal(maintenanceCostDetails(old), "Legacy total: $300.00");
  const edited = serializeMaintenanceCosts({ costCents: old.cost_cents, partsCostCents: null, laborCostCents: null });
  assert.equal(recordTotalCents(edited), 30000);
  assert.equal(hasSplitCosts(edited), false);
  assert.equal(maintenanceTotalCents([old, { parts_cost_cents: 25000, labor_cost_cents: 18000, cost_cents: 43000 }]), 73000);
  assert.equal(recordTotalCents({ cost_cents: 30000, parts_cost_cents: 0, labor_cost_cents: 0 }), 0);
  assert.equal(recordTotalCents({ cost_cents: null }), null);
});

test("money rejects negative, nonfinite, fractional-cent and excessive inputs", () => {
  for (const invalid of ["-1", "NaN", "Infinity", "1.001", "1e2", "1,000", "1000000.01", "1..2"]) assert.throws(() => parseCostCents(invalid));
  assert.equal(parseCostCents(" 78.42 "), 7842);
  assert.equal(parseCostCents("1000000.00"), 100000000);
  assert.throws(() => serializeMaintenanceCosts({ partsCostCents: 100000000, laborCostCents: 1 }));
  assert.throws(() => serializeMaintenanceCosts({ partsCostCents: 0.1, laborCostCents: 0 }));
});

test("cost migration preserves old data and limits edits to owned service details", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260908121000_split_maintenance_costs.sql", import.meta.url), "utf8");
  assert.doesNotMatch(sql, /update public\.maintenance_records|delete from|truncate|drop table/i);
  assert.match(sql, /grant update \(work_performed/);
  assert.match(sql, /has_keeper_entitlement\('authenticated_account'\)/);
  assert.match(sql, /maintenance_records_split_total_check/);
});
