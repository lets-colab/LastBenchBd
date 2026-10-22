# LAST BENCH CRM Automation — Live Runtime Update (2026-10-22)

## Verified state
- Supabase project `the-last-bench`: automation schema and v2.1/v2.2/v2.3 migrations applied.
- pg_cron job `lastbench-jev-crm-dryrun-minute` executes each minute.
- Synthetic event `13d7dc0e-8367-446f-b48b-89f92a60f380` finished `completed`, one run, no last error.
- Transaction rollback test: duplicate idempotency key yields same ID; dry-run completes with an audit; normal JWT role fails authorization.
- App admin console is under PR #157, not certified deployed until CI, merge and founder-authenticated smoke.

## Operator steps
1. Sign in with an authorized application **admin** account.
2. Open **Operations → Automations**.
3. Review run counts, workflows and connector status.
4. Press **Run safe synthetic test** to enqueue a health event only.
5. Refresh after the next minute; confirm a completed health-probe run.

## Security and integration readiness
- The only enabled workflow is `jev-health-probe` with execution mode `dry_run`.
- HubSpot, Notion and Slack are **not** automatically written to from this engine. Provider checks are read-only and require separately configured server-side credentials.
- Do not import 212 pending prospects or 195 campus research records, resolve identity conflicts, or send messages without separate qualification and consent gates.
- Real CRM synchronization remains **not verified**; do not present it as operational.
- Basic Memory/XMemo are retrieval summaries, not company identity authority. KinicMemory connector is anonymous public-memory read-only.
- If the operator console reports database unavailable, verify production API `DATABASE_URL` points to the verified Supabase project. Never expose a database password in the browser.
- The cron executor does not run AI reasoning or external vendor calls. Human-approved, deterministic adapter execution remains a separate gated milestone.

---
# LAST BENCH CRM automation v2.1

Status: **implementation proposal**, not deployed. This change is isolated to a feature branch pending review.

## Contract
- Supabase owns identity mappings, registrations, source provenance and durable automation state.
- HubSpot owns CRM contact/company lifecycle and commercial pipeline. Notion owns research.
- Every event has a stable idempotency key; duplicate events are rejected at the database.
- Worker defaults to **dry run**; production writes require verified identity, documented purpose, explicitly granted policy authorization, and an allowlisted adapter.
- Do not automatically merge people on name/email alone.
- Keep existing 193 HubSpot references; do not bulk-import pending prospects or research-only records.
- No contact enrollment or external messaging without explicit consent and appropriate approval.
- Failed actions use backoff and dead-letter review. No destructive rollback of unrelated existing data.
- Database RLS blocks ordinary client access to the automation schema by default.

## Implementation phases
1. Review migration in staging; inspect existing schema and ownership before applying.
2. Install tables, review service access, add signed webhook input and a leased queue worker.
3. Implement allowlisted HubSpot adapter with read-back; implement Notion read-only mirror.
4. Add an authenticated admin console with run diff, approvals, retry and incident queue.
5. Verify event duplicate safety, queue recovery, consent withdrawal, external outage, privilege boundaries, and rollback.
6. Only then enable any live workflow with human approval and measured monitoring.

## v1 event contract
```json
{"event_id":"UUID","event_type":"registration.created","schema_version":1,"occurred_at":"ISO-8601","source":"class_a","subject_id":"UUID","idempotency_key":"source:event-id","payload":{}}
```

## Acceptance
No production enablement until: source-of-truth ownership approved, duplicate IDs safe, identity conflict quarantine tested, consent gate verified, staging and restore tested, HubSpot read-back implemented, monitoring operational, and JeX signoff recorded.
