# Keeper

Configuration-aware maintenance intelligence for the U.S.-spec 2016 BMW F30 3 Series, published as a standalone static site at [jonikcreates.github.io/keeper-garage](https://jonikcreates.github.io/keeper-garage/).

The platform library covers the 320i, 328i, 328d, 330e, and 340i. Maintenance and issue records carry applicability rules for trim, engine, drivetrain, and transmission, so a saved vehicle only receives relevant recommendations.

## What it covers

- 320i, 328i, 328d, 330e, and 340i trims
- Engine, drivetrain, and transmission applicability
- Urgent, watch-list, and optional project lanes
- 40 sourced issue patterns and a condition-based maintenance planner

Keeper is a React + Vite site hosted by GitHub Pages. It has no account system, cookies, database, or browser storage; configuration choices reset when the page is refreshed.

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

## Data policy

BMW schedules, bulletins, and recalls remain visibly separated from community consensus and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
