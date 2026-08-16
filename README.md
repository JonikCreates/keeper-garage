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
- A vehicle-specific maintenance dashboard with saved-car switching, latest completed work, date, mileage, plan status, and repeatable service history
- Passwordless email, temporary guest access, and Supabase OAuth sign-in with Google
- Profile and security controls for display name, email, phone, and linked identities
- Explicit visitor, guest, and recoverable-member access states ready for future server-verified subscriptions and PDF exports

Keeper is a React + Vite site hosted by GitHub Pages. Supabase provides optional guest and email authentication plus an owner-isolated saved garage. The complete issue library remains available without an account.

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

Verified phone updates activate after phone auth and an SMS provider are configured. Anonymous guests receive an owner-isolated Supabase account, but it cannot be recovered after sign-out or cleared browser storage until an identity is linked.

Future paid access must be decided by server-controlled subscription data and enforced by RLS or a protected server function. The frontend access resolver is only the presentation layer; it must never become the authority for a paywall or PDF entitlement.

Database changes live in `supabase/migrations`. Vehicles and maintenance records use Row Level Security so authenticated users—including anonymous guests—can access only rows owned by their `auth.uid()`. Maintenance records are append-only events, allowing recurring work to retain each completed mileage instead of replacing the previous service.

## Data policy

BMW schedules, bulletins, and recalls remain visibly separated from community consensus and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
