import type { User } from "@supabase/supabase-js";
import type { KeeperPlanId } from "./plans";
import { getKeeperPlan } from "./plans";

export type AccountKind = "guest" | "legacy" | "setup" | "account";

export type EntitlementKey =
  | "authenticated_account"
  | "basic_traffic"
  | "project_car"
  | "collector";

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

const keeperPlanIds: KeeperPlanId[] = [
  "collector",
  "project_car",
  "basic_traffic",
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

  const planId = activeKeeperPlan(entitlements) ?? "basic_traffic";
  const plan = getKeeperPlan(planId);

  const isBasic = planId === "basic_traffic";

  return {
    kind: "account",
    label: plan.name,
    description: isBasic
      ? "Save one vehicle and access Keeper's researched facts, known issues, and ownership intelligence."
      : "Your garage is stored in Supabase and follows this Keeper Profile across devices.",

    planId,
    vehicleSlots: plan.vehicleSlots,

    canExploreDemo: true,
    canSaveGarage: true,

    // Basic Traffic can save one vehicle, but cannot actively manage ownership records.
    canSaveMileage: !isBasic,
    canSaveMaintenance: !isBasic,
    canCustomize: !isBasic,

    canSync: true,
    canExport: plan.canExport,
    canDownloadPdf: plan.canExport,
  };
}