-- LAST BENCH automation foundation v2.1 — additive, no data migration.
create schema if not exists automation;
create table if not exists automation.workflow_definitions (
 id text not null, version integer not null check(version>0),
 enabled boolean not null default false,
 definition jsonb not null, created_at timestamptz not null default now(),
 primary key(id,version)
);
create table if not exists automation.external_identities (
 id uuid primary key default gen_random_uuid(), internal_entity_type text not null,
 internal_entity_id uuid not null, provider text not null, external_id text not null,
 verified_at timestamptz, created_at timestamptz not null default now(),
 unique(provider,internal_entity_type,external_id),
 unique(provider,internal_entity_type,internal_entity_id)
);
create table if not exists automation.events (
 id uuid primary key default gen_random_uuid(),
 event_type text not null, schema_version integer not null default 1,
 source text not null, idempotency_key text not null unique,
 payload jsonb not null, status text not null default 'pending'
 check(status in ('pending','processing','completed','blocked','dead_letter')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 lease_until timestamptz, created_at timestamptz not null default now()
);
create index if not exists automation_events_due_idx on automation.events(status,next_attempt_at);
create table if not exists automation.runs (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references automation.events(id),
 workflow_id text not null, workflow_version integer not null,
 mode text not null check(mode in ('dry_run','live')),
 status text not null default 'pending',
 result jsonb, started_at timestamptz not null default now(), completed_at timestamptz,
 unique(event_id,workflow_id,workflow_version,mode)
);
create table if not exists automation.approvals (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references automation.runs(id),
 action text not null, decision text not null check(decision in ('approved','rejected')),
 reviewer_id text not null, evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists automation.audit (
 id bigint generated always as identity primary key, run_id uuid references automation.runs(id),
 action text not null, actor text not null, details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists automation.dead_letters (
 event_id uuid primary key references automation.events(id), reason text not null,
 occurred_at timestamptz not null default now(), resolved_at timestamptz
);
alter table automation.workflow_definitions enable row level security;
alter table automation.external_identities enable row level security;
alter table automation.events enable row level security;
alter table automation.runs enable row level security;
alter table automation.approvals enable row level security;
alter table automation.audit enable row level security;
alter table automation.dead_letters enable row level security;
-- Deliberately no client policies: service-role integration only until audited.
