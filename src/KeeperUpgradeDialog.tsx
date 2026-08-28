import { useEffect, useRef } from "react";
import { KEEPER_PRODUCTS, type KeeperPlanCode, type KeeperProductCode } from "./keeperEntitlements";

export type UpgradePromptContext = "profile" | "vehicle" | "pdf" | "limit";
type Props = { open: boolean; context: UpgradePromptContext; planCode: KeeperPlanCode; busy: boolean; message: string | null; onClose: () => void; onCheckout: (productCode: KeeperProductCode) => void };

export function KeeperUpgradeDialog({ open, context, planCode, busy, message, onClose, onCheckout }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; closeButton.current?.focus(); const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [onClose, open]);
  if (!open) return null;

  const unlimited = planCode === "keeper_unlimited_v1";
  const unlock = planCode === "keeper_unlock_v1";
  const title = context === "pdf" ? "Unlock PDF Export" : context === "limit" ? "Add more vehicle slots" : "Choose your Keeper";
  const choices: KeeperProductCode[] = unlock ? ["keeper_unlimited_upgrade_v1"] : unlimited ? [] : ["keeper_unlock_v1", "keeper_unlimited_v1"];

  return <div className="keeper-upgrade-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="keeper-upgrade-dialog" role="dialog" aria-modal="true" aria-labelledby="keeper-upgrade-title">
    <button ref={closeButton} className="keeper-upgrade-close" type="button" aria-label="Close" onClick={onClose}>×</button><span>Pay once · keep it</span><h2 id="keeper-upgrade-title">{title}</h2>
    <p>{unlimited ? "Keeper Unlimited is already active on this account." : unlock ? "Move from 3 vehicle slots to unlimited slots. You pay only the exact difference." : context === "pdf" ? "PDF export is included with both permanent paid options." : "Free includes one vehicle. Choose three total slots or remove the limit entirely."}</p>
    {choices.map((code) => { const product = KEEPER_PRODUCTS[code]; const price = `$${(product.amountCents / 100).toFixed(2)}`; const label = code === "keeper_unlock_v1" ? "3 vehicles + PDF" : "Unlimited vehicles + PDF"; const cta = code === "keeper_unlock_v1" ? `Unlock Keeper — ${price}` : code === "keeper_unlimited_upgrade_v1" ? `Upgrade to Unlimited — ${price}` : `Go Unlimited — ${price}`; return <article className="keeper-checkout-choice" key={code}><div><strong>{product.name}</strong><span>{label}</span></div><div><b>{price}</b><small>One-time</small></div><button className={`button ${code === "keeper_unlock_v1" ? "button-quiet" : "button-primary"}`} type="button" disabled={busy} onClick={() => onCheckout(code)}>{busy ? "Opening secure checkout…" : cta}</button></article>; })}
    {!unlimited && <strong className="keeper-upgrade-once">One-time purchase. No subscription.</strong>}{message && <p className="keeper-upgrade-message" role="status">{message}</p>}
  </section></div>;
}
