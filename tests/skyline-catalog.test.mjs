import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function generatedJson(source, exportName, nextExport) {
  const expression = new RegExp(`export const ${exportName}[^=]*= ([\\s\\S]*?);\\r?\\n\\r?\\nexport const ${nextExport}`);
  const match = source.match(expression);
  assert.ok(match, `${exportName} should be generated as inspectable JSON`);
  return JSON.parse(match[1]);
}

test("the supplied R32 and R33 workbooks produce exact, grouped Skyline configurations", async () => {
  const generated = await readFile(new URL("../lib/skylineVehicleData.ts", import.meta.url), "utf8");
  const platforms = generatedJson(generated, "SKYLINE_PLATFORMS", "SKYLINE_VARIANTS");
  const variants = generatedJson(generated, "SKYLINE_VARIANTS", "SKYLINE_SCHEDULE_PROFILES");
  const profiles = generatedJson(generated, "SKYLINE_SCHEDULE_PROFILES", "SKYLINE_SCHEDULE_ROWS");
  const rows = generatedJson(generated, "SKYLINE_SCHEDULE_ROWS", "SKYLINE_SCHEDULES");
  const schedules = generatedJson(generated, "SKYLINE_SCHEDULES", "SKYLINE_ISSUES");

  assert.deepEqual(platforms, [
    { value: "R32", brand: "Nissan", label: "Skyline (R32)", yearStart: 1989, yearEnd: 1994 },
    { value: "R33", brand: "Nissan", label: "Skyline (R33)", yearStart: 1993, yearEnd: 1998 },
  ]);
  assert.equal(variants.length, 41);
  assert.equal(profiles.length, 41);
  assert.equal(Object.keys(schedules).length, 41);
  assert.ok(Object.keys(rows).length >= 140, "repeated workbook rows should remain normalized");
  assert.ok(Object.values(schedules).every((rowKeys) => rowKeys.length >= 30));
  assert.ok(Object.values(schedules).flat().every((rowKey) => rows[rowKey]));

  const find = (platform, trim, transmission) => variants.find((variant) =>
    variant.platform === platform && variant.trim === trim && variant.transmission === transmission);
  assert.equal(find("R32", "GTS-t / Type M", "5-speed manual")?.engineCode, "RB20DET");
  assert.deepEqual(
    [find("R32", "GTS25", "5-speed manual")?.yearStart, find("R32", "GTS25", "5-speed manual")?.yearEnd],
    [1991, 1993],
  );
  assert.deepEqual(
    [find("R32", "GT-R — Early (1989–Jul 1991)", "5-speed manual")?.yearStart, find("R32", "GT-R — Early (1989–Jul 1991)", "5-speed manual")?.yearEnd],
    [1989, 1991],
  );
  assert.deepEqual(
    [find("R32", "GT-R V-Spec II", "5-speed manual")?.yearStart, find("R32", "GT-R V-Spec II", "5-speed manual")?.yearEnd],
    [1994, 1994],
  );
  assert.deepEqual(
    [find("R33", "GTS25t Type M — Series 2/3", "4-speed automatic")?.yearStart, find("R33", "GTS25t Type M — Series 2/3", "4-speed automatic")?.yearEnd],
    [1996, 1998],
  );
  assert.equal(find("R33", "GT-R Autech 40th Anniversary (4-door)", "5-speed manual")?.body, "4-door special GT-R sedan");
  assert.equal(find("R33", "GTS25t Type M — Series 1", "5-speed manual")?.engineCode, "RB25DET");
  assert.equal(find("R33", "NISMO 400R", "5-speed manual")?.engineCode, "RB-X GT2");
});

test("Skyline maintenance, issue fitment, and ownership research stay connected", async () => {
  const generated = await readFile(new URL("../lib/skylineVehicleData.ts", import.meta.url), "utf8");
  const profiles = generatedJson(generated, "SKYLINE_SCHEDULE_PROFILES", "SKYLINE_SCHEDULE_ROWS");
  const issues = generatedJson(generated, "SKYLINE_ISSUES", "SKYLINE_INSIGHTS");
  const insightsMatch = generated.match(/export const SKYLINE_INSIGHTS[^=]*= ([\s\S]*);\s*$/);
  assert.ok(insightsMatch);
  const insights = JSON.parse(insightsMatch[1]);
  const scheduleIds = new Set(profiles.map((profile) => profile.scheduleId));

  assert.ok(issues.length >= 90);
  assert.ok(issues.every((issue) => issue.issue && issue.symptoms && issue.preventativeAction));
  assert.ok(issues.every((issue) => issue.scheduleIds.every((scheduleId) => scheduleIds.has(scheduleId))));
  assert.ok(issues.some((issue) => issue.scheduleIds.length > 10), "shared issues should merge without losing exact fitment");
  assert.ok(issues.some((issue) => /timing-belt/i.test(issue.issue)));
  assert.ok(issues.some((issue) => /ATTESA/i.test(`${issue.issue} ${issue.description}`)));
  assert.ok(issues.some((issue) => /400R/i.test(issue.configuration)));
  assert.equal(insights.length, 15);
  assert.deepEqual(new Set(insights.map((insight) => insight.platform)), new Set(["R32", "R33"]));
  assert.ok(insights.every((insight) => insight.title && insight.summary && insight.sourceWorkbook));
});

test("the unified research adapter adds Skyline data without replacing existing IDs", async () => {
  const adapter = await readFile(new URL("../lib/researchVehicleData.ts", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8");
  assert.match(adapter, /\[\.\.\.ENHANCED_PLATFORMS, \.\.\.SKYLINE_PLATFORMS(?:, [^\]]+)?\]/);
  assert.match(adapter, /\{ \.\.\.ENHANCED_SCHEDULES, \.\.\.SKYLINE_SCHEDULES(?:, [^}]+)? \}/);
  assert.match(catalog, /RESEARCH_PLATFORMS/);
  assert.match(catalog, /RESEARCH_VARIANTS/);
});
