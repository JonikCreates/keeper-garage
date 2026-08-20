# Vehicle catalog validation

Keeper validates the vehicle catalog in two layers.

## Fast local audit

Run:

```bash
npm run test:catalog
```

The audit enumerates the exact make, model, year, trim, engine, drivetrain, and transmission combinations reachable through the UI. It checks selector validity, garage serialization and restoration, the generated Supabase fitment manifest, maintenance resolution, known-issue fitment, fluids/specifications, ownership research, cross-platform leakage, and orphaned catalog data.

The normal `npm test` command includes this audit, so adding a selector option without maintenance or a database fitment fails the default test suite.

When the frontend catalog changes, create a **new timestamped migration**. Never rewrite a migration that may already be deployed:

```bash
npm run generate:catalog-migration -- supabase/migrations/YYYYMMDDHHMMSS_validate_catalog_fitments.sql
```

The generated migration embeds the exact frontend manifest, refreshes `vehicle_catalog_fitments`, and installs a trigger that rejects non-catalog vehicle rows. It does not weaken `vehicles` RLS or expose the manifest table to browser roles.

## Supabase integration audit

Use a dedicated empty test user with Keeper's normal `authenticated_account` entitlement. Do not use a real member account or a service-role key.

Set these environment variables outside source control:

```text
KEEPER_TEST_SUPABASE_URL
KEEPER_TEST_SUPABASE_PUBLISHABLE_KEY
KEEPER_TEST_USER_EMAIL
KEEPER_TEST_USER_PASSWORD
```

Then run:

```bash
npm run test:integration
```

The integration audit signs in through the publishable client, removes stale records bearing only the `KeeperCatalogTest:` marker, inserts every UI configuration, reads each row back through RLS, compares all persisted fields, creates one downstream custom-work item and one service record, verifies anonymous isolation, and deletes the test vehicles in a `finally` cleanup. Deleting the isolated vehicle rows cascades only the test maintenance records.

Optional variables `KEEPER_TEST_OTHER_USER_EMAIL` and `KEEPER_TEST_OTHER_USER_PASSWORD` add a second-user RLS read test. Set `KEEPER_REQUIRE_INTEGRATION=1` in CI when missing credentials should fail instead of reporting a skip.
