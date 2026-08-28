import type { KeeperPlanCode, KeeperProductCode } from "./keeperEntitlements";
import { supabase } from "./supabase";

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "already_owned"; planCode: KeeperPlanCode }
  | { status: "invalid_transition"; message: string }
  | { status: "unavailable"; message: string };

export type KeeperBillingStatus = {
  plan_code: KeeperPlanCode;
  vehicle_limit: number | null;
  vehicle_count: number;
  pdf_export_enabled: boolean;
  latest_status: "pending" | "paid" | "failed" | "cancelled" | "refunded" | null;
  latest_product_code: KeeperProductCode | null;
};

type CheckoutFunctionResponse = { status?: "created" | "already_owned" | "invalid_transition"; checkoutUrl?: string; planCode?: KeeperPlanCode; message?: string };

export async function createCheckout(productCode: KeeperProductCode): Promise<CheckoutResult> {
  if (import.meta.env.VITE_KEEPER_CHECKOUT_ENABLED !== "true") return { status: "unavailable", message: "Secure test checkout is not enabled for this Keeper environment yet." };
  if (!supabase) return { status: "unavailable", message: "Keeper checkout is unavailable right now." };

  // The browser sends only a public product code. Identity, current plan, transition,
  // Price ID, amount, and resulting entitlement are server-derived.
  const { data, error } = await supabase.functions.invoke<CheckoutFunctionResponse>("create-keeper-checkout", { body: { productCode } });
  if (error) return { status: "unavailable", message: "Secure checkout could not be opened. Please try again." };
  if (data?.status === "already_owned") return { status: "already_owned", planCode: data.planCode ?? "keeper_unlimited_v1" };
  if (data?.status === "invalid_transition") return { status: "invalid_transition", message: data.message ?? "That purchase is not available for this account." };
  if (data?.status === "created" && data.checkoutUrl) {
    const checkoutUrl = new URL(data.checkoutUrl);
    if (checkoutUrl.protocol !== "https:" || !checkoutUrl.hostname.endsWith("stripe.com")) return { status: "unavailable", message: "Keeper checkout returned an invalid address." };
    return { status: "redirect", url: checkoutUrl.toString() };
  }
  return { status: "unavailable", message: "Secure checkout could not be opened. Please try again." };
}

export async function getBillingStatus(): Promise<KeeperBillingStatus> {
  if (!supabase) throw new Error("Keeper billing status is unavailable.");
  const { data, error } = await supabase.rpc("get_keeper_billing_status");
  if (error || !data) throw new Error("Keeper couldn't refresh purchase status.");
  return data as KeeperBillingStatus;
}
