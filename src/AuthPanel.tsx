import { useEffect, useState, type FormEvent } from "react";
import type { ReturnTypeKeeperAuth } from "./authTypes";
import { PRIVACY_VERSION, TERMS_VERSION } from "./legal";
import { useKeeperProfile } from "./useKeeperProfile";

type SignedOutView = "login" | "signup" | "forgot" | "verify";
type AccountTab = "profile" | "security";

type AuthPanelProps = {
  auth: ReturnTypeKeeperAuth;
  open: boolean;
  intent?: "account" | "save" | "export";
  onClose: () => void;
};

function GoogleButton({ label, configured, disabled = false, busy, onClick }: { label: string; configured: boolean; disabled?: boolean; busy: boolean; onClick: () => void }) {
  return <button className="provider-button google" type="button" disabled={busy || disabled || !configured} onClick={onClick}>
    <span className="provider-mark" aria-hidden="true">G</span><span>{configured ? label : "Google setup required"}</span><b>↗</b>
  </button>;
}

function LegalAgreement({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="legal-consent">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span>I agree to the <a href="#terms" target="_blank">Terms of Service</a> and <a href="#privacy" target="_blank">Privacy Policy</a>.</span>
  </label>;
}

function passwordProblem(password: string, confirmation: string) {
  if (password.length < 10) return "Use at least 10 characters for your password.";
  if (password !== confirmation) return "The passwords do not match.";
  return null;
}

export function AuthPanel({ auth, open, intent = "account", onClose }: AuthPanelProps) {
  const requestedView = new URLSearchParams(window.location.search).get("account");
  const [view, setView] = useState<SignedOutView>(requestedView === "verify" ? "verify" : "login");
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const profile = useKeeperProfile(auth.access.kind === "account" ? auth.user : null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setLocalError(null);
      setDeleteOpen(false);
      setDeleteConfirmation("");
    });
  }, [open]);

  if (!open) return null;

  const intentCopy = intent === "export"
    ? { title: "Export Your Garage Records", body: "A Keeper Profile is required to save and export vehicle records." }
    : intent === "save"
      ? { title: "Create a Keeper Profile", body: "Sign in or create an account to save maintenance records and access your garage from any device." }
      : { title: "Keeper Garage", body: "Your garage. Anywhere." };

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (await auth.signIn(email.trim(), password)) {
      setPassword("");
      window.location.hash = "profile";
    }
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = passwordProblem(password, confirmPassword);
    if (!displayName.trim()) return setLocalError("Enter a display name.");
    if (!acceptedLegal) return setLocalError("You must agree to the Terms and Privacy Policy to create a Keeper Profile.");
    if (problem) return setLocalError(problem);
    setLocalError(null);
    if (await auth.signUp(displayName.trim(), email.trim(), password)) {
      setPassword("");
      setConfirmPassword("");
      setView("verify");
    }
  }

  async function submitRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    await auth.requestPasswordReset(email.trim());
  }

  async function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = passwordProblem(password, confirmPassword);
    if (problem) return setLocalError(problem);
    setLocalError(null);
    if (await auth.updatePassword(password, currentPassword || undefined)) {
      setPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    }
  }

  async function submitLegacyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!displayName.trim()) return setLocalError("Enter a display name.");
    if (!acceptedLegal) return setLocalError("Agree to the current Terms and Privacy Policy before upgrading this garage.");
    setLocalError(null);
    await auth.beginLegacyEmailUpgrade(displayName.trim(), email.trim());
  }

  const accountName = profile.displayName || auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  const joinedDate = auth.user?.created_at
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(auth.user.created_at))
    : null;

  return <div className="auth-backdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <header><div><p className="eyebrow">Keeper Profile</p><h2 id="auth-title">{auth.user ? "Your garage identity." : intentCopy.title}</h2><p>{!auth.user && intentCopy.body}</p></div><button className="close-button" onClick={onClose} aria-label="Close account panel">×</button></header>

      {!auth.configured && <div className="auth-notice error">Authentication is not configured in this build. Guest Mode remains demo-only.</div>}
      {auth.configured && (!auth.ready || !auth.capabilitiesReady) && <div className="auth-notice">Checking secure account access…</div>}

      {auth.configured && auth.ready && auth.capabilitiesReady && !auth.user && view === "login" && <div className="signed-out-stack">
        <form className="account-form auth-primary-form" onSubmit={submitLogin}>
          <span>Welcome back</span><h3>Log in to Keeper</h3>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          <button className="button button-primary" disabled={auth.busy}>{auth.busy ? "Signing in…" : "Log In"}</button>
          <button className="text-button" type="button" onClick={() => setView("forgot")}>Forgot Password?</button>
        </form>
        <div className="auth-divider"><span>or</span></div>
        <GoogleButton label="Continue with Google" configured={auth.capabilities.google} busy={auth.busy} onClick={() => void auth.signInWithProvider("google")} />
        <div className="auth-switch"><span>Don&apos;t have a Keeper Profile?</span><button type="button" onClick={() => { setView("signup"); setLocalError(null); }}>Create Account</button></div>
        <article className="guest-mode-note"><strong>Explore without an account</strong><p>Close this panel to use the Demo Garage. Guest Mode cannot permanently save, sync, or export records.</p></article>
      </div>}

      {auth.configured && auth.ready && !auth.user && view === "signup" && <div className="signed-out-stack">
        <form className="account-form auth-primary-form" onSubmit={submitSignup}>
          <span>New Keeper account</span><h3>Create Your Keeper Profile</h3><p>Build your garage and access it from any device.</p>
          <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} autoComplete="name" required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label>
          <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label>
          <LegalAgreement checked={acceptedLegal} onChange={setAcceptedLegal} />
          <button className="button button-primary" disabled={auth.busy || !acceptedLegal}>{auth.busy ? "Creating…" : "Create Account"}</button>
        </form>
        <div className="auth-divider"><span>or create with Google</span></div>
        <GoogleButton label="Create with Google" configured={auth.capabilities.google} disabled={!acceptedLegal} busy={auth.busy} onClick={() => void auth.signInWithProvider("google", true)} />
        <div className="auth-switch"><span>Already have a Keeper Profile?</span><button type="button" onClick={() => setView("login")}>Log In</button></div>
      </div>}

      {auth.configured && auth.ready && !auth.user && view === "forgot" && <form className="account-form auth-primary-form" onSubmit={submitRecovery}>
        <span>Account recovery</span><h3>Reset your password</h3><p>Enter your account email. Keeper uses a generic response so this page does not reveal whether an address has an account.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <button className="button button-primary" disabled={auth.busy}>{auth.busy ? "Sending…" : "Send Reset Link"}</button>
        <button className="text-button" type="button" onClick={() => setView("login")}>Back to Log In</button>
      </form>}

      {auth.configured && auth.ready && !auth.user && view === "verify" && <form className="account-form auth-primary-form" onSubmit={(event) => { event.preventDefault(); void auth.resendVerification(email.trim()); }}>
        <span>Email verification</span><h3>Check your inbox</h3><p>Open the verification link before signing in. Expired link? Enter the same address and request a replacement.</p>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
        <button className="button button-quiet" disabled={auth.busy}>Resend Verification</button>
        <button className="text-button" type="button" onClick={() => setView("login")}>Return to Log In</button>
      </form>}

      {auth.user && auth.isLegacyGuest && <div className="account-center legacy-upgrade">
        <div className="legacy-found-banner"><span>Existing garage found</span><h3>Your records are preserved.</h3><p>This older anonymous garage is now read-only. Upgrade in place to keep the same owner ID and every saved vehicle, maintenance item, and completed record.</p></div>
        <LegalAgreement checked={acceptedLegal} onChange={setAcceptedLegal} />
        <GoogleButton label="Connect Google & Keep Garage" configured={auth.capabilities.google} disabled={!acceptedLegal} busy={auth.busy} onClick={() => void auth.linkProvider("google")} />
        <div className="auth-divider"><span>or verify email</span></div>
        <form className="account-form" onSubmit={submitLegacyEmail}>
          <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} autoComplete="name" required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <button className="button button-primary" disabled={auth.busy || !acceptedLegal}>Verify Email & Keep Garage</button>
        </form>
        <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Leave legacy garage and return to Demo Mode</button>
      </div>}

      {auth.user && auth.access.kind === "setup" && <div className="account-center">
        <div className="account-summary"><div className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</div><div><span>Keeper Profile</span><strong>{accountName}</strong><small>Account activation required</small></div></div>
        <section className="account-form legal-activation"><span>Current legal documents</span><h3>Finish setting up Keeper</h3><p>Review the current pre-launch Terms and Privacy notice. Acceptance is stored with document versions and a server timestamp.</p><LegalAgreement checked={acceptedLegal} onChange={setAcceptedLegal} /><button className="button button-primary" disabled={!acceptedLegal || auth.busy} onClick={() => void auth.acceptLegal()}>Activate Keeper Profile</button><small>Terms {TERMS_VERSION} · Privacy {PRIVACY_VERSION}</small></section>
        <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Log Out</button>
      </div>}

      {auth.user && auth.access.kind === "account" && <div className="account-center">
        <div className="account-summary"><div className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</div><div><span>{auth.access.label}</span><strong>{accountName}</strong><small>{joinedDate ? `Joined ${joinedDate}` : "Synced account"}</small></div></div>
        <div className="account-access-note account"><strong>Current access</strong><p>{auth.access.description}</p></div>
        <nav className="account-tabs" aria-label="Account settings"><button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button><button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>Security</button></nav>

        {activeTab === "profile" && <section className="account-tab-panel">
          <div className="tab-heading"><span>Keeper identity</span><h3>Your profile</h3><p>This display name appears only within your Keeper experience.</p></div>
          <form className="account-form" onSubmit={(event) => { event.preventDefault(); void profile.save(); }}><label>Display name<input value={profile.displayName} onChange={(event) => profile.setDisplayName(event.target.value)} maxLength={60} autoComplete="name" required /></label><label>Account email<input value={auth.user?.email ?? "No email available"} disabled /></label><button className="button button-primary" disabled={profile.loading || profile.saving}>{profile.saving ? "Saving…" : "Save Profile"}</button></form>
          <nav className="account-legal-links"><a href="#terms">Terms of Service</a><a href="#privacy">Privacy Policy</a></nav>
        </section>}

        {activeTab === "security" && <section className="account-tab-panel security-panel">
          <div className="tab-heading"><span>Account access</span><h3>Security</h3><p>Passwords remain within Supabase Auth. Keeper never stores them in garage tables.</p></div>
          <form className="security-section account-form" onSubmit={(event) => { event.preventDefault(); void auth.changeEmail(email.trim()); }}><div className="security-section-heading"><div><span>Email</span><strong>{auth.user.email ?? "No email"}</strong></div><small>{auth.user.email_confirmed_at ? "Verified" : "Unverified"}</small></div><label>New email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><button className="button button-quiet" disabled={auth.busy}>Change Email</button></form>
          <form className="security-section account-form" onSubmit={submitNewPassword}><div className="security-section-heading"><div><span>Password</span><strong>Change password</strong></div><small>Supabase Auth</small></div><label>Current password (if required)<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><button className="button button-quiet" disabled={auth.busy}>Change Password</button></form>
          {!auth.linkedProviders.includes("google") && <div className="security-section"><div className="security-section-heading"><div><span>Recovery option</span><strong>Google</strong></div><small>Optional</small></div><GoogleButton label="Connect Google" configured={auth.capabilities.google} busy={auth.busy} onClick={() => void auth.linkProvider("google")} /></div>}
          <div className="security-proof"><b>Owner-only data</b><p>Supabase Row Level Security verifies the active account and vehicle ownership on every garage request.</p></div>
          <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Log Out</button>
          <div className="account-danger-zone"><button type="button" onClick={() => setDeleteOpen((value) => !value)}>Request Account Deletion</button>{deleteOpen && <div><p>This requests deletion review for the Profile, vehicles, maintenance history, notes, and garage records. It does not delete anything immediately.</p><label>Type DELETE to confirm<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} /></label><button className="button button-danger" disabled={deleteConfirmation !== "DELETE" || auth.busy} onClick={() => void auth.requestAccountDeletion()}>Submit Deletion Request</button></div>}</div>
        </section>}
      </div>}

      {auth.user && (auth.recoveryMode || requestedView === "legacy-password") && <form className="account-form recovery-overlay" onSubmit={submitNewPassword}><span>Secure account update</span><h3>{requestedView === "legacy-password" ? "Create a password" : "Choose a new password"}</h3><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><button className="button button-primary" disabled={auth.busy}>Save Password</button></form>}

      {auth.message && <div className="auth-notice success">{auth.message}</div>}
      {(auth.error || localError || profile.error) && <div className="auth-notice error">{auth.error ?? localError ?? "Keeper couldn't update the profile."}</div>}
      {profile.message && <div className="auth-notice success">{profile.message}</div>}
      <footer><p>Supabase handles authentication and session security. Keeper stores only the public browser key—never a service-role key or password.</p></footer>
    </section>
  </div>;
}
