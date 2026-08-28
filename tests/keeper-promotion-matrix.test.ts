import assert from "node:assert/strict";
import test from "node:test";

type PromotionKey = "launch_upgrade_50" | "launch_infinite_10";
type Plan = "free" | "keeper_unlock_v1" | "keeper_unlimited_v1";
type ClaimResult = { status: "claimed" | "sold_out" | "already_claimed" | "already_owned" | "failed"; plan: Plan; vehicleLimit: number | null; pdf: boolean };

class AtomicPromotionHarness {
  readonly max = { launch_upgrade_50: 50, launch_infinite_10: 10 };
  readonly counts = { launch_upgrade_50: 0, launch_infinite_10: 0 };
  readonly plans = new Map<string, Plan>();
  readonly redeemed = new Set<string>();
  private queue = Promise.resolve();

  claim(user: string, key: PromotionKey, failEntitlement = false): Promise<ClaimResult> {
    const run = this.queue.then(() => this.claimInsideTransaction(user, key, failEntitlement));
    this.queue = run.then(() => undefined, () => undefined);
    return run;
  }

  private claimInsideTransaction(user: string, key: PromotionKey, failEntitlement: boolean): ClaimResult {
    const current = this.plans.get(user) ?? "free";
    if (this.redeemed.has(user)) return this.result("already_claimed", current);
    if (current === "keeper_unlimited_v1" || (key === "launch_upgrade_50" && current !== "free")) return this.result("already_owned", current);
    if (this.counts[key] >= this.max[key]) return this.result("sold_out", current);

    const next = key === "launch_upgrade_50" ? "keeper_unlock_v1" : "keeper_unlimited_v1";
    if (failEntitlement) return this.result("failed", current);

    this.counts[key] += 1;
    this.redeemed.add(user);
    this.plans.set(user, next);
    return this.result("claimed", next);
  }

  private result(status: ClaimResult["status"], plan: Plan): ClaimResult {
    return { status, plan, vehicleLimit: plan === "free" ? 1 : plan === "keeper_unlock_v1" ? 3 : null, pdf: plan !== "free" };
  }
}

test("claims 1-50 Upgrade succeed, claim 51 is sold out, and access is authoritative", async () => {
  const promotions = new AtomicPromotionHarness();
  const claims = await Promise.all(Array.from({ length: 50 }, (_, index) => promotions.claim(`upgrade-${index}`, "launch_upgrade_50")));
  assert.equal(claims.every((claim) => claim.status === "claimed" && claim.plan === "keeper_unlock_v1" && claim.vehicleLimit === 3 && claim.pdf), true);
  assert.equal((await promotions.claim("upgrade-51", "launch_upgrade_50")).status, "sold_out");
  assert.equal(promotions.counts.launch_upgrade_50, 50);
  assert.equal(promotions.counts.launch_infinite_10, 0);
});

test("claims 1-10 Infinite succeed, claim 11 is sold out, and access is authoritative", async () => {
  const promotions = new AtomicPromotionHarness();
  const claims = await Promise.all(Array.from({ length: 10 }, (_, index) => promotions.claim(`infinite-${index}`, "launch_infinite_10")));
  assert.equal(claims.every((claim) => claim.status === "claimed" && claim.plan === "keeper_unlimited_v1" && claim.vehicleLimit === null && claim.pdf), true);
  assert.equal((await promotions.claim("infinite-11", "launch_infinite_10")).status, "sold_out");
  assert.equal(promotions.counts.launch_infinite_10, 10);
  assert.equal(promotions.counts.launch_upgrade_50, 0);
});

test("both claim orders preserve independent 50/10 pools and total 60 accounts", async () => {
  for (const order of [
    ["launch_infinite_10", "launch_upgrade_50"],
    ["launch_upgrade_50", "launch_infinite_10"],
  ] as PromotionKey[][]) {
    const promotions = new AtomicPromotionHarness();
    for (const key of order) {
      const amount = promotions.max[key];
      await Promise.all(Array.from({ length: amount }, (_, index) => promotions.claim(`${key}-${index}`, key)));
      const other = key === "launch_upgrade_50" ? "launch_infinite_10" : "launch_upgrade_50";
      if (key === order[0]) assert.equal(promotions.counts[other], 0);
    }
    assert.deepEqual(promotions.counts, { launch_upgrade_50: 50, launch_infinite_10: 10 });
    assert.equal(promotions.redeemed.size, 60);
  }
});

test("one account cannot claim twice or cross pools", async () => {
  const promotions = new AtomicPromotionHarness();
  assert.equal((await promotions.claim("one-user", "launch_infinite_10")).status, "claimed");
  assert.equal((await promotions.claim("one-user", "launch_infinite_10")).status, "already_claimed");
  assert.equal((await promotions.claim("one-user", "launch_upgrade_50")).status, "already_claimed");
  assert.deepEqual(promotions.counts, { launch_upgrade_50: 0, launch_infinite_10: 1 });
});

test("simultaneous final-slot requests award exactly one account", async () => {
  for (const key of ["launch_upgrade_50", "launch_infinite_10"] as PromotionKey[]) {
    const promotions = new AtomicPromotionHarness();
    for (let index = 0; index < promotions.max[key] - 1; index += 1) await promotions.claim(`seed-${key}-${index}`, key);
    const results = await Promise.all([promotions.claim(`final-a-${key}`, key), promotions.claim(`final-b-${key}`, key)]);
    assert.equal(results.filter((result) => result.status === "claimed").length, 1);
    assert.equal(results.filter((result) => result.status === "sold_out").length, 1);
    assert.equal(promotions.counts[key], promotions.max[key]);
  }
});

test("a failed entitlement grant consumes no slot and records no redemption", async () => {
  const promotions = new AtomicPromotionHarness();
  assert.equal((await promotions.claim("failure", "launch_upgrade_50", true)).status, "failed");
  assert.equal(promotions.counts.launch_upgrade_50, 0);
  assert.equal(promotions.redeemed.has("failure"), false);
  assert.equal(promotions.plans.get("failure"), undefined);
});
