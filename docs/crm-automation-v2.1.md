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
