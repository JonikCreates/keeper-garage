import type { User } from "@supabase/supabase-js";
import {
  getKeeperEntitlements,
  type KeeperEntitlements,
} from "./keeperEntitlements";

export type AccountKind = "guest" | "legacy" | "setup" | "account";
export type EntitlementKey =
  | "authenticated_account"
  | "keeper_lifetime";

export type AccountAccess = {
  keeper: KeeperEntitlements;
  kind: AccountKind;
  label: string;
  description: string;
  canExploreDemo: boolean;
  canSaveGarage: boolean;
  canSaveMileage: boolean;
  canSaveMaintenance: boolean;
  canCustomize: boolean;
  canSync: boolean;
  canExport: boolean;
  canDownloadPdf: boolean;
};

export function isTemporaryGuest(user: User | null) {
  if (!user) return false;
  const hasRecoverableIdentity = Boolean(
    user.email ||
      user.phone ||
      user.identities?.some((identity) => identity.provider !== "anonymous"),
  );
  return Boolean(user.is_anonymous && !hasRecoverableIdentity);
}

export function isPermanentIdentity(user: User | null) {
  return Boolean(user && !isTemporaryGuest(user));
}

const noPersistentAccess = {
  canSaveGarage: false,
  canSaveMileage: false,
  canSaveMaintenance: false,
  canCustomize: false,
  canSync: false,
  canExport: false,
  canDownloadPdf: false,
};

export function getAccountAccess(
  user: User | null,
  entitlements: ReadonlySet<string> = new Set(),
): AccountAccess {
  if (!user) {
    return {
      kind: "guest",
      label: "Guest Mode · demo only",
      description:
        "Explore Keeper with a sample vehicle. Guest changes are not stored, synced, or exportable.",
      keeper: { ...getKeeperEntitlements(), maxVehicles: 0 },
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  if (isTemporaryGuest(user)) {
    return {
      kind: "legacy",
      label: "Existing garage found · read only",
      description:
        "This older anonymous garage is preserved and read-only. Sign in or create a Profile, then choose whether to import it.",
      keeper: { ...getKeeperEntitlements(), maxVehicles: 0 },
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  if (!entitlements.has("authenticated_account")) {
    return {
      kind: "setup",
      label: "Keeper Profile · setup required",
      description:
        "Review the current Terms and Privacy notice to activate account features.",
      keeper: { ...getKeeperEntitlements(), maxVehicles: 0 },
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  const keeper = getKeeperEntitlements(entitlements);

  return {
    kind: "account",
    label: keeper.lifetimeUpgrade ? "Keeper Upgraded" : "Keeper Free",
    description: keeper.lifetimeUpgrade
      ? "Lifetime upgrade active. Three vehicle slots and PDF export are unlocked."
      : "Track your first car free with full Keeper garage and maintenance functionality.",
    keeper,
    canExploreDemo: true,
    canSaveGarage: true,
    canSaveMileage: true,
    canSaveMaintenance: true,
    canCustomize: true,
    canSync: true,
    canExport: true,
    canDownloadPdf: keeper.canExportPdf,
  };
}
