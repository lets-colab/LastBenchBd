# Last Bench database migration status

Last verified against the connected production Supabase project on **8 September 2026**.

## Canonical live migration path

Production DDL is applied through the Supabase migration workflow after the exact SQL is reviewed in GitHub.

The legacy Drizzle metadata under `drizzle/meta/` is **not currently a complete migration ledger**: its snapshots stop at migration `0001`. Until those snapshots are regenerated from the reconciled baseline, `pnpm db:push` is intentionally blocked.

Do not infer live migration state from filenames or `drizzle/meta/_journal.json`; verify the Supabase migration ledger.

## Reconciled production ledger

| Supabase version | Supabase migration name | Repository source / purpose |
| --- | --- | --- |
| `20260707002939` | `init_schema` | Initial Last Bench schema / repo `0000` lineage |
| `20260722230414` | `enable_rls_default_deny` | Enable default-deny RLS on the initial public tables |
| `20260907045630` | `lastbench_repo_0001_gifted_sunspot` | Repo `0001` — payouts, audit logs, cohort messages, atomic uniqueness indexes |
| `20260907045642` | `lastbench_repo_0002_ai_guide_personas` | Repo `0002` — `ai_guide` enum + `aiChatMessages.guide` |
| `20260907045717` | `foundation_security_hardening` | RLS on 0001 tables + trigger search-path hardening |
| `20260907051323` | `foundation_relational_integrity` | Repo `0003` — explicit FKs, profile/cohort uniqueness and query-path indexes |

## Pending reviewed migration

`drizzle/0004_supabase_identity_storage.sql` is the next migration. It must not be marked live until the exact merged SQL is applied through Supabase and verified.

Purpose:

- document `public.users.openId` as a compatibility external-auth subject that now stores the Supabase Auth UUID
- create the private `student-documents` Storage bucket
- enforce a 10 MB file limit
- allow PDF/JPEG/PNG content types
- add authenticated `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies restricted to a first folder segment equal to `auth.uid()::text`

Before `0004` is applied, production `storage.buckets` had **0 rows** and `auth.users` had **0 rows**. No production user or file is fabricated as migration evidence.

## Relational foundation verification

Before `0003`:

- no duplicate `students.userId`
- no duplicate `tutors.userId`
- no duplicate `mentors.userId`
- no duplicate cohort memberships
- no duplicate AI memory keys
- no duplicate error signatures before 0001 uniqueness was restored
- no checked orphan relationships across users, applications, documents, referrals, messaging, notifications, cohorts, AI history or AI memory
- all checked product tables contained 0 rows at reconciliation time

After `0003`:

- live public schema reported 21 foreign-key constraints
- one-profile-per-user unique indexes exist for students, tutors and mentors
- cohort membership uniqueness is enforced
- conversation, application, notification, payout and AI-history query indexes are present
- default `NO ACTION` foreign-key behavior prevents implicit deletion of product records when identity rows are removed

## Security and performance posture

After the relational foundation migration, Supabase's security advisor reported no foundation `ERROR` or `WARN` findings. Remaining public-table notices were informational `RLS Enabled No Policy` notices, matching the server-only database posture.

The performance advisor reported expected informational `unused_index` notices because the production business tables had no representative traffic at reconciliation time. Reassess those indexes only after real traffic exists.

Migration `0004` introduces direct authenticated access only to `storage.objects` for the `student-documents` bucket; it does **not** open direct authenticated access to the public product tables.

## Required workflow for schema changes

1. Edit `drizzle/schema.ts` when the public product schema changes.
2. Write and review the matching SQL migration under `drizzle/`.
3. Run integrity preflight for relational/data changes.
4. Pass CI and CodeQL in a GitHub PR.
5. Merge the exact reviewed SQL.
6. Apply the exact merged SQL through the Supabase migration workflow.
7. Re-run security and performance advisors.
8. Verify the affected product journey.
9. Update this ledger with the exact Supabase migration version.

Do not restore automated `drizzle-kit generate && drizzle-kit migrate` production behavior until `drizzle/meta` has been regenerated and compared against both the current schema and the Supabase ledger.
