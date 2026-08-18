# Keeper account setup

Keeper uses Supabase Auth project `bxryksfjsicgiaqfuzlm`. The browser receives only the project URL and publishable key. Provider secrets, SMTP credentials, JWT signing material, and service-role keys stay in managed provider settings and must never be committed or exposed through a `VITE_` variable.

## Authentication flow

Keeper uses Supabase PKCE with automatic URL detection disabled. Every email and Google flow returns to the dedicated `/auth/callback/` document. The callback captures the one-time authorization code in memory, removes all callback parameters from browser history, exchanges the code, and then returns to Profile with a clean URL.

Do not change the client back to the implicit flow. A copied URL must never contain a reusable access token, refresh token, provider token, or authorization code.

## Redirect allowlist

Add only the environments being actively tested:

- Local: `http://localhost:5173/auth/callback/`
- GitHub Pages fallback: `https://jonikcreates.github.io/keeper-garage/auth/callback/`
- Cloudflare Pages production hostname: `https://<PROJECT>.pages.dev/auth/callback/`
- Stable debug preview alias: `https://debug.<PROJECT>.pages.dev/auth/callback/`
- Production after the release gate: `https://<ACTUAL_DOMAIN>/auth/callback/`

Keep the Supabase Site URL on the currently trusted production origin until the custom-domain release gate passes. Avoid broad production wildcard redirects. Use the stable `debug` branch alias for routine preview authentication; if an immutable preview URL must be tested, allow only that exact callback temporarily and remove it afterward.

The Google OAuth client uses each website origin as an authorized JavaScript origin. Its authorized redirect URI remains Supabase's provider endpoint:

`https://bxryksfjsicgiaqfuzlm.supabase.co/auth/v1/callback`

## Google

1. In Google Auth Platform, use a Web application OAuth client.
2. Add only the origins being actively tested; add `https://<ACTUAL_DOMAIN>` only after replacing the placeholder with the verified custom domain.
3. Register the Supabase provider endpoint above as the authorized redirect URI.
4. Keep scopes to `openid`, email, and profile.
5. Store the client ID and client secret only in Supabase Authentication provider settings.
6. Test a new Google account, an existing account, account selection, logout, and switching between two accounts.

## Email and password

Keep email confirmation enabled. Configure custom SMTP before commercial launch, then test signup verification, resend, login, recovery, expired and replayed links, password update, email change, logout, and account switching on desktop and mobile.

## Existing anonymous garages

Do not delete older anonymous users until their garages have been claimed. Keeper no longer creates anonymous users. Existing anonymous garages are read-only and use an expiring, single-use server claim before a deliberate transactional transfer to a permanent account.

## Required release checks

- A shared callback URL opens without signing a second browser into the first browser's account.
- Callback parameters disappear before exchange and do not remain in history.
- Guest visitors have no Supabase session and cannot write to owner tables.
- Existing anonymous identities can read only their garage and cannot write or export.
- User A cannot read, change, delete, or export User B's vehicles or records.
- Export uses `get_keeper_vehicle_export`, which independently checks entitlement and ownership.
- Logout immediately removes the personal garage before Demo Mode appears.
- No secret, token, `.env` file, source map, or provider credential is published.
