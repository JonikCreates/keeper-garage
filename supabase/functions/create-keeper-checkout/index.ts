import { withSupabase } from "npm:@supabase/server@^1";
import Stripe from "npm:stripe@^22";
import { isProductCode, productForTransition, type KeeperPlanCode } from "../_shared/billing.ts";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function siteUrl() {
  const configured = Deno.env.get("KEEPER_SITE_URL");
  if (!configured) throw new Error("KEEPER_SITE_URL is not configured");
  const url = new URL(configured);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("KEEPER_SITE_URL must be HTTPS");
  return url;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return response({ message: "Method not allowed" }, 405);
    if (!stripe) return response({ message: "Keeper checkout is not configured" }, 503);
    if (stripeSecret?.startsWith("sk_live_") && Deno.env.get("KEEPER_STRIPE_LIVE_ENABLED") !== "true") return response({ message: "Live Keeper checkout is disabled" }, 503);

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return response({ message: "Invalid JSON" }, 400); }
    if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !isProductCode(body.productCode)) {
      return response({ message: "Only a valid productCode may be supplied" }, 400);
    }

    const userId = String(ctx.userClaims?.sub ?? "");
    if (!userId) return response({ message: "Authentication required" }, 401);

    const { data: context, error: contextError } = await ctx.supabaseAdmin.rpc("get_keeper_checkout_context", { p_user_id: userId });
    if (contextError || !context) return response({ message: "Keeper could not verify account access" }, 503);
    if (!(context as { account_active: boolean }).account_active) return response({ message: "Finish setting up this Keeper Profile before purchasing." }, 403);
    const planCode = (context as { plan_code: KeeperPlanCode }).plan_code;
    if (planCode === "keeper_unlimited_v1") return response({ status: "already_owned", planCode });

    const productCode = body.productCode;
    const product = productForTransition(planCode, productCode);
    if (!product) return response({ status: "invalid_transition", message: "That one-time purchase is not available from the current Keeper plan." }, 409);

    const priceId = Deno.env.get(product.priceSecret);
    if (!priceId) return response({ message: "Keeper checkout pricing is not configured" }, 503);
    const baseUrl = siteUrl();

    let customerId = (context as { stripe_customer_id?: string | null }).stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: typeof ctx.userClaims?.email === "string" ? ctx.userClaims.email : undefined,
        metadata: { keeper_user_id: userId },
      }, { idempotencyKey: `keeper-customer-${userId}` });
      customerId = customer.id;
    }

    const metadata = {
      keeper_user_id: userId,
      keeper_product_code: productCode,
      keeper_previous_plan_code: planCode,
      keeper_resulting_plan_code: product.resultingPlan,
    };
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL("account/payment/success", baseUrl).toString(),
      cancel_url: new URL("account/payment/cancelled", baseUrl).toString(),
      client_reference_id: userId,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: false,
    }, { idempotencyKey: `keeper-checkout-${userId}-${planCode}-${productCode}` });

    if (!session.url) return response({ message: "Stripe did not return a hosted checkout" }, 502);
    const { error: registerError } = await ctx.supabaseAdmin.rpc("register_keeper_checkout", {
      p_user_id: userId,
      p_product_code: productCode,
      p_checkout_session_id: session.id,
      p_customer_id: customerId,
      p_amount_cents: product.amountCents,
      p_currency: "USD",
      p_previous_plan_code: planCode,
      p_resulting_plan_code: product.resultingPlan,
    });
    if (registerError) {
      try { await stripe.checkout.sessions.expire(session.id); } catch { /* The database remains authoritative. */ }
      return response({ message: "Keeper could not register this checkout" }, 409);
    }
    return response({ status: "created", checkoutUrl: session.url });
  }),
};
