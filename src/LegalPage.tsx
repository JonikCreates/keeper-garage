import { keeperLegalConfig, legalPageLabel, PRIVACY_VERSION, TERMS_VERSION, type LegalPageKind } from "./legal";

type LegalPageProps = {
  page: LegalPageKind;
  onOpenAccount: () => void;
};

const frameworkNotice = "Pre-launch legal framework — not attorney-approved final language.";

export function LegalPage({ page, onOpenAccount }: LegalPageProps) {
  const title = legalPageLabel[page];
  return <section className="legal-page" aria-labelledby="legal-page-title">
    <header className="legal-hero">
      <p className="eyebrow">Keeper Garage · public document</p>
      <h1 id="legal-page-title">{title}</h1>
      <p>{frameworkNotice} This page is deliberately replaceable without changing Keeper&apos;s account or consent architecture.</p>
    </header>

    {page === "terms" && <div className="legal-document">
      <p className="legal-version">Terms version {TERMS_VERSION}</p>
      <section><h2>Keeper&apos;s role</h2><p>Keeper provides vehicle-record organization, maintenance planning, and automotive information. It is not a professional mechanic, vehicle inspection, safety certification, warranty, manufacturer service manual, or guarantee that a vehicle is safe or that a recommendation fits every vehicle.</p></section>
      <section><h2>Use automotive information carefully</h2><p>Vehicle configuration, market, production date, modifications, repairs, and incomplete records can change what applies. Important maintenance, fluid, recall, part, and safety decisions should be checked against VIN-specific manufacturer information, service manuals, and qualified repair professionals.</p></section>
      <section><h2>Account and user-entered records</h2><p>Account holders are responsible for their sign-in methods and for the accuracy of information they enter. Keeper does not independently verify that user-entered maintenance or repairs were completed.</p></section>
      <section><h2>Attorney-review placeholders</h2><p>Before commercial launch, counsel should complete provisions covering acceptable use, availability, intellectual property, user data, termination, subscriptions, refunds, warranties, liability, disputes, governing law, and changes to these terms. Keeper does not add arbitration or class-action waivers through this draft.</p></section>
    </div>}

    {page === "privacy" && <div className="legal-document">
      <p className="legal-version">Privacy version {PRIVACY_VERSION}</p>
      <section><h2>Data Keeper currently needs</h2><p>Keeper may process an account email, display name, authentication state handled by Supabase, and garage information such as vehicles, mileage, maintenance, repairs, fluids, notes, and owner-tracked issues.</p></section>
      <section><h2>Why it is used</h2><p>Account information identifies the Keeper Profile. Garage information provides syncing and record-keeping. Limited technical information may be used to operate, secure, diagnose, and prevent abuse of the service.</p></section>
      <section><h2>Data minimization</h2><p>Keeper does not currently request a home address, phone number, date of birth, precise location, contacts, driver&apos;s-license data, or payment information. Future collection requires a genuine product need and updated disclosure.</p></section>
      <section><h2>Storage and control</h2><p>Authenticated garage records are stored in Supabase with owner-isolated database policies. Theme and temporary interface preferences may stay in the browser. The final retention, deletion, processor, legal-basis, and regional-rights language still requires attorney review.</p></section>
    </div>}

    {page === "contact" && <div className="legal-document">
      <section><h2>Contact configuration pending</h2><p>Keeper has not yet been given a legal business name, support email, privacy contact, business mailing address, or governing jurisdiction. These values have not been invented.</p></section>
      <dl className="contact-placeholder-list">
        <div><dt>Legal/business name</dt><dd>{keeperLegalConfig.legalName ?? "To be provided"}</dd></div>
        <div><dt>Support email</dt><dd>{keeperLegalConfig.supportEmail ?? "To be provided"}</dd></div>
        <div><dt>Privacy contact</dt><dd>{keeperLegalConfig.privacyEmail ?? "To be provided"}</dd></div>
        <div><dt>Mailing information</dt><dd>{keeperLegalConfig.mailingAddress ?? "To be reviewed"}</dd></div>
        <div><dt>Jurisdiction</dt><dd>{keeperLegalConfig.governingJurisdiction ?? "Attorney review required"}</dd></div>
      </dl>
    </div>}

    <aside className="legal-account-cta"><div><span>Keeper Profile</span><strong>Your garage, stored under your account.</strong></div><button className="button button-primary" onClick={onOpenAccount}>Open Profile</button></aside>
  </section>;
}
