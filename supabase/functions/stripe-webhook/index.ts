import { withSupabase } from "npm:@supabase/server@^1";
import Stripe from "npm:stripe@^22";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

function id(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

async function verifiedEvent(rawBody: string, signature: string) {
  const candidates = [
    { secret: Deno.env.get("STRIPE_WEBHOOK_SECRET"), stripeSecret: Deno.env.get("STRIPE_SECRET_KEY"), livemode: false },
    { secret: Deno.env.get("STRIPE_LIVE_WEBHOOK_SECRET"), stripeSecret: Deno.env.get("STRIPE_LIVE_SECRET_KEY"), livemode: true },
  ];

  for (const candidate of candidates) {
    if (!candidate.secret || !candidate.stripeSecret) continue;
    try {
      const stripe = new Stripe(candidate.stripeSecret);
      const event = await stripe.webhooks.constructEventAsync(rawBody, signature, candidate.secret, undefined, cryptoProvider);
      if (event.livemode !== candidate.livemode) continue;
      return event;
    } catch { /* Try the other independently configured Stripe mode. */ }
  }
  return null;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const signature = req.headers.get("stripe-signature");
    if (!signature) return new Response("Webhook authentication unavailable", { status: 400 });

    const rawBody = await req.text();
    const event = await verifiedEvent(rawBody, signature);
    if (!event) return new Response("Invalid Stripe signature", { status: 400 });
    if (event.livemode && Deno.env.get("KEEPER_STRIPE_LIVE_ENABLED") !== "true") return new Response("Live Keeper billing is disabled", { status: 403 });
    if (!event.livemode && Deno.env.get("KEEPER_STRIPE_LIVE_ENABLED") === "true") return new Response("Test Keeper billing is disabled", { status: 403 });

    let action = "ignored";
    let userId: string | null = null;
    let checkoutSessionId: string | null = null;
    let paymentIntentId: string | null = null;
    let customerId: string | null = null;
    let productCode: string | null = null;
    let amountCents: number | null = null;
    let currency: string | null = null;

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded" || event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      checkoutSessionId = session.id;
      paymentIntentId = id(session.payment_intent);
      customerId = id(session.customer);
      userId = session.metadata?.keeper_user_id ?? null;
      productCode = session.metadata?.keeper_product_code ?? null;
      amountCents = session.amount_total;
      currency = session.currency?.toUpperCase() ?? null;
      if (event.type === "checkout.session.async_payment_failed") action = "checkout_failed";
      else if (event.type === "checkout.session.expired") action = "checkout_cancelled";
      else if (session.payment_status === "paid" && productCode?.startsWith("keeper_")) action = "checkout_paid";
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      paymentIntentId = id(charge.payment_intent);
      if (charge.refunded) action = "payment_refunded";
    }

    const { error } = await ctx.supabaseAdmin.rpc("process_keeper_stripe_event", {
      p_event_id: event.id,
      p_event_type: event.type,
      p_livemode: event.livemode,
      p_action: action,
      p_user_id: userId,
      p_checkout_session_id: checkoutSessionId,
      p_payment_intent_id: paymentIntentId,
      p_customer_id: customerId,
      p_product_code: productCode,
      p_amount_cents: amountCents,
      p_currency: currency,
    });
    if (error) return new Response("Webhook processing failed", { status: 500 });
    return Response.json({ received: true });
  }),
};
