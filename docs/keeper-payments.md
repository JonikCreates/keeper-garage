# Keeper one-time billing

Keeper has three account states. Free allows one vehicle and no PDF export. Keeper Upgrade (`keeper_unlock_v1`) is $1.99 USD once for three total vehicles and PDF export. Keeper Infinite (`keeper_unlimited_v1`) is $4.99 USD once for unlimited vehicles and PDF export. The same $4.99 Infinite product is available from Free or Upgrade; the retired $3 transaction code remains only for historical audit compatibility.

## Trust boundaries

The browser sends only `{ productCode }` to the authenticated `create-keeper-checkout` Edge Function. The server gets the user from verified Supabase authentication, resolves the current plan, validates the transition, selects a server-only Stripe Price ID, fixes the amount/resulting plan, and creates a hosted Checkout Session in `payment` mode.

The success route polls `get_keeper_billing_status()` and reloads account entitlements. It does not write purchases or grant access. Only `stripe-webhook`, after checking `Stripe-Signature` against the raw body, can call the service-role-only transactional event processor.

`keeper_billing_purchases` is the audit ledger. Money is integer cents. Checkout Session and PaymentIntent IDs are unique. `keeper_stripe_webhook_events.stripe_event_id` is the event idempotency key, so duplicate delivery returns without applying the event twice. Browser roles can read only their own ledger rows and cannot insert or update them.

## Entitlements and data preservation

`account_entitlements` remains the current-access source. The resolver gives Infinite precedence over Upgrade and maps active historical `keeper_lifetime`, `project_car`, and `collector` access to Upgrade. The migration adds `keeper_unlock_v1` for those users without removing the old audit rows.

Vehicle limits are enforced by the existing database insert trigger, now resolved as `1`, `3`, or `NULL`. `NULL` means unlimited. A refund or other downgrade never deletes or hides vehicles, maintenance history, mileage, custom work, or exports. An over-limit account keeps all existing data but cannot add another vehicle until it is under its current allowance or purchases access again.

PDF data is fetched through `get_keeper_vehicle_pdf_export()`, which requires Upgrade or Infinite and verifies vehicle ownership before the client renders the file.

Full `charge.refunded` events mark the purchase refunded and recompute paid entitlements from the remaining ledger. Launch-promotion entitlements are independent of purchase refunds. Partial refunds are recorded as ignored webhook events and require an explicit policy before production.

## Launch promotions

`launch_infinite_10` and `launch_upgrade_50` are independent rows in `keeper_promotions`. The database locks the requested row, verifies an active account, confirmed email, and Google identity, checks capacity, records one identity-bound redemption, increments only that promotion, and grants the same entitlement as a paid purchase in one transaction. A unique user ID and privacy-preserving Google identity hash prevent claiming either pool again from the same verified identity. Claim attempts are server-rate-limited and logged without browser fingerprints.

Set either promotion's `active` field to `false` to disable it without a code deploy. The profile reads exact remaining quantities from `get_keeper_launch_promotions()`; it never maintains a browser counter.

## Server-only configuration

These values belong in Supabase Edge Function secrets, never in `VITE_` variables or the repository:

```text
KEEPER_SITE_URL
KEEPER_STRIPE_LIVE_ENABLED=false
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_KEEPER_UNLOCK_199
STRIPE_PRICE_KEEPER_UNLIMITED_499
```

`VITE_KEEPER_CHECKOUT_ENABLED` stays `false` until the test-mode products, prices, webhook, migration, and Edge Functions are configured and verified.
`KEEPER_STRIPE_LIVE_ENABLED` is a separate server-only kill switch and stays `false`; both Edge Functions reject live-mode billing until an explicitly approved production rollout changes it.

## Required test-mode checks

1. Free → Upgrade charges 199 cents, records a paid ledger row, grants Upgrade, allows three vehicles, and enables PDF.
2. Upgrade → Infinite charges 499 cents and grants Infinite.
3. Free → Infinite charges 499 cents and grants Infinite.
4. A repeated Stripe event is a no-op after the first transaction.
5. Invalid signatures return HTTP 400 without a database mutation.
6. Cancelled and failed payments grant nothing; expired Checkout Sessions close their pending ledger row.
7. A full refund recalculates access without deleting garage data.
8. Direct vehicle inserts fail at the Free/Upgrade limits and succeed without a cap for Infinite.
9. The first 10 Infinite claims and first 50 Upgrade claims succeed independently; claims 11 and 51 fall back to paid pricing.
10. One user/verified Google identity cannot claim twice or claim both pools, and concurrent final-slot requests cannot both win.

Do not enable live mode or merge billing to production until all test-mode checks and the debug UI review pass.
