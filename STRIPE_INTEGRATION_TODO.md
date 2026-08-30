# Stripe Integration Status

Keeper uses Stripe-hosted Checkout for permanent, one-time purchases. This file is the single source of truth for the integration's remaining operational work.

## Values to Replace

There are no placeholder Checkout values in the repository.

The existing implementation already resolves its real values at runtime:

- `mode` is `payment` for Keeper's one-time products.
- `success_url` and `cancel_url` are derived from the allow-listed Keeper site URL.
- `line_items[].price` comes from server-only, mode-specific Stripe Price ID secrets.

## Configured Parameters

These Checkout Studio parameters are configured in:

- [supabase/functions/create-keeper-checkout/index.ts](supabase/functions/create-keeper-checkout/index.ts)

| Parameter | Value |
|---|---|
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `auto` |
| `phone_number_collection` | `{ enabled: true }` |
| `automatic_tax` | `{ enabled: false }` |
| `allow_promotion_codes` | `true` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |

`payment_method_collection` is intentionally omitted because Keeper uses `mode: "payment"`; the supplied Checkout configuration requires it only for subscription mode. Stripe SDK v22 is used by the Edge Function, so `hosted_page` is the correct `ui_mode` value.

## Setup and Next Steps

### Server-only configuration

Store these values in Supabase Edge Function secrets. Never expose them through Vite variables or commit them:

- `KEEPER_LIVE_SITE_URL`
- `KEEPER_STRIPE_LIVE_ENABLED`
- `STRIPE_LIVE_SECRET_KEY`
- `STRIPE_LIVE_WEBHOOK_SECRET`
- `STRIPE_LIVE_PRICE_KEEPER_UNLOCK_199`
- `STRIPE_LIVE_PRICE_KEEPER_UNLIMITED_499`

The legacy `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_*` values remain the test-mode configuration.

### Project structure

- `supabase/functions/create-keeper-checkout/index.ts` creates authenticated Checkout Sessions and registers pending purchases.
- `supabase/functions/stripe-webhook/index.ts` verifies raw Stripe signatures and fulfills or reverses purchases.
- `supabase/functions/_shared/billing.ts` fixes Keeper product prices and allowed plan transitions.
- `supabase/migrations/` contains the billing ledger, entitlement, promotion, and test/live isolation schema.

### Payment flow

1. An authenticated Keeper account requests a server-approved product code.
2. The Edge Function verifies the account and transition, selects the server-only Price ID, registers a pending purchase, and redirects to Stripe-hosted Checkout.
3. Stripe posts a signed event to the production webhook.
4. The database transaction validates the registered amount, product, customer, and account before granting the permanent entitlement.
5. The success page polls authoritative billing status; it cannot grant access itself.

### Testing

- Use Stripe sandbox mode and Stripe's test card `4242 4242 4242 4242` with any future expiry and CVC for non-live testing.
- Confirm Free → Upgrade ($1.99), Free → Infinite ($4.99), and Upgrade → Infinite ($4.99).
- Confirm cancellation, expiration, invalid signatures, duplicate webhook delivery, and full refunds grant or revoke access correctly without deleting garage data.
- Never use test cards in live mode. A live smoke test creates a real charge and should be performed only with explicit authorization.

### Remaining operational steps

- Finish Stripe's live-key identity verification and store the live key and webhook signing secret directly in Supabase.
- Keep `KEEPER_STRIPE_LIVE_ENABLED=false` until both live secrets are present and verified.
- Deploy the updated checkout function and production frontend with `VITE_KEEPER_CHECKOUT_ENABLED=true` only after the server configuration is complete.
- Perform one controlled live checkout, verify the paid ledger row and entitlement, then refund it and verify access recalculation.
- Use the Stripe Dashboard to maintain products, prices, refunds, disputes, and order tracking; fulfillment remains webhook-driven.

## Resources

- [Stripe Support](https://support.stripe.com)
- [Stripe MCP documentation](https://docs.stripe.com/mcp)
- [Stripe Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create)
