import type { User } from "@supabase/supabase-js";
import type { KeeperPlanId } from "./plans";
import { getKeeperPlan } from "./plans";

export type AccountKind = "guest" | "legacy" | "setup" | "account";

export type EntitlementKey =
  | "authenticated_account"
  | "keeper_1"
  | "keeper_1_export"
  | "keeper_3"
  | "keeper_3_export";

export type AccountAccess = {
  planId: KeeperPlanId | null;
  vehicleSlots: number;
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
    user.email
    || user.phone
    || user.identities?.some((identity) => identity.provider !== "anonymous"),
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

const keeperPlanIds: KeeperPlanId[] = [
  "keeper_3_export",
  "keeper_3",
  "keeper_1_export",
  "keeper_1",
];

function isKeeperPlanId(value: string | null): value is KeeperPlanId {
  return value !== null && keeperPlanIds.includes(value as KeeperPlanId);
}

function activeKeeperPlan(
  entitlements: ReadonlySet<string>,
): KeeperPlanId | null {
  if (import.meta.env.DEV) {
    const devPlan = localStorage.getItem("keeper-dev-plan");

    if (isKeeperPlanId(devPlan)) {
      return devPlan;
    }
  }

  return keeperPlanIds.find((planId) => entitlements.has(planId)) ?? null;
}

// REVIEW DECISION:
// Every account-only capability resolves here.
// Stripe/Supabase subscription entitlements can plug into this later
// without scattering premium checks across Keeper.
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
      planId: null,
      vehicleSlots: 0,
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
      planId: null,
      vehicleSlots: 0,
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
      planId: null,
      vehicleSlots: 0,
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  const planId = activeKeeperPlan(entitlements);
  const plan = planId ? getKeeperPlan(planId) : null;

  return {
    kind: "account",
    label: "Keeper Account",
    description:
      "Your garage is stored in Supabase and follows this Keeper Profile across devices.",

    planId,
    vehicleSlots: plan?.vehicleSlots ?? 0,

    canExploreDemo: true,
    canSaveGarage: true,
    canSaveMileage: true,
    canSaveMaintenance: true,
    canCustomize: true,
    canSync: true,

    // Keep existing account behavior until the paywall is deliberately enabled.
    canExport: true,
    canDownloadPdf: true,
  };
}