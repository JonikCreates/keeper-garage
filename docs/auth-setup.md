# Keeper authentication setup

Keeper uses Supabase Auth project `bxryksfjsicgiaqfuzlm`. The frontend only contains the project URL and publishable browser key. Provider secrets belong in the Supabase dashboard and must never be committed or added to Vite environment variables.

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

## Release check

After Google is enabled, reload Keeper and confirm its button changes from “Google setup required” to “Continue with Google.” Complete a new member sign-in, confirm the account panel reopens, save a vehicle, sign out, sign back in, and verify the same garage returns.
