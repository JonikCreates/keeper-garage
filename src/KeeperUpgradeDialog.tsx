import { useEffect, useRef } from "react";

export type UpgradePromptContext = "profile" | "vehicle" | "pdf" | "limit";

type KeeperUpgradeDialogProps = {
  open: boolean;
  context: UpgradePromptContext;
  upgraded: boolean;
  busy: boolean;
  message: string | null;
  onClose: () => void;
  onCheckout: () => void;
};

export function KeeperUpgradeDialog({
  open,
  context,
  upgraded,
  busy,
  message,
  onClose,
  onCheckout,
}: KeeperUpgradeDialogProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const isFullGarage = upgraded && context === "limit";
  const title = isFullGarage
    ? "Your Keeper garage is full"
    : context === "pdf"
      ? "PDF Export"
      : context === "vehicle"
        ? "Make room for another car"
        : "Upgrade Keeper";

  return (
    <div className="keeper-upgrade-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="keeper-upgrade-dialog" role="dialog" aria-modal="true" aria-labelledby="keeper-upgrade-title">
        <button ref={closeButton} className="keeper-upgrade-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <span>{isFullGarage ? "3 of 3 slots used" : "Pay once · keep it"}</span>
        <h2 id="keeper-upgrade-title">{title}</h2>

        {isFullGarage ? (
          <p>You&apos;ve used all 3 Keeper vehicle slots. Your existing vehicles and records remain safe.</p>
        ) : (
          <>
            <p>{context === "pdf"
              ? "Keep a permanent copy of your Keeper records. PDF export is included with the Keeper lifetime upgrade."
              : context === "vehicle"
                ? "Your free garage includes 1 vehicle. Unlock 2 more vehicle slots and PDF exports."
                : "Unlock more of your garage with one permanent account upgrade."}</p>
            <div className="keeper-upgrade-price"><strong>$0.99</strong><span>One-time purchase</span></div>
            <ul><li>3 total vehicle slots</li><li>PDF maintenance &amp; ownership exports</li><li>Lifetime access for this Keeper account</li></ul>
            <strong className="keeper-upgrade-once">One-time purchase. No subscription.</strong>
            <button className="button button-primary" type="button" disabled={busy} onClick={onCheckout}>{busy ? "Opening secure checkout…" : "Upgrade for $0.99"}</button>
          </>
        )}

        {message && <p className="keeper-upgrade-message" role="status">{message}</p>}
      </section>
    </div>
  );
}
