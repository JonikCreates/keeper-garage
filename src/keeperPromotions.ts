import { useCallback, useEffect, useState } from "react";
import type { KeeperPlanCode } from "./keeperEntitlements";
import { supabase } from "./supabase";

export type KeeperPromotionKey = "launch_upgrade_50" | "launch_infinite_10";

export type KeeperPromotionOffer = {
  promotion_key: KeeperPromotionKey;
  plan_code: Exclude<KeeperPlanCode, "free">;
  max_redemptions: number;
  redemption_count: number;
  remaining: number;
  active: boolean;
  claimed_by_user: boolean;
  claim_available: boolean;
};

type PromotionListResponse = { promotions?: KeeperPromotionOffer[] };
type PromotionClaimResponse = {
  status: "claimed" | "invalid" | "account_inactive" | "email_unverified" | "provider_required" | "already_claimed" | "already_owned" | "ineligible_plan" | "unavailable" | "sold_out" | "rate_limited";
  message?: string;
  plan_code?: KeeperPlanCode;
  remaining?: number;
};

export async function getKeeperLaunchPromotions() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_keeper_launch_promotions");
  if (error || !data) throw new Error("Keeper couldn't load the live launch availability.");
  return ((data as PromotionListResponse).promotions ?? []).filter((offer) =>
    offer.promotion_key === "launch_upgrade_50" || offer.promotion_key === "launch_infinite_10"
  );
}

export async function claimKeeperLaunchPromotion(promotionKey: KeeperPromotionKey) {
  if (!supabase) throw new Error("Keeper launch claims are unavailable right now.");
  const { data, error } = await supabase.rpc("claim_keeper_launch_promotion", { p_promotion_key: promotionKey });
  if (error || !data) throw new Error("Keeper couldn't complete the launch claim.");
  return data as PromotionClaimResponse;
}

function resultMessage(result: PromotionClaimResponse) {
  if (result.status === "claimed") return result.plan_code === "keeper_unlimited_v1"
    ? "Keeper Infinite Founder Launch Access is active permanently."
    : "Keeper Upgrade Founder Launch Access is active permanently.";
  return result.message ?? "That launch offer is not available for this account.";
}

export function useKeeperPromotions(enabled: boolean, refreshAccountState: () => Promise<unknown>) {
  const [offers, setOffers] = useState<KeeperPromotionOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<KeeperPromotionKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) { setOffers([]); return; }
    setLoading(true);
    try { setOffers(await getKeeperLaunchPromotions()); }
    catch { setMessage("Live launch availability could not be loaded. Paid pricing remains available."); }
    finally { setLoading(false); }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getKeeperLaunchPromotions()
      .then((nextOffers) => { if (active) setOffers(nextOffers); })
      .catch(() => { if (active) setMessage("Live launch availability could not be loaded. Paid pricing remains available."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [enabled]);

  const claim = useCallback(async (promotionKey: KeeperPromotionKey) => {
    setBusyKey(promotionKey);
    setMessage(null);
    try {
      const result = await claimKeeperLaunchPromotion(promotionKey);
      setMessage(resultMessage(result));
      if (result.status === "claimed" || result.status === "already_owned") await refreshAccountState();
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Keeper couldn't complete the launch claim.");
    } finally { setBusyKey(null); }
  }, [refresh, refreshAccountState]);

  return { offers, loading, busyKey, message, refresh, claim };
}
