import { withSupabase } from "npm:@supabase/server@^1";
import Stripe from "npm:stripe@^22";
import { isProductCode, productForTransition, type KeeperPlanCode } from "../_shared/billing.ts";

const checkoutIdempotencyVersion = "v3";

type CheckoutEnvironment = {
  livemode: boolean;
  siteUrl: URL;
  stripe: Stripe;
};

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function configuredUrl(name: string) {
  const configured = Deno.env.get(name);
  if (!configured) return null;
  const url = new URL(configured);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error(`${name} must be HTTPS`);
  return url;
}

function checkoutEnvironment(req: Request): CheckoutEnvironment | null {
  const requestOrigin = req.headers.get("origin");
  const testSiteUrl = configuredUrl("KEEPER_SITE_URL");
  const liveSiteUrl = configuredUrl("KEEPER_LIVE_SITE_URL");

  if (liveSiteUrl && requestOrigin === liveSiteUrl.origin) {
    if (Deno.env.get("KEEPER_STRIPE_LIVE_ENABLED") !== "true") return null;
    const secret = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
    if (!secret?.startsWith("sk_live_")) return null;
    return { livemode: true, siteUrl: liveSiteUrl, stripe: new Stripe(secret) };
  }

  if (testSiteUrl && requestOrigin === testSiteUrl.origin) {
    // This project currently serves both sites. Once live billing is enabled,
    // test checkout must stop granting entitlements in the shared database.
    if (Deno.env.get("KEEPER_STRIPE_LIVE_ENABLED") === "true") return null;
    const secret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!secret?.startsWith("sk_test_")) return null;
    return { livemode: false, siteUrl: testSiteUrl, stripe: new Stripe(secret) };
  }

  return null;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return response({ message: "Method not allowed" }, 405);

    const environment = checkoutEnvironment(req);
    if (!environment) return response({ message: "Keeper checkout is not enabled for this site." }, 503);

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return response({ message: "Invalid JSON" }, 400); }
    if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !isProductCode(body.productCode)) {
      return response({ message: "Only a valid productCode may be supplied" }, 400);
    }

    const userId = String(ctx.userClaims?.id ?? "");
    if (!userId) return response({ message: "Authentication required" }, 401);

    const { data: context, error: contextError } = await ctx.supabaseAdmin.rpc("get_keeper_checkout_context", {
      p_user_id: userId,
      p_livemode: environment.livemode,
    });
    if (contextError || !context) return response({ message: "Keeper could not verify account access" }, 503);
    if (!(context as { account_active: boolean }).account_active) return response({ message: "Finish setting up this Keeper Profile before purchasing." }, 403);
    const planCode = (context as { plan_code: KeeperPlanCode }).plan_code;
    if (planCode === "keeper_unlimited_v1") return response({ status: "already_owned", planCode });

    const productCode = body.productCode;
    const product = productForTransition(planCode, productCode);
    if (!product) return response({ status: "invalid_transition", message: "That one-time purchase is not available from the current Keeper plan." }, 409);

    const priceSecret = environment.livemode ? product.livePriceSecret : product.testPriceSecret;
    const priceId = Deno.env.get(priceSecret);
    if (!priceId?.startsWith("price_")) return response({ message: "Keeper checkout pricing is not configured" }, 503);

    let customerId = (context as { stripe_customer_id?: string | null }).stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await environment.stripe.customers.create({
        email: typeof ctx.userClaims?.email === "string" ? ctx.userClaims.email : undefined,
        metadata: { keeper_user_id: userId, keeper_livemode: String(environment.livemode) },
      }, { idempotencyKey: `keeper-customer-v2-${environment.livemode ? "live" : "test"}-${userId}` });
      customerId = customer.id;
    }

    const metadata = {
      keeper_user_id: userId,
      keeper_product_code: productCode,
      keeper_previous_plan_code: planCode,
      keeper_resulting_plan_code: product.resultingPlan,
      keeper_livemode: String(environment.livemode),
    };
    // Stripe idempotency keys are intentionally time-bounded. Immediate retries
    // and concurrent clicks reuse one session, while a cancelled or expired
    // session can be replaced on a later attempt instead of trapping the user
    // behind one permanent user/product key.
    const checkoutAttemptBucket = Math.floor(Date.now() / 60_000);
    const session = await environment.stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL("account/payment/success", environment.siteUrl).toString(),
      cancel_url: new URL("account/payment/cancelled", environment.siteUrl).toString(),
      client_reference_id: userId,
      metadata,
      payment_intent_data: { metadata },
      allow_promotion_codes: false,
    }, { idempotencyKey: `keeper-checkout-${checkoutIdempotencyVersion}-${environment.livemode ? "live" : "test"}-${userId}-${planCode}-${productCode}-${checkoutAttemptBucket}` });

    if (!session.url) return response({ message: "Stripe did not return a hosted checkout" }, 502);
    const { error: registerError } = await ctx.supabaseAdmin.rpc("register_keeper_checkout", {
      p_user_id: userId,
      p_livemode: environment.livemode,
      p_product_code: productCode,
      p_checkout_session_id: session.id,
      p_customer_id: customerId,
      p_amount_cents: product.amountCents,
      p_currency: "USD",
      p_previous_plan_code: planCode,
      p_resulting_plan_code: product.resultingPlan,
    });
    if (registerError) {
      try { await environment.stripe.checkout.sessions.expire(session.id); } catch { /* The database remains authoritative. */ }
      return response({ message: "Keeper could not register this checkout" }, 409);
    }
    return response({ status: "created", checkoutUrl: session.url });
  }),
};
