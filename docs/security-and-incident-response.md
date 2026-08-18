# Keeper security and incident reference

This is an operational reference, not a substitute for a formal security program or professional incident advice.

## Trust boundaries

- Supabase Auth owns passwords, OAuth identities, sessions, PKCE exchange, and refresh-token rotation.
- Postgres RLS and protected RPCs authorize garage reads, writes, ownership transfer, deletion requests, and exports.
- Frontend access checks improve the interface but never authorize data.
- Cloudflare Pages serves immutable static assets and security headers; it does not receive a Supabase service-role key.

## Session and URL rules

- OAuth and email actions return only through `/auth/callback/`.
- The client uses PKCE, disables automatic URL session detection, and exchanges the one-time code explicitly.
- Callback parameters are removed before exchange, errors shown to customers are generic, and the final address contains no authentication material.
- Product links must be created with `safeShareUrl` from `src/routing.ts`, which emits only the public page route.
- Logout requests global revocation and falls back to clearing the local session if the remote revocation request fails.

## Credential locations and rotation

- The Supabase URL and publishable key may be present in browser builds. RLS remains mandatory.
- Supabase secret/service-role keys stay server-side and must be rotated immediately if exposed.
- The Google OAuth secret stays in Google and Supabase provider settings.
- SMTP credentials stay in Supabase Authentication SMTP settings.
- JWT signing keys follow Supabase's staged rotation process because active sessions depend on them.

## Logs to review

- Supabase Authentication logs for login, refresh, recovery, identity linking, and logout failures.
- Supabase API/Postgres logs for RLS and RPC failures.
- `public.security_events` for bounded activation, import, export, and deletion events; never store tokens, passwords, keys, claim secrets, or full records there.
- GitHub Actions and Cloudflare deployment logs for release failures. Build logs must not print environment values.

## Suspected shared-session response

1. Revoke the affected user's sessions and rotate any actually exposed secret.
2. Preserve the suspicious URL privately; do not paste it into chat, tickets, analytics, or public issues.
3. Review Auth and API logs for the affected time window and identities.
4. Reproduce only with controlled test accounts and verify copied callback URLs cannot authenticate another browser.
5. Confirm PKCE, callback sanitization, RLS, logout, and cross-account export isolation before restoring a release.
6. Record the timeline and obtain qualified legal/security advice if customer information may have been exposed.

Security reports can be sent to [support@keeperauto.com](mailto:support@keeperauto.com). Do not include passwords, session tokens, private keys, or unredacted customer records in email.
