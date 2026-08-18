export const TERMS_VERSION = "2026-08-16-prelaunch";
export const PRIVACY_VERSION = "2026-08-16-prelaunch";

export const keeperLegalConfig = {
  legalName: null as string | null,
  supportEmail: "support@keeperauto.com" as string | null,
  privacyEmail: null as string | null,
  mailingAddress: null as string | null,
  governingJurisdiction: null as string | null,
};

export type LegalPageKind = "terms" | "privacy" | "contact";

export const legalPageLabel: Record<LegalPageKind, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  contact: "Contact",
};
