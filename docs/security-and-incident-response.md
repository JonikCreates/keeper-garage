# Keeper security and incident reference

This developer reference is a preparation checklist, not a substitute for a formal security or incident-response program.

## Credential locations and rotation

- Supabase publishable key: GitHub Pages build configuration. It is intended for browser use, but can be rotated in Supabase API settings and then replaced in the deployment configuration.
- Supabase secret/service-role keys: Supabase API settings and server-only environments. Never place them in Vite variables or the repository. Rotate immediately if exposed.
- Google OAuth client secret: Google Auth Platform and Supabase's Google provider settings. Rotate in Google, then replace only in Supabase.
- SMTP credentials: Supabase Authentication SMTP settings. Rotate with the email provider and update Supabase.
- JWT signing keys: Supabase signing-key settings. Follow Supabase's staged rotation procedure because active sessions depend on them.

## Authorization locations

- Browser presentation permissions: `src/access.ts`.
- Authentication/session lifecycle: `src/useKeeperAuth.ts`.
- Database tables, grants, RLS, legal consent, entitlements, deletion requests, and protected export RPC: `supabase/migrations`.
- Client export request: `src/keeperApi.ts`.

Frontend permission checks improve the interface but are not the authority. RLS and protected database functions remain authoritative.

## Logs to review

- Supabase Authentication logs for signup, verification, login, refresh, recovery, and provider failures.
- Supabase Postgres/API logs for RLS, RPC, and database failures.
- `public.security_events` for bounded Keeper account activation, legacy upgrade, export, and deletion-request events. It must not contain passwords, tokens, keys, or full garage records.
- GitHub Actions deployment logs for build and release failures.

## First response to suspected exposure

1. Stop the affected release or integration without deleting evidence.
2. Identify the credential, affected environment, time window, and accessible data.
3. Rotate the exposed credential at its issuing provider.
4. Review Supabase Auth, API, Postgres, and Keeper security-event logs.
5. Verify RLS and grants before restoring service.
6. Preserve a timeline and obtain qualified legal/security guidance for notification duties.
