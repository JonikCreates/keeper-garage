import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("known-issue search handles aliases, partial terms, and misspellings", () => {
  const moduleUrl = new URL("../lib/knownIssueSearch.ts", import.meta.url).href;
  const script = `
    import { searchKnownIssues } from ${JSON.stringify(moduleUrl)};
    const common = { system: "Engine", description: "", symptoms: "", typicalMileage: "", preventativeAction: "", urgency: "watch", severity: "important", evidence: "community pattern", sources: [], appliesTo: {} };
    const issues = [
      { ...common, slug: "valvetronic", issue: "Valve-cover gasket and integrated PCV", component: "Cylinder head cover and Valvetronic servomotor mounting area", aliases: ["VVT motor seal", "Valvetronic motor gasket", "actuator flange", "seal flange"], keywords: ["oil leak near VVT motor"] },
      { ...common, slug: "ofhg", issue: "Oil filter housing gasket", aliases: ["OFHG"], keywords: ["oil leak"] }
    ];
    const profile = { platform: "F30", year: 2016, trim: "328i", engineCode: "N26", drivetrain: "RWD", transmission: "8-speed automatic" };
    const seal = searchKnownIssues("Seal Flange for VVT motor", issues, profile);
    const typo = searchKnownIssues("oil filter house gaskit", issues, profile);
    if (seal[0]?.issue.slug !== "valvetronic") throw new Error("VVT alias did not rank first");
    if (typo[0]?.issue.slug !== "ofhg") throw new Error("misspelled OFHG query did not rank first");
    if (!seal[0]?.reason.includes("alternate name")) throw new Error("search result did not explain its alias match");
  `;
  const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
