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
| `20260907114150` | `create_class_a_registrations` | CLASS[Λ] registration intake table |
| `20260908090907` | `lastbench_api_runtime_role` | Dedicated server runtime database role |
| `20260908102639` | `lastbench_repo_0004_supabase_identity_storage` | Repo `0004` — Supabase Auth identity contract + private student document storage |

## Supabase identity + storage verification

`drizzle/0004_supabase_identity_storage.sql` was merged in PR #50 and then applied as the exact production migration above.

Verified live after application:

- `public.users.openId` remains a compatibility column and is documented as the Supabase Auth external subject UUID
- private bucket `student-documents` exists
- bucket public access is disabled
- maximum object size is 10 MB
- allowed MIME types are PDF, JPEG and PNG
- four `storage.objects` RLS policies exist for authenticated `SELECT`, `INSERT`, `UPDATE` and `DELETE`
- every policy restricts access to the top-level folder matching `auth.uid()::text`
- `auth.users` still contained 0 users at verification time; no production account was fabricated for testing

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

Supabase advisors were re-run after `0004`.

Security:

- no `ERROR` findings
- no `WARN` findings
- 19 informational `RLS Enabled No Policy` notices remain on server-only public product tables; this is intentional default-deny behavior
- the new `student-documents` storage path has explicit authenticated RLS policies and is not part of those notices

Performance:

- only informational `unused_index` findings remain for relational foundation indexes
- these are expected while the production product tables have no representative traffic and should not be removed solely from zero historical usage

`0004` introduces direct authenticated access only to `storage.objects` for the private student-document bucket. It does **not** open direct authenticated access to the public product tables.

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
