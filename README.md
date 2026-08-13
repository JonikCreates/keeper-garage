# Keeper

Configuration-aware maintenance intelligence for the U.S.-spec 2016 BMW F30 3 Series.

The platform library covers the 320i, 328i, 328d, 330e, and 340i. Maintenance and issue records carry applicability rules for trim, engine, drivetrain, and transmission, so a saved vehicle only receives relevant recommendations.

## Stack

- vinext and React
- Cloudflare D1
- Drizzle migrations
- Sign in with ChatGPT for private vehicle records

## Local development

```bash
npm install
npm run dev
```

```bash
npm run lint
npm run build
npm test
```

## Data policy

BMW schedules, bulletins, and recalls remain visibly separated from community consensus and individual owner reports. The issue library is an inspection and research tool, not a diagnosis. Parts, fluids, repair procedures, recall eligibility, and fitment must be verified for the exact VIN.
