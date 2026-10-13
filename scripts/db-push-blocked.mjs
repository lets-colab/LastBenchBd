#!/usr/bin/env node

console.error(`
Last Bench database migration guard

'db:push' is intentionally disabled.

Why:
- production Supabase is migrated through reviewed Supabase migrations;
- drizzle/meta snapshots currently stop at 0001 and are not a trustworthy live ledger;
- running drizzle-kit generate + migrate against production could replay or mis-diff
  already-reconciled schema changes.

Use this workflow instead:
1. edit drizzle/schema.ts;
2. write/review the SQL migration under drizzle/;
3. run scripts/database-foundation-preflight.sql for relational changes;
4. open a PR and pass CI/CodeQL;
5. apply the exact reviewed SQL through the Supabase migration workflow;
6. run Supabase security/performance advisors and release verification.

Do not re-enable this command until drizzle/meta snapshots are regenerated from the
reconciled schema and verified against the Supabase migration ledger.
`);

process.exit(1);
