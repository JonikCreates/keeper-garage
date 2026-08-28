import type { ReturnTypeKeeperAuth } from "./authTypes";
import type { AuthIntent } from "./AuthPanel";
import { vehicleSlotLabel } from "./keeperEntitlements";
import { pageHref } from "./routing";

type ProfilePageProps = { auth: ReturnTypeKeeperAuth; vehicleCount: number; onOpenAccount: (intent?: AuthIntent) => void; onUpgrade: () => void };

export function ProfilePage({ auth, vehicleCount, onOpenAccount, onUpgrade }: ProfilePageProps) {
  const name = auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  const plan = auth.access.keeper.planCode;
  const planName = plan === "keeper_unlimited_v1" ? "Keeper Unlimited" : plan === "keeper_unlock_v1" ? "Keeper Unlocked" : "Keeper Free";

  if (!auth.ready) return <section className="profile-page profile-loading" aria-live="polite"><div><span className="auth-loading-mark" /><strong>Checking your Keeper session…</strong></div></section>;

  return <section className="profile-page" aria-labelledby="profile-page-title">
    <header className="profile-hero"><p className="eyebrow">Profile</p><h1 id="profile-page-title">{auth.access.kind === "account" ? name : "Your garage. Your profile."}</h1><p>{auth.access.description}</p>{(auth.access.kind === "guest" || auth.access.kind === "legacy") && <div className="profile-auth-priority"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div>}</header>

    {auth.access.kind === "guest" && <section className="profile-guest-card"><div><span>Guest Mode</span><h2>Demo access, clearly separated.</h2><p>You&apos;re exploring Keeper without an account. Guest Mode does not permanently save or sync personal records.</p></div><ul><li>Build your own garage</li><li>Save maintenance and mileage</li><li>Track fluids and repairs</li><li>Sync across devices</li></ul><div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button><a className="text-button" href={pageHref("garage")}>Continue in Demo Mode</a></div></section>}
    {auth.access.kind === "legacy" && <section className="profile-legacy-card"><span>Existing garage found</span><h2>Your records are preserved.</h2><p>Keeper found {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"} attached to an older anonymous garage. Sign in or create an account; Keeper will ask before importing records.</p><div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div></section>}
    {auth.access.kind === "setup" && <section className="profile-legacy-card"><span>Finish setup</span><h2>Activate account access</h2><p>This identity is signed in, but Keeper has not recorded acceptance of the current Terms and Privacy notice. Garage writes remain blocked until setup is complete.</p><button className="button button-primary" onClick={() => onOpenAccount("account")}>Finish Keeper Profile</button></section>}

    {auth.access.kind === "account" && <div className="profile-dashboard">
      <section className="profile-account-card"><header><div><span>Account</span><h2>{name}</h2><p>{auth.user?.email}</p></div><strong>Synced</strong></header><p>Your vehicles, maintenance history, ownership records, and Keeper access follow this account across devices.</p><div className="profile-account-actions"><button onClick={() => onOpenAccount("account")}>Edit Profile</button><button onClick={() => onOpenAccount("account")}>Security &amp; Password</button><button onClick={() => onOpenAccount("account")}>Log Out</button></div></section>

      <section className={`profile-keeper-card ${plan === "free" ? "free" : "upgraded"}`}>
        <header><div><span>Your Keeper</span><h2>{planName}</h2></div>{plan !== "free" && <b>✓ Lifetime access active</b>}</header>
        <div className="profile-keeper-usage"><div><span>Your garage</span><strong>{vehicleSlotLabel(auth.access.keeper, vehicleCount)}</strong></div><a className="button button-quiet" href={pageHref("garage")}>View Garage</a></div>

        {plan === "keeper_unlimited_v1" && <ul className="profile-keeper-features"><li>Unlimited vehicle slots</li><li>PDF export unlocked</li><li>One-time purchase · no subscription</li></ul>}
        {plan === "keeper_unlock_v1" && <div className="profile-upgrade-offer"><div><span>Current plan</span><h3>Keeper Unlocked</h3><ul><li>3 total vehicle slots</li><li>PDF maintenance &amp; ownership exports</li><li>Lifetime account access</li></ul></div><div className="profile-upgrade-cta"><strong>$3.00</strong><span>Upgrade difference · one time</span><p>You&apos;ve already paid $1.99. Go unlimited for the remaining $3.00.</p><button className="button button-primary" type="button" onClick={onUpgrade}>Upgrade to Unlimited — $3.00</button><b>Pay only the difference. No subscription.</b></div></div>}
        {plan === "free" && <div className="profile-plan-grid">
          <article><span>Keeper Unlock</span><strong>$1.99</strong><p>One-time purchase</p><ul><li>3 total vehicle slots</li><li>PDF export</li><li>No subscription</li></ul><button className="button button-quiet" type="button" onClick={onUpgrade}>Unlock Keeper — $1.99</button></article>
          <article className="recommended"><span>Keeper Unlimited</span><strong>$4.99</strong><p>One-time purchase</p><ul><li>Unlimited vehicle slots</li><li>PDF export</li><li>No subscription</li></ul><button className="button button-primary" type="button" onClick={onUpgrade}>Go Unlimited — $4.99</button></article>
        </div>}
      </section>
    </div>}
    <nav className="profile-legal-nav" aria-label="Profile legal links"><a href={pageHref("terms")}>Terms of Service</a><a href={pageHref("privacy")}>Privacy Policy</a><a href={pageHref("contact")}>Contact</a></nav>
  </section>;
}
