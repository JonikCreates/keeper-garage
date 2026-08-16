import { useEffect, useState, type FormEvent } from "react";
import type { ReturnTypeKeeperAuth } from "./authTypes";
import { useKeeperProfile } from "./useKeeperProfile";
import type { AuthProvider } from "./supabase";

type AccountTab = "profile" | "security";

type AuthPanelProps = {
  auth: ReturnTypeKeeperAuth;
  open: boolean;
  onClose: () => void;
};

function ProviderButton({ provider, enabled, linked = false, busy, onClick }: {
  provider: AuthProvider;
  enabled: boolean;
  linked?: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  const name = "Google";
  return (
    <button className={`provider-button ${provider} ${linked ? "linked" : ""}`} disabled={busy || linked || !enabled} onClick={onClick}>
      <span className="provider-mark" aria-hidden="true">G</span>
      <span>{linked ? `${name} connected` : enabled ? `Continue with ${name}` : `${name} setup required`}</span>
      <b>{linked ? "✓" : "↗"}</b>
    </button>
  );
}

function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "");
}

export function AuthPanel({ auth, open, onClose }: AuthPanelProps) {
  const requestedTab = new URLSearchParams(window.location.search).get("account");
  const [activeTab, setActiveTab] = useState<AccountTab>(requestedTab === "security" ? "security" : "profile");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const profile = useKeeperProfile(auth.user);

  const joinedDate = auth.user?.created_at
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(auth.user.created_at))
    : null;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  async function submitLoginEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    await auth.sendMagicLink(email.trim());
  }

  async function submitEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    if (auth.isGuest) await auth.secureGuest(email.trim());
    else await auth.changeEmail(email.trim());
  }

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizePhone(phone);
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setLocalError("Use international format, such as +1 555 555 0123.");
      return;
    }
    setLocalError(null);
    if (await auth.changePhone(normalized)) setPhone(normalized);
  }

  async function submitPhoneCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(phoneCode)) {
      setLocalError("Enter the six-digit verification code.");
      return;
    }
    setLocalError(null);
    if (await auth.verifyPhone(phoneCode)) setPhoneCode("");
  }

  const accountName = profile.displayName || auth.user?.email || (auth.isGuest ? "Guest driver" : "Keeper driver");

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <header>
          <div>
            <p className="eyebrow">Keeper account</p>
            <h2 id="auth-title">{auth.user ? "Your garage identity." : "Welcome to Keeper."}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close account panel">×</button>
        </header>

        {!auth.configured && <div className="auth-notice error">Authentication is not configured in this build. The research library remains public.</div>}
        {auth.configured && (!auth.ready || !auth.capabilitiesReady) && <div className="auth-notice">Checking secure sign-in options…</div>}

        {auth.configured && auth.ready && auth.capabilitiesReady && !auth.user && (
          <div className="signed-out-stack">
            <section className="social-auth-block">
              <span>Member sign-in</span>
              <h3>Open a recoverable garage</h3>
              <p>Google authentication is handled by Google through Supabase. Keeper never receives or stores your Google password, and your garage can follow you across devices.</p>
              <div className="provider-list">
                <ProviderButton provider="google" enabled={auth.capabilities.google} busy={auth.busy} onClick={() => void auth.signInWithProvider("google")} />
              </div>
              {!auth.capabilities.google && <p className="provider-footnote">Google is waiting for its OAuth developer credentials to be enabled in Supabase.</p>}
            </section>

            <div className="auth-divider"><span>or use email</span></div>

            <form className="account-form" onSubmit={submitLoginEmail}>
              <span>Passwordless email</span>
              <h3>Email me a secure member link</h3>
              <p>No password to create, reuse, or forget. This creates the same recoverable member access as social sign-in.</p>
              <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
              <button className="button button-primary" disabled={auth.busy || !auth.capabilities.email}>{auth.busy ? "Sending…" : "Email me a sign-in link"}</button>
            </form>

            <div className="auth-divider"><span>or browse privately</span></div>

            <article className="auth-choice guest-choice">
              <span>Temporary access</span>
              <h3>Continue as guest on this browser</h3>
              <p>You can save vehicles immediately, but the anonymous account cannot be recovered after sign-out or cleared browser data until you connect email or Google.</p>
              <button className="button button-quiet" disabled={auth.busy || !auth.capabilities.anonymous} onClick={() => void auth.continueAsGuest()}>
                {auth.busy ? "Starting…" : "Continue as guest"}
              </button>
            </article>
          </div>
        )}

        {auth.user && (
          <div className="account-center">
            <div className="account-summary">
              <div className="account-avatar" aria-hidden="true">{accountName.slice(0, 1).toUpperCase()}</div>
              <div><span>{auth.access.label}</span><strong>{accountName}</strong><small>{joinedDate ? `Joined ${joinedDate}` : "Secure account"}</small></div>
            </div>
            <div className={`account-access-note ${auth.access.kind}`}><strong>Current access</strong><p>{auth.access.description}</p></div>

            <nav className="account-tabs" aria-label="Account settings">
              <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
              <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>Security</button>
            </nav>

            {activeTab === "profile" && (
              <section className="account-tab-panel" aria-labelledby="profile-tab-title">
                <div className="tab-heading"><span>Public-facing details</span><h3 id="profile-tab-title">Your profile</h3><p>This name appears inside your Keeper garage. Your contact details stay private in Supabase Auth.</p></div>
                <form className="account-form" onSubmit={(event) => { event.preventDefault(); void profile.save(); }}>
                  <label>Display name<input value={profile.displayName} onChange={(event) => profile.setDisplayName(event.target.value)} maxLength={60} placeholder="Your name" autoComplete="name" required /></label>
                  <label>Account email<input value={auth.user.email ?? "Not added"} disabled /></label>
                  <button className="button button-primary" disabled={profile.loading || profile.saving}>{profile.saving ? "Saving…" : "Save profile"}</button>
                </form>
                {profile.message && <div className="auth-notice success">{profile.message}</div>}
                {profile.error && <div className="auth-notice error">{profile.error}</div>}
              </section>
            )}

            {activeTab === "security" && (
              <section className="account-tab-panel security-panel" aria-labelledby="security-tab-title">
                <div className="tab-heading"><span>Access and recovery</span><h3 id="security-tab-title">Security</h3><p>Connect more than one trusted sign-in method so your garage is easier to recover.</p></div>

                <div className="security-section">
                  <div className="security-section-heading"><div><span>Social identity</span><strong>Connected accounts</strong></div><small>Provider-secured</small></div>
                  <div className="provider-list">
                    <ProviderButton provider="google" enabled={auth.capabilities.google} linked={auth.linkedProviders.includes("google")} busy={auth.busy} onClick={() => void auth.linkProvider("google")} />
                  </div>
                  {!auth.capabilities.google && <p className="provider-footnote">Google needs its OAuth developer credentials connected in Supabase before customers can use it.</p>}
                </div>

                <form className="security-section account-form" onSubmit={submitEmailChange}>
                  <div className="security-section-heading"><div><span>Email</span><strong>{auth.user.email ?? "No email added"}</strong></div><small>{auth.user.email_confirmed_at ? "Verified" : "Unverified"}</small></div>
                  <label>{auth.user.email ? "New email address" : "Add email address"}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
                  <button className="button button-quiet" disabled={auth.busy}>{auth.isGuest ? "Secure guest with email" : auth.user.email ? "Change email" : "Add email"}</button>
                </form>

                <div className="security-section">
                  <div className="security-section-heading"><div><span>Phone</span><strong>{auth.user.phone ?? "No phone added"}</strong></div><small>{auth.user.phone ? "Verified" : "Optional"}</small></div>
                  <form className="account-form compact" onSubmit={submitPhone}>
                    <label>{auth.user.phone ? "New phone number" : "Phone number"}<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 555 0123" autoComplete="tel" disabled={!auth.capabilities.phone} required /></label>
                    <button className="button button-quiet" disabled={auth.busy || !auth.capabilities.phone}>{auth.user.phone ? "Change phone" : "Add phone"}</button>
                  </form>
                  {!auth.capabilities.phone && <p className="provider-footnote">Verified phone numbers will activate after an SMS provider is connected in Supabase.</p>}
                  {auth.pendingPhone && (
                    <form className="account-form compact verification-form" onSubmit={submitPhoneCode}>
                      <label>Six-digit code<input value={phoneCode} onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required /></label>
                      <button className="button button-primary" disabled={auth.busy}>Verify phone</button>
                    </form>
                  )}
                </div>

                <div className="security-proof"><b>Owner-only data</b><p>Supabase Row Level Security checks your unique account ID on every profile and garage request.</p></div>
                <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>Sign out{auth.isGuest ? " and leave this guest garage" : ""}</button>
              </section>
            )}
          </div>
        )}

        {auth.message && <div className="auth-notice success">{auth.message}</div>}
        {(auth.error || localError) && <div className="auth-notice error">{auth.error ?? localError}</div>}

        <footer><p>Keeper uses passwordless authentication. Contact details are managed by Supabase Auth and are never exposed in the public garage tables.</p></footer>
      </section>
    </div>
  );
}
