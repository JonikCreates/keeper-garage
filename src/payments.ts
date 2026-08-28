import { supabase } from "./supabase";

export const KEEPER_UPGRADE_PRODUCT = Object.freeze({
  id: "keeper_lifetime",
  name: "Keeper Lifetime Upgrade",
  amountCents: 99,
  currency: "USD",
});

export type UpgradeCheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "already_owned" }
  | { status: "unavailable"; message: string };

export type KeeperPurchaseStatus = {
  lifetime_upgrade: boolean;
  latest_status: "pending" | "completed" | "failed" | "cancelled" | null;
};

type CheckoutFunctionResponse = {
  status?: "created" | "already_owned";
  checkoutUrl?: string;
};

export async function createUpgradeCheckout(): Promise<UpgradeCheckoutResult> {
  if (import.meta.env.VITE_KEEPER_CHECKOUT_ENABLED !== "true") {
    return {
      status: "unavailable",
      message: "Purchase system coming online. Your free Keeper account remains fully available.",
    };
  }

  if (!supabase) {
    return { status: "unavailable", message: "Keeper checkout is unavailable right now." };
  }

  // The browser requests a hosted checkout only. A trusted server function creates the
  // provider session; only a verified server callback may record payment and grant access.
  const { data, error } = await supabase.functions.invoke<CheckoutFunctionResponse>(
    "create-keeper-upgrade-checkout",
    { body: { productId: KEEPER_UPGRADE_PRODUCT.id } },
  );

  if (error) {
    return { status: "unavailable", message: "Purchase system coming online. Please check back soon." };
  }

  if (data?.status === "already_owned") return { status: "already_owned" };

  if (data?.status === "created" && data.checkoutUrl) {
    const checkoutUrl = new URL(data.checkoutUrl);
    if (checkoutUrl.protocol !== "https:") {
      return { status: "unavailable", message: "Keeper checkout returned an invalid address." };
    }
    return { status: "redirect", url: checkoutUrl.toString() };
  }

  return { status: "unavailable", message: "Purchase system coming online. Please check back soon." };
}

export async function getPurchaseStatus(): Promise<KeeperPurchaseStatus> {
  if (!supabase) return { lifetime_upgrade: false, latest_status: null };
  const { data, error } = await supabase.rpc("get_keeper_purchase_status");
  if (error || !data) throw new Error("Keeper couldn't refresh purchase status.");
  return data as KeeperPurchaseStatus;
}
