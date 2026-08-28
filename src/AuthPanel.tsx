import { useEffect, useState, type FormEvent } from "react";
import type { ReturnTypeKeeperAuth } from "./authTypes";
import { PRIVACY_VERSION, TERMS_VERSION } from "./legal";
import { useKeeperProfile } from "./useKeeperProfile";
import { pageHref } from "./routing";
import { KeeperLogo } from "./KeeperBrand";

type SignedOutView = "login" | "signup" | "forgot" | "verify";
type AccountTab = "profile" | "security";
export type AuthIntent = "account" | "save" | "export" | "signin" | "signup";

type AuthPanelProps = {
  auth: ReturnTypeKeeperAuth;
  open: boolean;
  intent?: AuthIntent;
  onClose: () => void;
};

function GoogleButton({ configured, disabled = false, busy, onClick }: { configured: boolean; disabled?: boolean; busy: boolean; onClick: () => void }) {
  return <button className="provider-button google" type="button" disabled={busy || disabled || !configured} onClick={onClick}>
    <span className="provider-mark" aria-hidden="true">G</span><span>{configured ? "Continue with Google" : "Google setup required"}</span><b>↗</b>
  </button>;
}

function LegalAgreement({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="legal-consent">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span>I agree to the <a href={pageHref("terms")} target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href={pageHref("privacy")} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</span>
  </label>;
}

function passwordProblem(password: string, confirmation: string) {
  if (password.length < 10) return "Use at least 10 characters for your password.";
  if (password !== confirmation) return "The passwords do not match.";
  return null;
}

function initialView(intent: AuthIntent): SignedOutView {
  return intent === "signup" || intent === "save" ? "signup" : "login";
}

export function AuthPanel({ auth, open, intent = "account", onClose }: AuthPanelProps) {
  const requestedView = new URLSearchParams(window.location.search).get("account");
  const [view, setView] = useState<SignedOutView>(requestedView === "verify" ? "verify" : initialView(intent));
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [accountConflict, setAccountConflict] = useState(false);
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
  }, [onClose, open]);

  if (!open) return null;

  const accountName = profile.displayName || auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  const joinedDate = auth.user?.created_at ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(auth.user.created_at)) : null;
  const showAuthChoice = auth.ready && (!auth.user || auth.isLegacyGuest);
  const showRecovery = Boolean(auth.user && auth.recoveryMode);

  function switchView(nextView: SignedOutView) {
    setView(nextView);
    setAccountConflict(false);
    setLocalError(null);
    auth.clearStatus();
  }

  async function submitSignIn(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    await auth.signIn(email.trim(), password);
  }

  async function submitSignUp(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setAccountConflict(false);
    const problem = passwordProblem(password, confirmPassword);
    if (problem) {
      setLocalError(problem);
      return;
    }
    const result = await auth.signUp(displayName.trim(), email.trim(), password);
    if (result === "existing") {
      setAccountConflict(true);
      setLocalError("A Keeper Profile may already use this email. Sign in without retyping it.");
      return;
    }
    if (result === "created") setView("verify");
  }

  async function submitForgot(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    await auth.requestPasswordReset(email.trim());
  }

  async function submitNewPassword(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const problem = passwordProblem(password, confirmPassword);
    if (problem) {
      setLocalError(problem);
      return;
    }
    await auth.updatePassword(password, currentPassword || undefined);
  }

  return <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <header><div><KeeperLogo className="auth-brand-logo" context="auto" /><p>Keeper Profile</p><h2 id="auth-title">{showAuthChoice ? "Your garage. Your profile." : auth.legacyClaim ? "Existing garage found." : showRecovery ? "Secure account update." : "Your Keeper Profile."}</h2><p>{showAuthChoice ? "Sign in to your garage or create a profile. Both paths are equally available." : auth.legacyClaim ? "Choose whether to import the garage previously stored on this device." : "Manage the identity that owns your garage records."}</p></div><button onClick={onClose} aria-label="Close account panel">×</button></header>

      {!auth.configured && <div className="auth-notice">Authentication is not configured in this build. Guest Mode remains demo-only.</div>}
      {auth.configured && !auth.ready && <div className="auth-loading" role="status"><span className="auth-loading-mark" />Checking your Keeper session…</div>}

      {showAuthChoice && <div className="auth-choice-shell">
        {auth.isLegacyGuest && <div className="legacy-found-banner"><span>Existing garage found</span><h3>Your records are preserved.</h3><p>Sign in or create an account first. Keeper will then ask before importing anything into that Profile.</p></div>}

        {view !== "forgot" && view !== "verify" && <div className="auth-mode-tabs" role="tablist" aria-label="Keeper authentication">
          <button type="button" role="tab" aria-selected={view === "login"} className={view === "login" ? "active" : ""} onClick={() => switchView("login")}>Sign In</button>
          <button type="button" role="tab" aria-selected={view === "signup"} className={view === "signup" ? "active" : ""} onClick={() => switchView("signup")}>Create Account</button>
        </div>}

        {view === "login" && <div className="auth-mode-content">
          <form className="account-form auth-primary-form" onSubmit={submitSignIn}>
            <span>Welcome back</span><h3>Sign in to access your Keeper Garage.</h3>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
            <button className="forgot-password-link" type="button" onClick={() => switchView("forgot")}>Forgot Password?</button>
            <button className="button button-primary" disabled={auth.busy}>{auth.busy ? "Signing in…" : "Sign In"}</button>
          </form>
          <div className="auth-divider"><span>or</span></div>
          <GoogleButton configured={auth.capabilities.google} busy={auth.busy} onClick={() => void auth.signInWithProvider("google")} />
          <p className="auth-mode-switch">Don&apos;t have an account? <button type="button" onClick={() => switchView("signup")}>Create one</button></p>
        </div>}

        {view === "signup" && <div className="auth-mode-content">
          <form className="account-form auth-primary-form" onSubmit={submitSignUp}>
            <span>New Keeper account</span><h3>Create Your Keeper Profile</h3>
            <label>Display Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} autoComplete="name" required /></label>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label>
            <label>Confirm Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label>
            <LegalAgreement checked={acceptedLegal} onChange={setAcceptedLegal} />
            <button className="button button-primary" disabled={auth.busy || !acceptedLegal}>{auth.busy ? "Creating…" : "Create Account"}</button>
          </form>
          {accountConflict && <button className="button button-conflict" type="button" onClick={() => switchView("login")}>Sign In to Existing Account</button>}
          <div className="auth-divider"><span>or</span></div>
          <GoogleButton configured={auth.capabilities.google} disabled={!acceptedLegal} busy={auth.busy} onClick={() => void auth.signInWithProvider("google", true)} />
          <p className="auth-mode-switch">Already have a Keeper account? <button type="button" onClick={() => switchView("login")}>Sign in</button></p>
        </div>}

        {view === "forgot" && <form className="account-form auth-primary-form" onSubmit={submitForgot}>
          <span>Account recovery</span><h3>Reset your password</h3><p>Enter your account email. Keeper uses a generic response so this page does not reveal whether an address has an account.</p>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <button className="button button-primary" disabled={auth.busy}>{auth.busy ? "Sending…" : "Send Reset Link"}</button>
          <button className="text-button" type="button" onClick={() => switchView("login")}>Back to Sign In</button>
        </form>}

        {view === "verify" && <form className="account-form auth-primary-form" onSubmit={(event) => { event.preventDefault(); void auth.resendVerification(email.trim()); }}>
          <span>Email verification</span><h3>Check your inbox</h3><p>Open the verification link before signing in. Expired link? Enter the same address and request a replacement.</p>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <button className="button button-quiet" disabled={auth.busy}>Resend Verification</button>
          <button className="text-button" type="button" onClick={() => switchView("login")}>Return to Sign In</button>
        </form>}
      </div>}

      {auth.user && auth.access.kind === "setup" && !showRecovery && <div className="account-center">
        <div className="account-summary"><div className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</div><div><span>Keeper Profile</span><strong>{accountName}</strong><small>Account activation required</small></div></div>
        <section className="account-form legal-activation"><span>Current legal documents</span><h3>Finish setting up Keeper</h3><p>Review the current Terms and Privacy Policy. Acceptance is stored with document versions and a server timestamp.</p><LegalAgreement checked={acceptedLegal} onChange={setAcceptedLegal} /><button className="button button-primary" disabled={!acceptedLegal || auth.busy} onClick={() => void auth.acceptLegal()}>Activate Keeper Profile</button><small>Terms {TERMS_VERSION} · Privacy {PRIVACY_VERSION}</small></section>
        <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Log Out</button>
      </div>}

      {auth.user && auth.access.kind === "account" && auth.legacyClaim && !showRecovery && <div className="legacy-import-confirmation">
        <span>Existing garage found</span><h3>We found the garage currently stored on this device.</h3>
        <dl><div><dt>Vehicles</dt><dd>{auth.legacyClaim.vehicle_count}</dd></div><div><dt>Completed records</dt><dd>{auth.legacyClaim.maintenance_record_count}</dd></div><div><dt>Tracked items</dt><dd>{auth.legacyClaim.maintenance_item_count}</dd></div></dl>
        <p>Nothing is merged automatically. Importing transfers these records to the currently signed-in Keeper Profile. Repeating the same import cannot create duplicates.</p>
        <div><button className="button button-primary" disabled={auth.busy} onClick={() => void auth.claimLegacyGarage()}>{auth.busy ? "Importing…" : "Import into My Keeper Profile"}</button><button className="button button-quiet" disabled={auth.busy} onClick={auth.dismissLegacyClaim}>Leave Garage Unchanged</button></div>
      </div>}

      {auth.user && auth.access.kind === "account" && !auth.legacyClaim && !showRecovery && <div className="account-center">
        <div className="account-summary"><div className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</div><div><span>{auth.access.label}</span><strong>{accountName}</strong><small>{joinedDate ? `Joined ${joinedDate}` : "Synced account"}</small></div></div>
        <div className="account-access-note account"><strong>Current access</strong><p>{auth.access.description}</p></div>
        <nav className="account-tabs" aria-label="Account settings"><button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button><button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>Security</button></nav>

        {activeTab === "profile" && <section className="account-tab-panel">
          <div className="tab-heading"><span>Keeper identity</span><h3>Your profile</h3><p>This display name appears only within your Keeper experience.</p></div>
          <form className="account-form" onSubmit={(event) => { event.preventDefault(); void profile.save(); }}><label>Display Name<input value={profile.displayName} onChange={(event) => profile.setDisplayName(event.target.value)} maxLength={60} autoComplete="name" required /></label><label>Email<input value={auth.user?.email ?? "No email available"} disabled /></label><button className="button button-primary" disabled={profile.loading || profile.saving}>{profile.saving ? "Saving…" : "Edit Profile"}</button></form>
          <nav className="account-legal-links"><a href={pageHref("terms")}>Terms of Service</a><a href={pageHref("privacy")}>Privacy Policy</a></nav>
        </section>}

        {activeTab === "security" && <section className="account-tab-panel security-panel">
          <div className="tab-heading"><span>Account access</span><h3>Security</h3><p>Passwords remain within Supabase Auth. Keeper never stores them in garage tables.</p></div>
          <form className="security-section account-form" onSubmit={(event) => { event.preventDefault(); void auth.changeEmail(email.trim()); }}><div className="security-section-heading"><div><span>Email</span><strong>{auth.user.email ?? "No email"}</strong></div><small>{auth.user.email_confirmed_at ? "Verified" : "Unverified"}</small></div><label>New Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><button className="button button-quiet" disabled={auth.busy}>Change Email</button></form>
          <form className="security-section account-form" onSubmit={submitNewPassword}><div className="security-section-heading"><div><span>Password</span><strong>Change Password</strong></div><small>Supabase Auth</small></div><label>Current Password (if required)<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label><label>New Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><label>Confirm New Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><button className="button button-quiet" disabled={auth.busy}>Change Password</button></form>
          {!auth.linkedProviders.includes("google") && <div className="security-section"><div className="security-section-heading"><div><span>Recovery option</span><strong>Google</strong></div><small>Optional</small></div><GoogleButton configured={auth.capabilities.google} busy={auth.busy} onClick={() => void auth.linkProvider("google")} /></div>}
          <div className="security-proof"><b>Owner-only data</b><p>Supabase Row Level Security verifies the active account and vehicle ownership on every garage request.</p></div>
          <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Log Out</button>
          <div className="account-danger-zone"><button type="button" onClick={() => setDeleteOpen((value) => !value)}>Request Account Deletion</button>{deleteOpen && <div><p>This requests deletion review for the Profile, vehicles, maintenance history, notes, and garage records. It does not delete anything immediately.</p><label>Type DELETE to confirm<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} /></label><button className="button button-danger" disabled={deleteConfirmation !== "DELETE" || auth.busy} onClick={() => void auth.requestAccountDeletion()}>Submit Deletion Request</button></div>}</div>
        </section>}
      </div>}

      {showRecovery && <form className="account-form recovery-overlay" onSubmit={submitNewPassword}><span>Secure account update</span><h3>Choose a new password</h3><p>If this link is expired or invalid, return to Sign In and request a new reset email.</p><label>New Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><label>Confirm Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={10} autoComplete="new-password" required /></label><button className="button button-primary" disabled={auth.busy}>Save Password</button></form>}

      {auth.message && <div className="auth-notice success">{auth.message}</div>}
      {(auth.error || localError || profile.error) && <div className="auth-notice error">{auth.error ?? localError ?? "Keeper couldn't update the profile."}</div>}
      {profile.message && <div className="auth-notice success">{profile.message}</div>}
      <footer><p>Supabase handles authentication and session security. Keeper stores only the public browser key—never a service-role key or password.</p></footer>
    </section>
  </div>;
}
