import type { ReturnTypeKeeperAuth } from "./authTypes";
import type { AuthIntent } from "./AuthPanel";
import { vehicleSlotLabel } from "./keeperEntitlements";
import type { KeeperPromotionKey, KeeperPromotionOffer, useKeeperPromotions } from "./keeperPromotions";
import { pageHref } from "./routing";

type ProfilePageProps = { auth: ReturnTypeKeeperAuth; vehicleCount: number; promotions: ReturnType<typeof useKeeperPromotions>; onOpenAccount: (intent?: AuthIntent) => void; onUpgrade: () => void };

function LaunchOffer({ offer, busyKey, onClaim, onPurchase }: { offer: KeeperPromotionOffer; busyKey: KeeperPromotionKey | null; onClaim: (key: KeeperPromotionKey) => Promise<void>; onPurchase: () => void }) {
  const infinite = offer.promotion_key === "launch_infinite_10";
  const title = infinite ? "Keeper Infinite" : "Keeper Upgrade";
  const normalPrice = infinite ? "$4.99" : "$1.99";
  const benefit = infinite ? "Unlimited garage + PDF exports" : "3 car garage + PDF exports";
  const soldOut = offer.claim_status === "sold_out" || offer.remaining <= 0;
  const unavailableLabel = offer.claim_status === "email_unverified"
    ? "Verify Email to Claim"
    : offer.claim_status === "account_inactive"
      ? "Finish Profile to Claim"
      : offer.claim_status === "already_claimed"
        ? "Launch Offer Already Used"
        : offer.claim_status === "already_owned"
          ? "Included in Your Keeper Plan"
          : null;
  return <article className={infinite ? "recommended" : undefined}>
    <span>{title}</span><strong>{offer.claimed_by_user ? "CLAIMED" : "FREE"}</strong><p>{normalPrice} normally · one time</p>
    <ul><li>{benefit}</li><li>{offer.remaining} of {offer.max_redemptions} launch spots remaining</li><li>Permanent access</li></ul>
    {offer.claimed_by_user
      ? <b className="profile-launch-claimed">✓ Founder Launch Access</b>
      : offer.claim_available
        ? <button className={`button ${infinite ? "button-primary" : "button-quiet"}`} type="button" disabled={busyKey !== null} onClick={() => void onClaim(offer.promotion_key)}>{busyKey === offer.promotion_key ? "Claiming securely…" : `Claim ${title} Free`}</button>
        : unavailableLabel
          ? <button className={`button ${infinite ? "button-primary" : "button-quiet"}`} type="button" disabled>{unavailableLabel}</button>
          : <button className={`button ${infinite ? "button-primary" : "button-quiet"}`} type="button" onClick={onPurchase}>{soldOut ? `Purchase ${title} — ${normalPrice}` : `View ${title} — ${normalPrice}`}</button>}
  </article>;
}

