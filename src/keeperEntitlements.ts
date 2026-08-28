export const KEEPER_UNLOCK_ENTITLEMENT = "keeper_unlock_v1";
export const KEEPER_UNLIMITED_ENTITLEMENT = "keeper_unlimited_v1";

// These server-issued keys preserve the access promised by earlier Keeper builds.
// They map to Unlock; only the versioned unlimited entitlement grants Unlimited.
export const LEGACY_PAID_ENTITLEMENTS = Object.freeze(["keeper_lifetime", "project_car", "collector"]);

export type KeeperPlanCode = "free" | "keeper_unlock_v1" | "keeper_unlimited_v1";
export type KeeperProductCode = "keeper_unlock_v1" | "keeper_unlimited_v1" | "keeper_unlimited_upgrade_v1";

export const KEEPER_PRODUCTS = Object.freeze({
  keeper_unlock_v1: Object.freeze({ productCode: "keeper_unlock_v1" as const, name: "Keeper Unlock", amountCents: 199, resultingPlanCode: "keeper_unlock_v1" as const }),
  keeper_unlimited_v1: Object.freeze({ productCode: "keeper_unlimited_v1" as const, name: "Keeper Unlimited", amountCents: 499, resultingPlanCode: "keeper_unlimited_v1" as const }),
  keeper_unlimited_upgrade_v1: Object.freeze({ productCode: "keeper_unlimited_upgrade_v1" as const, name: "Upgrade to Keeper Unlimited", amountCents: 300, resultingPlanCode: "keeper_unlimited_v1" as const }),
});

export type KeeperEntitlements = {
  planCode: KeeperPlanCode;
  maxVehicles: number | null;
  canExportPdf: boolean;
  lifetimeUpgrade: boolean;
};

export const KEEPER_FREE_ENTITLEMENTS: KeeperEntitlements = Object.freeze({ planCode: "free", maxVehicles: 1, canExportPdf: false, lifetimeUpgrade: false });
export const KEEPER_UNLOCK_ENTITLEMENTS: KeeperEntitlements = Object.freeze({ planCode: "keeper_unlock_v1", maxVehicles: 3, canExportPdf: true, lifetimeUpgrade: true });
export const KEEPER_UNLIMITED_ENTITLEMENTS: KeeperEntitlements = Object.freeze({ planCode: "keeper_unlimited_v1", maxVehicles: null, canExportPdf: true, lifetimeUpgrade: true });

export function getKeeperEntitlements(serverEntitlements: ReadonlySet<string> = new Set()): KeeperEntitlements {
  if (serverEntitlements.has(KEEPER_UNLIMITED_ENTITLEMENT)) return KEEPER_UNLIMITED_ENTITLEMENTS;
  if (serverEntitlements.has(KEEPER_UNLOCK_ENTITLEMENT) || LEGACY_PAID_ENTITLEMENTS.some((key) => serverEntitlements.has(key))) return KEEPER_UNLOCK_ENTITLEMENTS;
  return KEEPER_FREE_ENTITLEMENTS;
}

export function canAddVehicle(entitlements: KeeperEntitlements, currentVehicleCount: number) {
  return entitlements.maxVehicles === null || currentVehicleCount < entitlements.maxVehicles;
}

export function canExportPdf(entitlements: KeeperEntitlements) {
  return entitlements.canExportPdf;
}

export function vehicleSlotLabel(entitlements: KeeperEntitlements, currentVehicleCount: number) {
  return entitlements.maxVehicles === null
    ? "Unlimited vehicles"
    : `${currentVehicleCount} of ${entitlements.maxVehicles} vehicle slots used`;
}

export function checkoutProductsForPlan(planCode: KeeperPlanCode): KeeperProductCode[] {
  if (planCode === "free") return ["keeper_unlock_v1", "keeper_unlimited_v1"];
  if (planCode === "keeper_unlock_v1") return ["keeper_unlimited_upgrade_v1"];
  return [];
}
