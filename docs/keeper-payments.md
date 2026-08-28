# Keeper lifetime purchase integration

Keeper sells one product: `keeper_lifetime`, a $0.99 USD one-time account upgrade. Free accounts have one vehicle slot and normal garage functionality; upgraded accounts have three total vehicle slots and PDF export.

## What is implemented

- The browser can request a hosted checkout through the provider-neutral `create-keeper-upgrade-checkout` Supabase Edge Function contract.
- Checkout is disabled by default with `VITE_KEEPER_CHECKOUT_ENABLED=false`. The UI shows “Purchase system coming online” and never grants access locally.
- `keeper_purchases` stores provider transaction IDs, amount, currency, status, and completion time. Browser roles can read only their own rows and cannot insert or update purchases.
- `record_keeper_purchase(...)` is callable only by the Supabase service role. It is idempotent on `(provider, provider_transaction_id)` and grants `keeper_lifetime` only when a trusted server callback records a completed $0.99 USD payment.
- Vehicle additions and PDF export are independently enforced in Postgres. Existing vehicles are never removed if an account is already above its allowance.

## Required before accepting money

1. Select a hosted-checkout provider.
2. Deploy `create-keeper-upgrade-checkout` as a trusted server function. It must authenticate the Keeper user, reject already-owned purchases, create the provider checkout for exactly 99 cents USD, and associate the checkout with that user ID.
3. Add a server-only webhook handler. Verify the provider signature using a secret stored only in the server environment, normalize the event status, and call `record_keeper_purchase(...)` with the Supabase service role.
4. Handle provider success and cancellation return URLs. The success page should refresh `get_keeper_account_state()`; it must not grant access based on query parameters.
5. Set `VITE_KEEPER_CHECKOUT_ENABLED=true` only after checkout and verified webhooks are deployed and tested.
6. Run sandbox tests for success, failure, cancellation, duplicate delivery, already-owned accounts, incorrect amounts, and a provider transaction replayed against another user.

Never place provider secret keys, webhook secrets, or the Supabase service-role key in Vite variables or browser code.
