export type KeeperPlanCode = "free" | "keeper_unlock_v1" | "keeper_unlimited_v1";
export type KeeperProductCode = "keeper_unlock_v1" | "keeper_unlimited_v1";

export const PRODUCTS = Object.freeze({
  keeper_unlock_v1: Object.freeze({ amountCents: 199, previousPlans: ["free"] as const, resultingPlan: "keeper_unlock_v1" as const, testPriceSecret: "STRIPE_PRICE_KEEPER_UNLOCK_199", livePriceSecret: "STRIPE_LIVE_PRICE_KEEPER_UNLOCK_199" }),
  keeper_unlimited_v1: Object.freeze({ amountCents: 499, previousPlans: ["free", "keeper_unlock_v1"] as const, resultingPlan: "keeper_unlimited_v1" as const, testPriceSecret: "STRIPE_PRICE_KEEPER_UNLIMITED_499", livePriceSecret: "STRIPE_LIVE_PRICE_KEEPER_UNLIMITED_499" }),
});

export function isProductCode(value: unknown): value is KeeperProductCode {
  return typeof value === "string" && Object.hasOwn(PRODUCTS, value);
}

export function productForTransition(planCode: KeeperPlanCode, productCode: KeeperProductCode) {
  const product = PRODUCTS[productCode];
  return (product.previousPlans as readonly KeeperPlanCode[]).includes(planCode) ? product : null;
}
