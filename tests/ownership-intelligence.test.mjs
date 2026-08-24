import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadIntelligence() {
  const source = await readFile(new URL("../src/ownershipIntelligence.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

const baseline = (overrides = {}) => ({
  slug: "engine-oil-filter",
  name: "Engine oil & filter",
  category: "Engine",
  severity: "critical",
  kind: "baseline",
  statusTone: "current",
  recommendationType: "keeper",
  description: "Conservative oil-service planning interval.",
  mileageInterval: 7_500,
  timeIntervalMonths: 12,
  latestRecord: { completedAt: "2026-01-01", mileage: 50_000 },
  issueStatus: null,
  knownIssueUrgency: null,
  ...overrides,
});

test("Keeper Health is deterministic and withheld when ownership data is too thin", async () => {
  const { createOwnershipInsights } = await loadIntelligence();
  const now = Date.parse("2026-08-20T12:00:00Z");
  const noHistory = createOwnershipInsights({ items: [baseline()], currentMileage: 54_000, records: [], now });
  assert.equal(noHistory.health.score, null);
  assert.equal(noHistory.health.label, "More data needed");

  const input = {
    items: [baseline({ statusTone: "soon" })],
    currentMileage: 54_000,
    records: [{ name: "Engine oil & filter", completedAt: "2026-01-01", mileage: 50_000, costCents: 9_500 }],
    now,
  };
  assert.deepEqual(createOwnershipInsights(input).health, createOwnershipInsights(input).health);
  assert.equal(typeof createOwnershipInsights(input).health.score, "number");
});

test("priority logic does not turn missing history or a watch item into a diagnosed emergency", async () => {
  const { assessPriority } = await loadIntelligence();
  const missingHistory = assessPriority(baseline({ statusTone: "unrecorded", latestRecord: null }));
  assert.notEqual(missingHistory.priority, "critical");
  assert.notEqual(missingHistory.priority, "high");

  const watchItem = assessPriority(baseline({
    slug: "issue-timing-chain",
    name: "Timing-chain concern",
    kind: "known_issue",
    statusTone: "soon",
    latestRecord: null,
    mileageInterval: null,
    timeIntervalMonths: null,
    issueStatus: "watching",
    knownIssueUrgency: "watch",
  }));
  assert.equal(watchItem.priority, "medium");
  assert.equal(watchItem.driveGuidance, "monitor");
});

test("upcoming maintenance, timeline, and costs come from real service baselines", async () => {
  const { createOwnershipInsights } = await loadIntelligence();
  const insights = createOwnershipInsights({
    items: [baseline({ statusTone: "soon" })],
    currentMileage: 54_000,
    records: [{ name: "Engine oil & filter", completedAt: "2026-01-01", mileage: 50_000, costCents: 9_500 }],
    now: Date.parse("2026-08-20T12:00:00Z"),
  });

  assert.equal(insights.nextService.name, "Engine oil & filter");
  assert.equal(insights.nextService.dueMileage, 57_500);
  assert.equal(insights.upcoming.find((group) => group.key === "next_5000").items.length, 1);
  assert.equal(insights.timeline.length, 1);
  assert.deepEqual({ min: insights.costs.scheduled.min, max: insights.costs.scheduled.max }, { min: 80, max: 160 });
});

test("recent service uses completion date and mileage rather than entry order", async () => {
  const { createOwnershipInsights } = await loadIntelligence();
  const records = [
    { name: "Older historical entry", completedAt: "2025-04-01", mileage: 40_000, costCents: null },
    { name: "Same-day lower-mileage entry", completedAt: "2026-06-15", mileage: 51_000, costCents: null },
    { name: "Actual latest service", completedAt: "2026-06-15", mileage: 52_000, costCents: null },
  ];
  const insights = createOwnershipInsights({ items: [baseline()], currentMileage: 54_000, records, now: Date.parse("2026-08-20T12:00:00Z") });

  assert.equal(insights.recentService?.name, "Actual latest service");
});
