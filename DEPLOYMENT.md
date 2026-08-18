# Keeper deployment

## Target workflow

`debug` is the normal development branch and produces Cloudflare preview deployments. `main` is the reviewed production branch and will update the Pages production deployment and custom domain. The existing `master`-based GitHub Pages site remains available as a rollback target until Cloudflare, the custom domain, and Supabase authentication have all passed release testing.

## Cloudflare Pages project

Create a Git-integrated Pages project with these settings:

- Repository: `JonikCreates/keeper-garage`
- Production branch: `main`
- Preview branches: custom branches, include `debug`
- Root directory: repository root (leave the field blank)
- Build command: `pnpm build`
- Output directory: `dist`
- Build system: version 3
- Node: `22.13.0` or newer Node 22 (`NODE_VERSION=22.16.0` is a safe pin)
- pnpm: 10 (`PNPM_VERSION=10.11.1` is a safe pin)

Cloudflare automatically assigns a production hostname such as `<PROJECT>.pages.dev`. A push to `debug` also gets an immutable deployment URL and the stable branch alias `debug.<PROJECT>.pages.dev`; slashes and other non-alphanumeric branch-name characters become hyphens.

## Build variables

Configure the following separately for both Preview and Production in **Settings > Environment variables**:

| Variable | Preview | Production |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Existing public Supabase project URL | Same value |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Existing browser-safe publishable key | Same value |
| `VITE_SITE_URL` | `https://keeperauto.com/` | `https://keeperauto.com/` |
| `NODE_VERSION` | `22.16.0` | `22.16.0` |
| `PNPM_VERSION` | `10.11.1` | `10.11.1` |

Do not add a Supabase service-role key, database password, Google client secret, SMTP password, or other private credential to a `VITE_` variable. The default build fails on Cloudflare when `VITE_SITE_URL` is missing so an unverified domain cannot accidentally be published in canonical metadata.

## Routing, headers, and caching

Keeper is a static React SPA. Cloudflare Pages serves unknown routes through the root SPA when the project has no top-level `404.html`, so `/maintenance`, `/issues`, `/profile`, and the legal routes work when opened or refreshed directly. The real `/auth/callback/index.html` file remains independently addressable for PKCE authentication.

`public/_headers` supplies security headers, no-store callback handling, no-cache HTML, and one-year immutable caching for hashed assets. Do not add a blanket `/* /index.html 200` redirect unless Cloudflare's SPA fallback behavior changes; the built-in fallback preserves the dedicated callback document and static assets.

The fallback command `pnpm build:github-pages` retains `/keeper-garage/` asset paths and hash navigation for the existing GitHub Pages site. Do not disable `.github/workflows/deploy-pages.yml` until the Cloudflare release is proven.

## Supabase rollout

In **Supabase > Authentication > URL Configuration**:

1. Keep **Site URL** on the currently trusted production site until cutover.
2. Add `http://localhost:5173/auth/callback/` for local testing.
3. Keep `https://jonikcreates.github.io/keeper-garage/auth/callback/` during the rollback window.
4. Add the stable debug alias: `https://debug.<PROJECT>.pages.dev/auth/callback/`.
5. Add the Pages production URL: `https://<PROJECT>.pages.dev/auth/callback/`.
6. After the custom domain is verified, add `https://<ACTUAL_DOMAIN>/auth/callback/` and make `https://<ACTUAL_DOMAIN>/` the Site URL.

Prefer exact callback URLs. If authentication must be tested on an immutable preview URL, add only that exact preview callback temporarily and remove it afterward rather than enabling a broad production wildcard.

For Google sign-in, the Google OAuth client's authorized redirect URI remains Supabase's provider endpoint:

`https://bxryksfjsicgiaqfuzlm.supabase.co/auth/v1/callback`

Add each website origin being actively tested as an authorized JavaScript origin: the stable debug alias, the Pages production hostname, and the actual custom origin after cutover. Keep the Google client secret only in Supabase's provider settings.

## Custom domain and redirect

After the Pages production and debug preview pass testing:

1. Open **Workers & Pages**, select Keeper, open **Custom domains**, and choose **Set up a domain**.
2. Enter the actual canonical hostname. Do not substitute a placeholder from this document.
3. Allow Cloudflare to create the Pages DNS record. Do not alter MX, SPF, DKIM, DMARC, Email Routing, or unrelated verification records.
4. Associate the alternate hostname as well, then create a Cloudflare Bulk Redirect from the alternate hostname to the canonical hostname with status `301`, query-string preservation, subpath matching, and path-suffix preservation.
5. Update Production `VITE_SITE_URL`, trigger a new production deployment, then update the Supabase Site URL and exact redirect allowlist.

For an apex domain, the domain must be an active zone in the same Cloudflare account as the Pages project. For a subdomain, complete **Set up a domain** before manually creating any CNAME Cloudflare requests.

## Release gates

Before merging `debug` into `main`, test the stable debug preview on desktop and mobile:

- Garage, Maintenance, Known Issues, Profile, Terms, Privacy, and Contact navigation
- Direct URL entry and refresh on every route
- Guest mode and catalog filtering
- Email signup, verification, login, resend, recovery, and logout
- Google account selection, callback cleanup, logout, and account switching
- User A cannot read, change, delete, or export User B's data
- Garage saves, maintenance records, tracked issues, vehicle removal, and exports
- No tokens, callback codes, source maps, private keys, or service-role values in output or URLs

Do not attach the custom domain or disable GitHub Pages when any authentication, routing, logout, cross-account, or data-save check fails.

## Rollback

If a Cloudflare release fails, remove or disable the Pages custom-domain assignment and restore only the prior web DNS records. Do not touch mail or verification records. Keep the GitHub Pages URL and callback allowlist active during the stabilization window.
