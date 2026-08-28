export const TERMS_VERSION = "2026-08-28";
export const PRIVACY_VERSION = "2026-08-28";
export const LEGAL_LAST_UPDATED = "August 28, 2026";
export const KEEPER_SUPPORT_EMAIL = "support@keeperauto.com";

export const keeperLegalConfig = {
  legalName: null as string | null,
  supportEmail: KEEPER_SUPPORT_EMAIL,
  privacyEmail: KEEPER_SUPPORT_EMAIL,
  mailingAddress: null as string | null,
  governingJurisdiction: null as string | null,
};

export type LegalPageKind = "terms" | "privacy" | "contact";

export const legalPageLabel: Record<LegalPageKind, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  contact: "Contact",
};
