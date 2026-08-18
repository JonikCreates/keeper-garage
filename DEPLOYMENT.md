# Keeper deployment

## Production shape

Cloudflare Pages is the primary static host. GitHub Pages remains a rollback target until the Cloudflare custom-domain release is proven. Supabase remains the authentication and data service.

Cloudflare Pages project settings:

- Repository: `JonikCreates/keeper-garage`
- Production branch: `master`
- Root directory: repository root
- Build command: `pnpm build`
- Output directory: `dist`
- Node: `22.13.0` or newer compatible Node 22
- pnpm: `10`

Build environment variables:

- `VITE_SUPABASE_URL` — public project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — public browser key, never a secret/service-role key
- `VITE_SITE_URL` — the current public site origin

The default build uses root paths for Cloudflare. `pnpm build:github-pages` uses `/keeper-garage/`, hash navigation, and the same dedicated callback document for the fallback host. Production source maps are disabled.

## Release order

1. Run lint, tests, dependency audit, root production build, and GitHub Pages fallback build.
2. Merge through a reviewed pull request and confirm GitHub Pages still works.
3. Connect the Cloudflare Pages project to GitHub and deploy to its assigned `pages.dev` hostname.
4. Add that exact `/auth/callback/` URL to Supabase and the exact origin to Google only while testing authentication there.
5. Run guest, email, Google, callback-sharing, logout, account-switch, two-account RLS, maintenance-save, vehicle-delete, and export tests.
6. Only after all gates pass, attach `keeperauto.com`; redirect `www.keeperauto.com` to the canonical apex.
7. Change Supabase Site URL and production redirect allowlists to the custom domain, then repeat the release tests.
8. Keep GitHub Pages available through a stabilization window before considering retirement.

Do not attach the custom domain when any authentication, URL-sharing, logout, or cross-account test fails.

## Headers and caching

`public/_headers` applies CSP, clickjacking protection, MIME sniffing protection, a no-referrer policy, restricted browser capabilities, no-store callback handling, no-cache HTML, and one-year immutable caching for hashed assets.

## DNS safety

The domain's Cloudflare Email Routing MX records, SPF record, DKIM records, DMARC record, and verification records are outside the website deployment. Never delete or replace them during Pages setup. Add only the Pages custom-domain records Cloudflare requests after recording the existing DNS state.

## Rollback

If a Cloudflare release fails, remove or disable the custom Pages domain assignment and restore the prior web DNS records without touching mail records. Keep the GitHub Pages URL and its Supabase callback allowlist active during the rollback window. Revoke test sessions and remove temporary preview redirects after testing.
