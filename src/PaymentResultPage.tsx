import { useEffect, useState } from "react";
import type { ReturnTypeKeeperAuth } from "./authTypes";
import { getBillingStatus, type KeeperBillingStatus } from "./payments";
import { pageHref } from "./routing";

type Props = { kind: "success" | "cancelled"; auth: ReturnTypeKeeperAuth };

export function PaymentResultPage({ kind, auth }: Props) {
  const [status, setStatus] = useState<KeeperBillingStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const accessKind = auth.access.kind;
  const devAuth = auth.devAuth;
  const refreshAccountState = auth.refreshAccountState;

  useEffect(() => {
    if (kind !== "success" || accessKind !== "account" || devAuth) return;
    let active = true;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const next = await getBillingStatus();
        if (!active) return;
        setStatus(next);
        await refreshAccountState();
        if (next.latest_status === "paid" || next.latest_status === "refunded") return;
      } catch {
        // Webhook delivery can trail the redirect; retry without treating the page as authority.
      }
      if (!active) return;
      if (attempts >= 10) { setTimedOut(true); return; }
      window.setTimeout(() => void poll(), 1800);
    };
    void poll();
    return () => { active = false; };
  }, [accessKind, devAuth, kind, refreshAccountState]);

  const planName = status?.plan_code === "keeper_unlimited_v1" ? "Keeper Unlimited" : status?.plan_code === "keeper_unlock_v1" ? "Keeper Unlock" : null;
  return <section className="payment-result-page" aria-live="polite">
    <span>{kind === "success" ? "Secure checkout returned" : "Checkout cancelled"}</span>
    <h1>{kind === "cancelled" ? "No charge was made." : planName ? `${planName} is active.` : "Confirming your purchase…"}</h1>
    <p>{kind === "cancelled" ? "Your current Keeper access and all garage data are unchanged." : planName ? "Stripe confirmed the payment and Keeper's verified webhook granted access." : timedOut ? "Confirmation is taking longer than expected. Your payment cannot be granted by this page; refresh Profile after the webhook arrives." : "Keeper is waiting for the signed Stripe webhook. This page never grants access by itself."}</p>
    <div><a className="button button-primary" href={pageHref("profile")}>Return to Profile</a><a className="button button-quiet" href={pageHref("garage")}>View Garage</a></div>
  </section>;
}
