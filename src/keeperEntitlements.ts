export const KEEPER_LIFETIME_ENTITLEMENT = "keeper_lifetime";

// These server-issued keys are read only to preserve access for pre-restructure paid testers.
// New purchases grant keeper_lifetime and never create another plan name.
const LEGACY_PAID_ENTITLEMENTS = new Set(["project_car", "collector"]);

export type KeeperEntitlements = {
  maxVehicles: number;
  canExportPdf: boolean;
  lifetimeUpgrade: boolean;
};

export const KEEPER_FREE_ENTITLEMENTS: KeeperEntitlements = Object.freeze({
  maxVehicles: 1,
  canExportPdf: false,
  lifetimeUpgrade: false,
});

export const KEEPER_UPGRADED_ENTITLEMENTS: KeeperEntitlements = Object.freeze({
  maxVehicles: 3,
  canExportPdf: true,
  lifetimeUpgrade: true,
});

export function getKeeperEntitlements(
  serverEntitlements: ReadonlySet<string> = new Set(),
): KeeperEntitlements {
  const upgraded = serverEntitlements.has(KEEPER_LIFETIME_ENTITLEMENT)
    || [...LEGACY_PAID_ENTITLEMENTS].some((key) => serverEntitlements.has(key));

  return upgraded ? KEEPER_UPGRADED_ENTITLEMENTS : KEEPER_FREE_ENTITLEMENTS;
}

export function canAddVehicle(entitlements: KeeperEntitlements, currentVehicleCount: number) {
  return currentVehicleCount < entitlements.maxVehicles;
}

export function canExportPdf(entitlements: KeeperEntitlements) {
  return entitlements.canExportPdf;
}
