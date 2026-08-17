import type { ReturnTypeKeeperAuth } from "./authTypes";

type ProfilePageProps = {
  auth: ReturnTypeKeeperAuth;
  vehicleCount: number;
  onOpenAccount: (intent?: "account" | "save" | "export") => void;
};

export function ProfilePage({ auth, vehicleCount, onOpenAccount }: ProfilePageProps) {
  const name = auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  return <section className="profile-page" aria-labelledby="profile-page-title">
    <header className="profile-hero"><p className="eyebrow">Keeper Profile</p><h1 id="profile-page-title">{auth.access.kind === "guest" ? "Explore Keeper." : name}</h1><p>{auth.access.description}</p></header>

    {auth.access.kind === "guest" && <section className="profile-guest-card">
      <div><span>Guest Mode</span><h2>Demo access, clearly separated.</h2><p>You&apos;re exploring Keeper without an account. The sample garage shows maintenance schedules, history, fluids, and reports, but Guest Mode does not permanently save or sync personal records.</p></div>
      <ul><li>Build your own garage</li><li>Save maintenance and mileage</li><li>Track fluids and repairs</li><li>Sync across devices</li><li>Export account records</li></ul>
      <div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("save")}>Create Keeper Profile</button><button className="button button-quiet" onClick={() => onOpenAccount("account")}>Log In</button></div>
    </section>}

    {auth.access.kind === "legacy" && <section className="profile-legacy-card"><span>Existing garage found</span><h2>{vehicleCount} preserved vehicle{vehicleCount === 1 ? "" : "s"}</h2><p>Your older anonymous garage is read-only. Upgrade in place so the same owner ID—and every related maintenance record—becomes recoverable.</p><button className="button button-primary" onClick={() => onOpenAccount("save")}>Upgrade & Keep Garage</button></section>}

    {auth.access.kind === "setup" && <section className="profile-legacy-card"><span>Finish setup</span><h2>Activate account access</h2><p>This identity is signed in, but Keeper has not recorded acceptance of the current Terms and Privacy notice. Garage writes remain blocked by the database until setup is complete.</p><button className="button button-primary" onClick={() => onOpenAccount("account")}>Finish Keeper Profile</button></section>}

    {auth.access.kind === "account" && <div className="profile-dashboard">
      <section><span>Account</span><h2>{name}</h2><p>{auth.user?.email}</p><strong>Keeper Account</strong><small>Your garage is synced to this Keeper Profile.</small></section>
      <section><span>Garage</span><h2>{vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"}</h2><a className="button button-quiet" href="#garage">View Garage</a></section>
      <section><span>Account settings</span><button onClick={() => onOpenAccount("account")}>Edit Profile & Security</button><button disabled title="Structured for a future account-level export">Export My Data · planned</button><button onClick={() => onOpenAccount("account")}>Log Out / Delete Account</button></section>
    </div>}

    <nav className="profile-legal-nav" aria-label="Profile legal links"><a href="#terms">Terms of Service</a><a href="#privacy">Privacy Policy</a><a href="#contact">Contact</a></nav>
  </section>;
}
