import { useState, type FormEvent } from "react";
import type { ReturnTypeKeeperAuth } from "./authTypes";

type AuthPanelProps = {
  auth: ReturnTypeKeeperAuth;
  open: boolean;
  onClose: () => void;
};

export function AuthPanel({ auth, open, onClose }: AuthPanelProps) {
  const [email, setEmail] = useState("");

  if (!open) return null;

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    if (auth.isGuest) await auth.secureGuest(email.trim());
    else await auth.sendMagicLink(email.trim());
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <header>
          <div>
            <p className="eyebrow">Keeper garage</p>
            <h2 id="auth-title">{auth.user ? "Your account." : "Save your F30."}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close account panel">×</button>
        </header>

        {!auth.configured && (
          <div className="auth-notice error">Supabase is not configured in this build. The research library still works without an account.</div>
        )}

        {auth.configured && !auth.ready && <div className="auth-notice">Checking your garage…</div>}

        {auth.configured && auth.ready && !auth.user && (
          <>
            <article className="auth-choice guest-choice">
              <span>Fastest start</span>
              <h3>Continue as guest</h3>
              <p>Save one garage on this browser without sharing an email. You can secure it later.</p>
              <button className="button button-primary" disabled={auth.busy} onClick={() => void auth.continueAsGuest()}>
                {auth.busy ? "Starting…" : "Continue as guest"}
              </button>
            </article>

            <div className="auth-divider"><span>or</span></div>

            <form className="email-auth" onSubmit={submitEmail}>
              <span>Permanent account</span>
              <h3>Sign in by email</h3>
              <p>We’ll email a secure one-time link. No password to remember.</p>
              <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
              <button className="button button-quiet" disabled={auth.busy}>{auth.busy ? "Sending…" : "Email me a sign-in link"}</button>
            </form>
          </>
        )}

        {auth.user && (
          <div className="account-state">
            <div className={`account-badge ${auth.isGuest ? "guest" : "permanent"}`}>
              <span>{auth.isGuest ? "Guest garage" : "Permanent account"}</span>
              <strong>{auth.isGuest ? "This browser only" : auth.user.email}</strong>
            </div>

            {auth.isGuest && (
              <form className="email-auth" onSubmit={submitEmail}>
                <span>Keep this garage</span>
                <h3>Secure it with email</h3>
                <p>We’ll send a verification link that converts this guest garage into a permanent account.</p>
                <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
                <button className="button button-primary" disabled={auth.busy}>{auth.busy ? "Sending…" : "Secure guest account"}</button>
              </form>
            )}

            <button className="sign-out-button" disabled={auth.busy} onClick={() => void auth.signOut()}>
              Sign out{auth.isGuest ? " and leave this guest garage" : ""}
            </button>
          </div>
        )}

        {auth.message && <div className="auth-notice success">{auth.message}</div>}
        {auth.error && <div className="auth-notice error">{auth.error}</div>}

        <footer>
          <p>Guest access is recoverable only after you attach an email. Clearing browser data or signing out first can make it inaccessible.</p>
        </footer>
      </section>
    </div>
  );
}
