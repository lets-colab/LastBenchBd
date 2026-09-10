# Last Bench database migration status

Last verified against the connected production Supabase project on **10 September 2026**.

## Canonical live migration path

Production DDL is applied through the Supabase migration workflow after the exact SQL is reviewed in GitHub or otherwise explicitly reviewed as an infrastructure migration.

The legacy Drizzle metadata under `drizzle/meta/` is **not currently a complete migration ledger**: its snapshots stop before the reconciled production state. Until those snapshots are regenerated from the live baseline, `pnpm db:push` remains intentionally blocked.

Do not infer live migration state from filenames or `drizzle/meta/_journal.json`; verify the Supabase migration ledger directly.

## Reconciled production ledger

| Supabase version | Supabase migration name | Purpose |
| --- | --- | --- |
| `20260707002939` | `init_schema` | Initial Last Bench schema / repo `0000` lineage |
| `20260722230414` | `enable_rls_default_deny` | Enable default-deny RLS on initial public tables |
| `20260907045630` | `lastbench_repo_0001_gifted_sunspot` | Repo `0001` — payouts, audit logs, cohort messages, atomic uniqueness indexes |
| `20260907045642` | `lastbench_repo_0002_ai_guide_personas` | Repo `0002` — AI guide persona schema |
| `20260907045717` | `foundation_security_hardening` | RLS + trigger search-path hardening |
| `20260907051323` | `foundation_relational_integrity` | Repo `0003` — explicit FKs, profile/cohort uniqueness and query-path indexes |
| `20260907114150` | `create_class_a_registrations` | CLASS[Λ] registration intake table |
| `20260908090907` | `lastbench_api_runtime_role` | Dedicated server runtime database role |
| `20260908102639` | `lastbench_repo_0004_supabase_identity_storage` | Repo `0004` — Supabase Auth identity contract + private student document storage |
| `20260908102929` | `create_drx_social_engine_runtime` | DR.X social-engine runtime tables and supporting schema |
| `20260908103022` | `add_drx_social_activation_gates` | DR.X social-engine activation/guardrail schema |
| `20260910045538` | `lastbench_homepage_signups` | Repo `0005` — insert-only, RLS-protected homepage lead intake |

## Supabase identity + storage verification

`drizzle/0004_supabase_identity_storage.sql` was merged and applied to production.

Verified live:

- `public.users.openId` remains a compatibility column for the Supabase Auth external subject UUID
- private bucket `student-documents` exists
- bucket public access is disabled
- maximum object size is 10 MB
- allowed MIME types are PDF, JPEG and PNG
- storage policies restrict authenticated access to the user's own top-level folder
- authentication is Supabase Auth; Manus OAuth is no longer the current production identity contract

## Relational foundation verification

The relational foundation established explicit foreign keys, one-profile-per-user uniqueness, cohort membership uniqueness and query-path indexes. Production DDL is not performed automatically at server startup.

## DR.X social-engine verification

The live ledger includes the runtime and activation-gate migrations. Current spot checks show:

- `drx_social_inbound_events` exists and currently contains 0 rows
- `drx_social_send_ledger` exists and currently contains 0 rows
- both tables use `event_key` as their primary-key/indexed identifier
- both have nullable `campaign_id uuid` foreign-key paths

No production social events were fabricated for verification.

## Homepage signup verification

`drizzle/0005_lastbench_signups.sql` was merged to `main` and then applied unchanged through the Supabase migration workflow.

Verified live:

- `public.lastbench_signups` exists with RLS enabled
- `anon` and `authenticated` have INSERT permission only
- public roles have no SELECT, UPDATE or DELETE permission
- the identity sequence grants only the USAGE needed for inserts
- exactly one INSERT policy validates name, contact, source, language and explicit contact consent
- an anonymous Supabase REST submission returned HTTP 201
- the synthetic verification row was deleted immediately afterward; the table returned to 0 rows

## Security and performance posture — 10 September 2026

Security advisor:

- no `ERROR` findings
- no `WARN` findings
- informational `RLS Enabled No Policy` notices remain on server-owned/default-deny public tables; this is consistent with the current architecture

Performance advisor:

- informational unused-index notices remain and are expected while production traffic is limited
- two informational unindexed-foreign-key findings currently remain:
  - `drx_social_inbound_events.campaign_id`
  - `drx_social_send_ledger.campaign_id`

These two index opportunities are not a current release blocker because both tables are empty, but they should be addressed through a reviewed migration before social-engine traffic becomes meaningful. Do not add or remove production indexes solely to silence an advisor without confirming the query path.

## Required workflow for schema changes

1. Edit `drizzle/schema.ts` when the Drizzle-managed public product schema changes.
2. Write and review matching SQL under `drizzle/` or the explicitly governed infrastructure migration source.
3. Run integrity preflight for relational/data changes.
4. Pass CI and CodeQL.
5. Merge/review the exact SQL.
6. Apply the exact reviewed SQL through the Supabase migration workflow.
7. Re-run security and performance advisors.
8. Verify the affected product journey.
9. Update this ledger with the exact Supabase migration version.

Do not restore automated `drizzle-kit generate && drizzle-kit migrate` production behavior until `drizzle/meta` has been regenerated and compared against both the current schema and the Supabase ledger.
