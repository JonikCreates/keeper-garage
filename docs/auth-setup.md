# Keeper account setup

Keeper uses Supabase Auth project `bxryksfjsicgiaqfuzlm`. The frontend contains only the project URL and publishable browser key. Provider secrets, SMTP credentials, JWT signing material, and the service-role key belong in managed server settings and must never be committed or added to Vite environment variables.

## URLs already configured

- Site URL: `https://jonikcreates.github.io/keeper-garage/`
- Production redirect: `https://jonikcreates.github.io/keeper-garage/`
- Local redirect: `http://localhost:5173/keeper-garage/`
- Provider callback: `https://bxryksfjsicgiaqfuzlm.supabase.co/auth/v1/callback`

## Google

1. In Google Auth Platform, create a Web application OAuth client.
2. Use `https://jonikcreates.github.io` as the production JavaScript origin.
3. Register the Supabase provider callback above as an authorized redirect URI.
4. Keep scopes to `openid`, email, and profile unless the product genuinely needs more.
5. Enter the client ID and client secret under Supabase → Authentication → Sign In / Providers → Google, enable the provider, and save.

## Email and password

1. Open Supabase → Authentication → Sign In / Providers → Email.
2. Keep Email enabled and keep Confirm email enabled so a newly entered address is not trusted before verification.
3. Keep secure password storage and email delivery inside Supabase Auth; Keeper never stores passwords.
4. Add the production and local URLs above to Authentication → URL Configuration. Account flows use the same allowed path with `account=verify` or `account=recovery` query values.
5. Before commercial launch, configure a custom SMTP provider under Authentication → SMTP Settings. Supabase's trial sender is rate-limited and not a production email service.
6. Test signup verification, resend, login, password recovery, expired links, and a password update on both desktop and mobile.

## Existing anonymous garages

Do not disable or delete existing anonymous users until their garages have been claimed. Keeper no longer creates anonymous users, and database policies make existing anonymous garages read-only. Before email/password or Google authentication, Keeper asks the authenticated anonymous owner for an expiring, single-use claim ticket. After the permanent account is authenticated and entitled, the person must explicitly approve the transactional ownership transfer. The browser never supplies an owner ID, and a consumed ticket returns the same result without duplicating records.

## Required release checks

- Guest visitors have no Supabase session and cannot write to owner tables.
- Existing anonymous accounts can read their own garage but cannot insert, update, delete, or export.
- A permanent user without current legal acceptance cannot write.
- User A cannot read or export a vehicle owned by User B.
- Export uses `get_keeper_vehicle_export`, which independently checks the entitlement and vehicle owner.
- Signing out immediately clears active garage state before Demo Mode renders.
- No `.env`, service-role key, OAuth secret, SMTP secret, or access token is tracked by Git.

## Release check

After Google is enabled, reload Keeper and confirm its button changes from “Google setup required” to “Continue with Google.” Create or sign into a Keeper Profile, accept the current legal versions, save a vehicle, sign out, sign back in, and verify the same garage returns.
