# Keeper

Configuration-aware maintenance and ownership research for U.S.-spec enthusiast platforms across 14 makes. Cloudflare Pages is the production target, with [GitHub Pages](https://jonikcreates.github.io/keeper-garage/) retained as the rollout fallback.

The platform library covers Acura, BMW, Porsche, Subaru, Mazda, Volkswagen, Audi, Ford, Honda, Lexus, Nissan, Toyota, Scion, and Mercedes-Benz. Maintenance and issue records carry applicability rules for brand, generation, year, model type, engine, drivetrain, transmission, and exact research profile, so a saved vehicle only receives relevant recommendations.

## What it covers

- E36 M42, M44, M50, M52, S50US, and S52US schedules across manual and automatic configurations
- E39 M52, M54, M62, and S62 schedules across Sedan, Touring, manual, and automatic configurations
- E46 M52TU, M54, M56, and S54 schedules across Sedan, Coupe, Convertible, Touring, AWD, manual, automatic, and SMG configurations
- F30 320i, 328i, 328d, 330e, 330i, 335i, and 340i trims
- BMW E9x 3 Series/M3, grouped F10 5 Series/M5, and grouped F32/F33 4 Series Coupe/Convertible families
- Subaru VA WRX, WRX STI, Type RA, and S209
- Porsche 911 996.1, 996.2, 997.1, and 997.2 Carrera, Turbo, Targa, GT, RS, GTS, and special-model branches
- Mazda MX-5 Miata NA, NB, NC, and ND, including Mazdaspeed, PRHT, RF, manual, and automatic branches
- Enhanced research for Volkswagen Mk7/Mk8, additional modern BMW platforms, Audi B8/C7, Ford S550, Honda S2000, Lexus IS, Nissan Z/GTR, Toyota/Scion/Subaru 86/BRZ, Toyota Supra A90, and Mercedes-Benz G-Class platforms
- Acura Integra Type S DE5 and Honda Civic Type R FL5, with their shared K20C1 architecture kept model-specific across maintenance, issue, recall, and PPI guidance
- Source-backed Nissan 350Z, 370Z, and GT-R NISMO variants retained as trims within their normal model families
- 33 enhanced research workbooks normalized into 389 populated configuration profiles and schedules, 2,232 reusable service rows, 1,111 grouped issue records, and 114 ownership-intelligence notes
- Generation, year, engine, drivetrain, and transmission applicability
- Urgent, watch-list, and optional project lanes
- Sourced issue patterns and workbook-derived maintenance planners with engine, body, and driveline branches
- A light-first forum theme: white and blue by default, charcoal and safety orange when dark mode is selected, controlled by a moving M Parallel-inspired wheel
- Clean Cloudflare page routes with a GitHub Pages-safe fallback build
- Account-owned multi-vehicle picker with separate add and edit states
- A simplified vehicle-specific maintenance view with compact last-completed, next-due, and status rows that expand only when more detail is wanted
- Clearly separated Overdue, Due Soon, and Done sections plus lightweight status, category, fluid, and no-schedule filters
- Optional per-service fluid records—including product, brand, viscosity/type, specification, quantity, unit, filter, and notes—with previous-product recall and a current-fluid summary
- Organized custom maintenance categories with mileage, time, combined, or no-schedule plans for recurring service and one-time repairs
- Vehicle-specific work lists for researched known issues and owner-added repairs, restoration, or cosmetic jobs
- Vehicle-specific Known Issues search with aliases, symptoms, partial-word and typo matching, ranked explanations, and a custom-observation fallback
- Reversible owner-tracked issues with date found, mileage found, and Watching, Needs Repair, or Repaired status; removing an active item never deletes completed service records
- High-resolution PNG exports for Keeper accounts, with paginated PDF export included in Keeper Upgrade and Infinite
- Email/password accounts, verification and recovery flows, plus optional Supabase OAuth sign-in with Google
- Profile and security controls for display name, email, password, and linked identities
- Demo-only Guest Mode, read-only legacy garage upgrades, and server-issued versioned Keeper entitlements

Keeper is a React + Vite static site. Supabase Auth uses a dedicated PKCE callback and owner-isolated database policies to provide persistent Keeper Profiles. Signed-out visitors explore a static Demo Garage; they do not receive a Supabase user or permanent storage. The complete issue library remains public.

## Local development

```bash
pnpm install
pnpm dev
```

```bash
pnpm lint
pnpm build
pnpm test
```

The default test command includes an exhaustive offline audit of every vehicle configuration. Use `pnpm test:catalog` for the catalog report and `pnpm test:integration` with an isolated Supabase test user for real save/read/RLS validation. See [`docs/catalog-validation.md`](docs/catalog-validation.md) for setup and the generated migration workflow.

Copy `.env.example` to `.env.local` and add the project URL and publishable browser key when testing authentication locally. Never place a Supabase secret or service-role key in the frontend.

Google sign-in activates automatically after the provider is enabled in Supabase. The application requests the standard OpenID, profile, and email scopes, returns through `/auth/callback/`, and keeps Google disabled instead of sending customers into a broken flow when its credentials are unavailable. Provider configuration is in [`docs/auth-setup.md`](docs/auth-setup.md); Cloudflare rollout and rollback are in [`DEPLOYMENT.md`](DEPLOYMENT.md).

Keeper no longer creates anonymous accounts. Older anonymous garages are preserved as read-only. Before authentication, Keeper creates an expiring server claim; after authentication, the person explicitly chooses whether to transfer the preserved vehicles and related records into that Profile. The claim is single-use and repeat attempts cannot duplicate records.

Keeper Free includes one vehicle and no PDF export. Keeper Upgrade is a $1.99 one-time purchase for three total vehicles and PDF export; Keeper Infinite is a $4.99 one-time purchase for unlimited vehicles and PDF export. Both are permanent one-time products. Paid and launch access is decided by trusted entitlement rows and enforced by database triggers or protected server functions; the frontend is only the presentation layer and cannot grant access.

Database changes live in `supabase/migrations`. Vehicles, tracked maintenance items, and maintenance records use Row Level Security so each signed-in identity can read only rows owned by its `auth.uid()`. Existing anonymous identities are read-only; permanent writes additionally require a current server-controlled account entitlement. Maintenance records are append-only events. New vehicle inserts are limited server-side, while existing over-limit garages remain intact, and the paid PDF export function verifies both a current paid entitlement and selected-vehicle ownership.

## Data policy

Manufacturer schedules, bulletins, and recalls remain visibly separated from preventive ownership guidance, community consensus, and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