export function ProfilePage({ auth, vehicleCount, promotions, onOpenAccount, onUpgrade }: ProfilePageProps) {
  const name = auth.user?.user_metadata?.display_name || auth.user?.user_metadata?.full_name || auth.user?.email || "Keeper driver";
  const plan = auth.access.keeper.planCode;
  const planName = plan === "keeper_unlimited_v1" ? "Keeper Infinite" : plan === "keeper_unlock_v1" ? "Keeper Upgrade" : "Keeper Free";
  const claimedLaunchOffer = promotions.offers.find((offer) => offer.claimed_by_user);

  if (!auth.ready) return <section className="profile-page profile-loading" aria-live="polite"><div><span className="auth-loading-mark" /><strong>Checking your Keeper session…</strong></div></section>;

  return <section className="profile-page" aria-labelledby="profile-page-title">
    <header className="profile-hero"><p className="eyebrow">Profile</p><h1 id="profile-page-title">{auth.access.kind === "account" ? name : "Your garage. Your profile."}</h1><p>{auth.access.description}</p>{(auth.access.kind === "guest" || auth.access.kind === "legacy") && <div className="profile-auth-priority"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div>}</header>

    {auth.access.kind === "guest" && <section className="profile-guest-card"><div><span>Guest Mode</span><h2>Demo access, clearly separated.</h2><p>You&apos;re exploring Keeper without an account. Guest Mode does not permanently save or sync personal records.</p></div><ul><li>Build your own garage</li><li>Save maintenance and mileage</li><li>Track fluids and repairs</li><li>Sync across devices</li></ul><div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button><a className="text-button" href={pageHref("garage")}>Continue in Demo Mode</a></div></section>}
    {auth.access.kind === "legacy" && <section className="profile-legacy-card"><span>Existing garage found</span><h2>Your records are preserved.</h2><p>Keeper found {vehicleCount} vehicle{vehicleCount === 1 ? "" : "s"} attached to an older anonymous garage. Sign in or create an account; Keeper will ask before importing records.</p><div className="profile-actions"><button className="button button-primary" onClick={() => onOpenAccount("signin")}>Sign In</button><button className="button button-quiet" onClick={() => onOpenAccount("signup")}>Create Account</button></div></section>}
    {auth.access.kind === "setup" && <section className="profile-legacy-card"><span>Finish setup</span><h2>Activate account access</h2><p>This identity is signed in, but Keeper has not recorded acceptance of the current Terms and Privacy notice. Garage writes remain blocked until setup is complete.</p><button className="button button-primary" onClick={() => onOpenAccount("account")}>Finish Keeper Profile</button></section>}

    {auth.access.kind === "account" && <div className="profile-dashboard">
      <section className="profile-account-card"><header><div><span>Account</span><h2>{name}</h2><p>{auth.user?.email}</p></div><strong>Synced</strong></header><p>Your vehicles, maintenance history, ownership records, and Keeper access follow this account across devices.</p><div className="profile-account-actions"><button onClick={() => onOpenAccount("account")}>Edit Profile</button><button onClick={() => onOpenAccount("account")}>Security &amp; Password</button><button onClick={() => onOpenAccount("account")}>Log Out</button></div></section>

      <section className={`profile-keeper-card ${plan === "free" ? "free" : "upgraded"}`}>
        <header><div><span>Your Keeper</span><h2>{planName}</h2></div>{plan !== "free" && <b>✓ {claimedLaunchOffer ? "Founder Launch Access" : "Permanent access active"}</b>}</header>
        <div className="profile-keeper-usage"><div><span>Your garage</span><strong>{vehicleSlotLabel(auth.access.keeper, vehicleCount)}</strong></div><a className="button button-quiet" href={pageHref("garage")}>View Garage</a></div>

        {plan === "keeper_unlimited_v1" && <ul className="profile-keeper-features"><li>Unlimited vehicle slots</li><li>PDF exports</li><li>Permanent Keeper access</li></ul>}
        {plan === "keeper_unlock_v1" && <div className="profile-upgrade-offer"><div><span>Current plan</span><h3>Keeper Upgrade</h3><ul><li>3 total vehicle slots</li><li>PDF maintenance &amp; ownership exports</li><li>Permanent Keeper access</li></ul></div><div className="profile-upgrade-cta"><strong>$4.99</strong><span>Keeper Infinite · one time</span><p>Move to an unlimited garage while preserving every vehicle and record.</p><button className="button button-primary" type="button" onClick={onUpgrade}>Get Keeper Infinite — $4.99</button><b>One payment · permanent access.</b></div></div>}
        {plan === "free" && <div className="profile-plan-grid">
          <article><span>Keeper Upgrade</span><strong>$1.99</strong><p>One time</p><ul><li>3 car garage</li><li>PDF exports</li><li>Permanent access</li></ul><button className="button button-quiet" type="button" onClick={onUpgrade}>Get Keeper Upgrade — $1.99</button></article>
          <article className="recommended"><span>Keeper Infinite</span><strong>$4.99</strong><p>One time</p><ul><li>Unlimited garage</li><li>PDF exports</li><li>Permanent access</li></ul><button className="button button-primary" type="button" onClick={onUpgrade}>Get Keeper Infinite — $4.99</button></article>
        </div>}

        {promotions.offers.length > 0 && <section className="profile-launch-offers" aria-labelledby="profile-launch-title">
          <header><div><span>Launch Offer</span><h3 id="profile-launch-title">Choose one free founder offer.</h3></div><p>Availability comes directly from Keeper&apos;s server. Any verified Keeper account may claim one launch offer while spots remain; Stripe checkout is not required.</p></header>
          <div className="profile-plan-grid">{promotions.offers.map((offer) => <LaunchOffer offer={offer} busyKey={promotions.busyKey} onClaim={promotions.claim} onPurchase={onUpgrade} key={offer.promotion_key} />)}</div>
          {promotions.message && <p className="profile-launch-message" role="status">{promotions.message}</p>}
        </section>}
        {promotions.loading && <p className="profile-launch-message" role="status">Checking live launch availability…</p>}
      </section>
    </div>}
    <nav className="profile-legal-nav" aria-label="Profile legal links"><a href={pageHref("terms")}>Terms of Service</a><a href={pageHref("privacy")}>Privacy Policy</a><a href={pageHref("contact")}>Contact</a></nav>
  </section>;
}
