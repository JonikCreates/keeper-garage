import type { User } from "@supabase/supabase-js";

export type AccountKind = "guest" | "legacy" | "setup" | "account";
export type EntitlementKey = "authenticated_account";

export type AccountAccess = {
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

// REVIEW DECISION: every account-only capability resolves here. A future subscription can replace the server-issued entitlement without scattering premium checks across Keeper.
export function getAccountAccess(user: User | null, entitlements: ReadonlySet<string> = new Set()): AccountAccess {
  if (!user) {
    return {
      kind: "guest",
      label: "Guest Mode · demo only",
      description: "Explore Keeper with a sample vehicle. Guest changes are not stored, synced, or exportable.",
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  if (isTemporaryGuest(user)) {
    return {
      kind: "legacy",
      label: "Existing garage found · read only",
      description: "This older anonymous garage is preserved and read-only. Sign in or create a Profile, then choose whether to import it.",
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  if (!entitlements.has("authenticated_account")) {
    return {
      kind: "setup",
      label: "Keeper Profile · setup required",
      description: "Review the current Terms and Privacy notice to activate account features.",
      canExploreDemo: true,
      ...noPersistentAccess,
    };
  }

  return {
    kind: "account",
    label: "Keeper Account",
    description: "Your garage is stored in Supabase and follows this Keeper Profile across devices.",
    canExploreDemo: true,
    canSaveGarage: true,
    canSaveMileage: true,
    canSaveMaintenance: true,
    canCustomize: true,
    canSync: true,
    canExport: true,
    canDownloadPdf: true,
  };
}
