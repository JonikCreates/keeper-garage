import type { ReturnTypeKeeperAuth } from "./authTypes";
import type { AuthIntent } from "./AuthPanel";

type ProfilePageProps = {
  auth: ReturnTypeKeeperAuth;
  vehicleCount: number;
  onOpenAccount: (intent?: AuthIntent) => void;
};

export function ProfilePage({ auth, vehicleCount, onOpenAccount }: ProfilePageProps) {
  const name = auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  if (!auth.ready) return <section className="profile-page profile-loading" aria-live="polite"><div><span className="auth-loading-mark" /><strong>Checking your Keeper session…</strong></div></section>;
  return <section className="profile-page" aria-labelledby="profile-page-title">
    <header className="profile-hero"><p className="eyebrow">Keeper Profile</p><h1 id="profile-page-title">{auth.access.kind === "account" ? name : "Your garage. Your profile."}</h1><p>{auth.access.description}</p>{(auth.access.kind === "guest" || auth.access.kind === "legacy") && <div className="profile-auth-priority"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div>}</header>

    {auth.access.kind === "guest" && <section className="profile-guest-card">
      <div><span>Guest Mode</span><h2>Demo access, clearly separated.</h2><p>You&apos;re exploring Keeper without an account. The sample garage shows maintenance schedules, history, fluids, and reports, but Guest Mode does not permanently save or sync personal records.</p></div>
      <ul><li>Build your own garage</li><li>Save maintenance and mileage</li><li>Track fluids and repairs</li><li>Sync across devices</li><li>Export account records</li></ul>
      <div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button><a className="text-button" href="#garage">Continue in Demo Mode</a></div>
    </section>}

    {auth.access.kind === "legacy" && <section className="profile-legacy-card"><span>Existing garage found</span><h2>Your records are preserved.</h2><p>Keeper found {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"} attached to an older anonymous garage. Sign in or create an account; Keeper will ask before importing any records.</p><div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div></section>}

    {auth.access.kind === "setup" && <section className="profile-legacy-card"><span>Finish setup</span><h2>Activate account access</h2><p>This identity is signed in, but Keeper has not recorded acceptance of the current Terms and Privacy notice. Garage writes remain blocked by the database until setup is complete.</p><button className="button button-primary" onClick={() => onOpenAccount("account")}>Finish Keeper Profile</button></section>}

    {auth.access.kind === "account" && <div className="profile-dashboard">
      <section><span>Keeper Profile</span><h2>{name}</h2><p>{auth.user?.email}</p><strong>Keeper Account</strong><small>Your garage is synced to this Keeper Profile.</small></section>
      <section><span>Garage</span><h2>{vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"}</h2><a className="button button-quiet" href="#garage">View Garage</a></section>
      <section><span>Account</span><button onClick={() => onOpenAccount("account")}>Edit Profile</button><button onClick={() => onOpenAccount("account")}>Change Password</button><button onClick={() => onOpenAccount("account")}>Log Out</button></section>
    </div>}

    <nav className="profile-legal-nav" aria-label="Profile legal links"><a href="#terms">Terms of Service</a><a href="#privacy">Privacy Policy</a><a href="#contact">Contact</a></nav>
  </section>;
}
