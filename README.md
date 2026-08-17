# Keeper

Configuration-aware maintenance research for the U.S.-spec BMW E36, E39, E46, and F30 generations, published as a standalone static site at [jonikcreates.github.io/keeper-garage](https://jonikcreates.github.io/keeper-garage/).

The platform library covers the U.S. E36, E39, and E46 gasoline ranges plus the F30 320i, 328i, 328d, 330e, 330i, 335i, and 340i. Maintenance and issue records carry applicability rules for generation, year, body style, engine, drivetrain, and transmission, so a saved vehicle only receives relevant recommendations.

## What it covers

- E36 M42, M44, M50, M52, S50US, and S52US schedules across manual and automatic configurations
- E39 M52, M54, M62, and S62 schedules across Sedan, Touring, manual, and automatic configurations
- E46 M52TU, M54, M56, and S54 schedules across Sedan, Coupe, Convertible, Touring, AWD, manual, automatic, and SMG configurations
- F30 320i, 328i, 328d, 330e, 330i, 335i, and 340i trims
- Generation, year, engine, drivetrain, and transmission applicability
- Urgent, watch-list, and optional project lanes
- Sourced issue patterns and workbook-derived maintenance planners with engine, body, and driveline branches
- A light-first forum theme: white and blue by default, charcoal and safety orange when dark mode is selected, controlled by a moving M Parallel-inspired wheel
- GitHub Pages-safe My Garage, Maintenance, and Known Issues routes with responsive navigation
- Account-owned multi-vehicle picker with separate add and edit states
- A simplified vehicle-specific maintenance view with compact last-completed, next-due, and status rows that expand only when more detail is wanted
- Clearly separated Overdue, Do Soon, and Done sections plus lightweight status, category, fluid, and no-schedule filters
- Optional per-service fluid records—including product, brand, viscosity/type, specification, quantity, unit, filter, and notes—with previous-product recall and a current-fluid summary
- Organized custom maintenance categories with mileage, time, combined, or no-schedule plans for recurring service and one-time repairs
- Vehicle-specific work lists for researched known issues and owner-added repairs, restoration, or cosmetic jobs
- Vehicle-specific Known Issues search with aliases, symptoms, partial-word and typo matching, ranked explanations, and a custom-observation fallback
- Reversible owner-tracked issues with date found, mileage found, and Watching, Needs Repair, or Repaired status; removing an active item never deletes completed service records
- Member exports of every completed record for the selected vehicle as a paginated PDF or high-resolution PNG
- Email/password accounts, verification and recovery flows, plus optional Supabase OAuth sign-in with Google
- Profile and security controls for display name, email, password, and linked identities
- Demo-only Guest Mode, read-only legacy garage upgrades, and server-issued account entitlements ready for future subscriptions

Keeper is a React + Vite site hosted by GitHub Pages. Supabase Auth and owner-isolated database policies provide persistent Keeper Profiles. Signed-out visitors explore a static Demo Garage; they do not receive a Supabase user or permanent storage. The complete issue library remains public.

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

Copy `.env.example` to `.env.local` and add the project URL and publishable browser key when testing authentication locally. Never place a Supabase secret or service-role key in the frontend.

Google sign-in activates automatically after the provider is enabled in Supabase. The application requests the standard OpenID, profile, and email scopes, returns to the account panel after OAuth, and keeps Google disabled instead of sending customers into a broken flow when its credentials are unavailable. Provider credential and callback instructions are in [`docs/auth-setup.md`](docs/auth-setup.md).

Keeper no longer creates anonymous accounts. Older anonymous garages are preserved as read-only and can be upgraded in place by linking a permanent identity, keeping the same Supabase user ID and related records.

Future paid access must be decided by trusted entitlement rows and enforced by RLS or protected server functions. The frontend access resolver is only the presentation layer; it is not the authority for a paywall or export entitlement.

Database changes live in `supabase/migrations`. Vehicles, tracked maintenance items, and maintenance records use Row Level Security so each signed-in identity can read only rows owned by its `auth.uid()`. Existing anonymous identities are read-only; permanent writes additionally require a current server-controlled account entitlement. Maintenance records are append-only events, and protected export requests verify both entitlement and selected-vehicle ownership.

## Data policy

BMW schedules, bulletins, and recalls remain visibly separated from community consensus and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
