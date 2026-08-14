# Keeper

Configuration-aware maintenance intelligence for the U.S.-spec 2016 BMW F30 3 Series, published as a standalone static site at [jonikcreates.github.io/keeper-garage](https://jonikcreates.github.io/keeper-garage/).

The platform library covers the 320i, 328i, 328d, 330e, and 340i. Maintenance and issue records carry applicability rules for trim, engine, drivetrain, and transmission, so a saved vehicle only receives relevant recommendations.

## What it covers

- 320i, 328i, 328d, 330e, and 340i trims
- Engine, drivetrain, and transmission applicability
- Urgent, watch-list, and optional project lanes
- 40 sourced issue patterns and a condition-based maintenance planner
- Passwordless email, guest access, and provider-ready Google and Apple authentication
- Profile and security controls for display name, email, phone, and linked identities

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

Google and Apple sign-in activate automatically after those providers are enabled in Supabase. Verified phone updates activate after phone auth and an SMS provider are configured. Unavailable providers remain disabled instead of sending customers into a broken authentication flow.

Database changes live in `supabase/migrations`. The garage tables use Row Level Security so authenticated users—including anonymous guests—can access only rows owned by their `auth.uid()`.

## Data policy

BMW schedules, bulletins, and recalls remain visibly separated from community consensus and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
