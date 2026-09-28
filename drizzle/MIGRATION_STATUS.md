# Last Bench database migration status

Last verified against the connected production Supabase project on **28 September 2026**.

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

### Live ledger additions verified on 27 September 2026

The following production migration versions are present in the connected Supabase ledger. Their names and versions were re-read from production during the CLASS[Λ] reconciliation. This pass did **not** re-audit every historical migration body; only the 27 September classification migration below was reviewed/applied in this repair.

| Supabase version | Supabase migration name | Verification note |
| --- | --- | --- |
| `20260911112712` | `class_a_signup_event_outbox` | Live ledger entry verified |
| `20260911131733` | `class_a_registration_deduplication_guards` | Live ledger entry verified |
| `20260915173440` | `drx_social_campaign_fk_indexes` | Live ledger entry verified |
| `20260915173515` | `harden_class_a_function_security` | Live ledger entry verified |
| `20260917212910` | `cmpass_founder_intelligence_v1` | Live ledger entry verified |
| `20260917213031` | `cmpass_live_core_count_triggers` | Live ledger entry verified |
| `20260917213043` | `cmpass_fix_class_a_count_scope` | Live ledger entry verified |
| `20260917213136` | `cmpass_public_count_events` | Live ledger entry verified |
| `20260919121334` | `class_a_confirmed_attendance_flow` | Live ledger entry verified |
| `20260919121356` | `fix_class_a_register_returning_alias` | Live ledger entry verified |
| `20260919135931` | `create_colab_projectx_crm` | Live ledger entry verified |
| `20260919135956` | `secure_colab_projectx_internal_access` | Live ledger entry verified |
| `20260919140045` | `harden_colab_updated_at_search_path` | Live ledger entry verified |
| `20260920010801` | `index_projectx_experiment_fk` | Live ledger entry verified |
| `20260922010629` | `class_a_signup_event_sync_targets` | Live ledger entry verified |
| `20260922101731` | `secure_cmpass_governance_tables_rls` | Live ledger entry verified |
| `20260922101903` | `restrict_internal_trigger_functions` | Live ledger entry verified |
| `20260922102007` | `index_cmpass_foreign_keys` | Live ledger entry verified |
| `20260922111941` | `class_a_confirm_legacy_registrations` | Live ledger entry verified |
| `20260922112143` | `class_a_pass_delivery_evidence` | Live ledger entry verified |
| `20260927110907` | `class_a_registration_truth_classification` | Applied and verified; exact SQL committed at `drizzle/migrations/20260927110907_class_a_registration_truth_classification.sql` |
| `20260927213216` | `class_a_online_masterclass_os_v1` | Live session, recurring enrollment, attendance-evidence and notification-outbox foundation; exact SQL committed at `drizzle/migrations/20260927213216_class_a_online_masterclass_os_v1.sql` |
| `20260927213315` | `class_a_online_masterclass_hardening` | Exact email+phone identity matching plus covering FK indexes; exact SQL committed at `drizzle/migrations/20260927213315_class_a_online_masterclass_hardening.sql` |
| `20260927213629` | `class_a_online_live_code_control` | Staff-key-gated temporary BUILD-code control for the active online session; exact SQL committed at `drizzle/migrations/20260927213629_class_a_online_live_code_control.sql` |
| `20260927214437` | `class_a_online_recording_consent` | Requires and timestamps explicit recording/transcription acceptance for online enrollment without conflating it with marketing permission; exact SQL committed at `drizzle/migrations/20260927214437_class_a_online_recording_consent.sql` |
| `20260928001145` | `class_a_whatsapp_follow_gated_pass` | Adds backward-compatible gated online registration + one-time unlock RPC so the pass code is not returned until the attendee self-attests the WhatsApp follow step; exact SQL committed at `drizzle/migrations/20260928001145_class_a_whatsapp_follow_gated_pass.sql` |


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

## Security and performance posture — 27 September 2026

The post-change Supabase advisors were run after `class_a_registration_truth_classification`.

- No classification-migration-specific security or performance blocker was reported.
- Existing informational default-deny `RLS Enabled No Policy` notices remain on server-owned tables.
- Existing WARN findings remain for the two public CLASS[Λ] `SECURITY DEFINER` RPCs (`class_a_register_confirmed` and `class_a_redeem_attendance`) because public roles can execute them. Do not revoke those calls blindly: verify the intended public registration/staff-redemption contract first.
- Leaked-password protection is currently disabled in Supabase Auth.
- Performance findings are informational unused-index notices at the current traffic level.

These pre-existing warnings are tracked separately from this registration-truth repair; the 27 September migration did not add a privileged function, policy or index.

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


## CLASS[Λ] online masterclass verification — 28 September 2026

The online masterclass migrations were applied to the connected production Supabase project and then persisted under their exact live migration versions.

Verified:
- `class-0-online-next` exists as a `planning` Google Meet session with timezone `Asia/Dhaka`; no date, time or join URL was invented.
- The new session/enrollment/live-code/evidence/notification tables expose no direct table privileges to `anon` or `authenticated`.
- An invalid personal pass returns `invalid_code` and no participant data.
- A wrong staff key returns `invalid_staff_key` and does not issue a live attendance code.
- Online enrollment requires explicit recording/transcription acceptance; the timestamp is stored on the session enrollment and is explicitly not marketing/publicity consent.
- `portal_open` and `join_click` are evidence signals only; verified attendance is a separate mutation requiring personal-pass plus active live BUILD-code evidence (or a future trusted Meet/staff source).
- The hardening migration resolved the new unindexed-FK advisor findings. Remaining performance advisor output is informational unused-index data at current traffic levels.
- Security advisor WARNs remain for browser-callable `SECURITY DEFINER` CLASS RPCs. These RPCs are intentionally capability-bounded for the public registration/pass flow, while underlying tables remain direct-access denied. Treat this as an explicit security-review item rather than silently suppressing the advisor.
- Supabase Auth leaked-password protection remains disabled; this is a pre-existing Auth posture item unrelated to the CLASS public pass flow.

Activation remains separate from schema readiness: schedule-dependent calendar/reminder delivery cannot be marked LIVE until the real session time and Google Meet event exist and an outbound sender writes delivery evidence to the notification outbox.


## WhatsApp follow-gated pass verification — 28 September 2026

- Existing live `class_a_register_online` remains intact for backward compatibility until the new frontend is deployed.
- New registrations through `class_a_register_online_gated` receive a short-lived one-time unlock token instead of a personal pass code.
- The unlock token is stored only as a SHA-256 hash and expires after 30 minutes.
- `class_a_unlock_online_pass` releases a fresh pass code only when the attendee explicitly submits the follow-confirmation step.
- The resulting field is named `channel_follow_self_attested_at` because WhatsApp Channels does not expose a per-person follow callback to this site; this must not be represented as platform-verified follow evidence.
- Direct access to the underlying enrollment table remains denied to browser roles. Supabase advisor WARNs for the two new browser-callable `SECURITY DEFINER` RPCs are intentional capability-endpoint findings and remain visible for review rather than being suppressed.
