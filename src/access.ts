import type { User } from "@supabase/supabase-js";

export type AccountKind = "visitor" | "guest" | "member";

export type AccountAccess = {
  kind: AccountKind;
  label: string;
  description: string;
  canSaveGarage: boolean;
  canRecoverGarage: boolean;
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

// REVIEW DECISION: account capabilities live in one resolver so a future server-verified subscription can replace these free-tier rules without scattering paywall checks through the UI.
export function getAccountAccess(user: User | null): AccountAccess {
  if (!user) {
    return {
      kind: "visitor",
      label: "Visitor · public research",
      description: "Browse every maintenance and issue page. Sign in or start a guest session before saving a vehicle.",
      canSaveGarage: false,
      canRecoverGarage: false,
      canDownloadPdf: false,
    };
  }

  if (isTemporaryGuest(user)) {
    return {
      kind: "guest",
      label: "Guest · temporary garage",
      description: "Vehicles are protected in Supabase, but this garage cannot be recovered after signing out or clearing this browser until you link Google or email.",
      canSaveGarage: true,
      canRecoverGarage: false,
      canDownloadPdf: false,
    };
  }

  return {
    kind: "member",
    label: "Member · recoverable garage",
    description: "Your saved vehicles follow your account across devices. Completed service history can be exported as a print-ready PDF or shareable image.",
    canSaveGarage: true,
    canRecoverGarage: true,
    canDownloadPdf: true,
  };
}
