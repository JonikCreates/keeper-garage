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
- A persistent forum-inspired theme: white and blue by day, charcoal and safety orange by night, controlled by a moving M Parallel-inspired wheel
- GitHub Pages-safe My Garage, Maintenance, and Known Issues routes with responsive navigation
- Account-owned multi-vehicle picker with separate add and edit states
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
