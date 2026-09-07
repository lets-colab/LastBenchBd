# Last Bench database migration status

Last verified against the connected production Supabase project on **7 September 2026**.

## Canonical live migration path

Production DDL is applied through the Supabase migration workflow after the exact SQL is reviewed in GitHub.

The legacy Drizzle metadata under `drizzle/meta/` is **not currently a complete migration ledger**: its snapshots stop at migration `0001`. Until those snapshots are regenerated from the reconciled baseline, `pnpm db:push` is intentionally blocked.

Do not infer live migration state from filenames or `drizzle/meta/_journal.json`; verify the Supabase migration ledger.

## Reconciled production ledger

| Supabase version | Supabase migration name | Repository source / purpose |
| --- | --- | --- |
| `20260707002939` | `init_schema` | Initial Last Bench schema / repo `0000` lineage |
| `20260722230414` | `enable_rls_default_deny` | Enable default-deny RLS on the initial public tables |
| `20260907045630` | `lastbench_repo_0001_gifted_sunspot` | Applied repo `drizzle/0001_gifted_sunspot.sql` — payouts, audit logs, cohort messages, atomic uniqueness indexes |
| `20260907045642` | `lastbench_repo_0002_ai_guide_personas` | Applied repo `drizzle/0002_ai_guide_personas.sql` — `ai_guide` enum + `aiChatMessages.guide` |
| `20260907045717` | `foundation_security_hardening` | Enabled RLS on the 0001 tables and pinned trigger-function search paths |

`drizzle/0003_foundation_relations.sql` is the reviewed next migration. It promotes the relational contract into explicit foreign keys, one-profile-per-user uniqueness, cohort membership uniqueness, and query indexes while preserving records with default `NO ACTION` foreign-key behavior.

## Preflight result before relational hardening

The production project was inspected before promoting `0003`:

- no duplicate `students.userId`
- no duplicate `tutors.userId`
- no duplicate `mentors.userId`
- no duplicate cohort memberships
- no duplicate AI memory keys
- no duplicate error signatures before 0001 uniqueness was restored
- no checked orphan relationships across users, applications, documents, referrals, messaging, notifications, cohorts, AI history or AI memory
- all checked product tables contained **0 rows** at the time of reconciliation

Because the production product tables were empty, adding the reviewed relational constraints does not require data cleanup or destructive reconciliation.

## Security posture after 0001/0002 restoration

Supabase's security advisor was re-run after the repair:

- no remaining `ERROR` findings
- no remaining `WARN` findings
- the remaining notices are informational `RLS Enabled No Policy` notices

That is the current intentional server-only posture: public-schema tables have RLS enabled and no direct anon/authenticated policies. If the product later introduces direct Supabase client access, explicit policies must be designed before enabling that access.

Supabase advisor reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Required workflow for the next schema change

1. Edit `drizzle/schema.ts`.
2. Write and review the matching SQL migration under `drizzle/`.
3. Run the database preflight for relational changes.
4. Pass CI and CodeQL in a GitHub PR.
5. Apply the **exact reviewed SQL** through the Supabase migration workflow.
6. Re-run security and performance advisors.
7. Verify affected product journeys.
8. Update this ledger.

Do not restore automated `drizzle-kit generate && drizzle-kit migrate` production behavior until `drizzle/meta` has been regenerated and compared against both the current schema and the Supabase ledger.