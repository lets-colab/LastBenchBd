# LAST BENCH API — Cloudflare Workers migration release gate

**Status:** DIAGNOSTIC_ONLY / test work staged, NOT a deployed migration.
**Project:** lets-colab/LastBenchBd API only. DR.X, other Workers, frontend and Supabase data owners remain separately governed.
**Baseline:** 2026-11-04; canonical GitHub main 2e76e40aff39c2b46c0b8acff22c5e0046d91f9e.

## Objective and invariant
Replace the Render API only if Cloudflare Workers can deliver complete, independently verified, zero-added-cost functional and security parity. Preserve student/native clients, authorization, HTTP-only cookies, CRM admin routes, Supabase/Postgres ownership, migrations, operations, error behavior and rollback. Do not export credentials, alter billing, enable outreach or change DNS without current action-specific approval.

## Source-verified baseline
- Render last-bench-api-v2 serves the production Node/Express/tRPC API on the Free plan. Its latest deployment of the current main SHA was LIVE; canonical smoke on 2026-11-03 passed, including anonymous admin denial HTTP 403.
- Cloudflare lastbenchbd account and lastbenchbd.com zone are active. API hostname api.lastbenchbd.com is a DNS-only CNAME to last-bench-api-v2.onrender.com, not a Worker. No Hyperdrive configuration or Worker custom domain for the API was found.
- The zone's existing lastbenchbd.com route maps to erfan-second-brain. That is a separate protected namespace; do NOT modify or repurpose it.
- server/_core/index.ts uses Node http.createServer, process fatal listeners and listening ports. server/db.ts uses Drizzle/Postgres.js with a long-lived connection through process.env.DATABASE_URL. Auth routes use Supabase Auth, cookies and native bearer transport. Rate limiting uses express-rate-limit memory stores.
- Cloudflare documents Express support through httpServerHandler and Postgres.js through Hyperdrive. This establishes platform feasibility only. Workers Free enforces daily request and per-invocation CPU limits; real workload fit and this account's exact billing entitlement remain unverified.

Cloudflare primary guidance:
- https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/
- https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-drivers-and-libraries/postgres-js/
- https://developers.cloudflare.com/workers/platform/limits/

## JeX architecture choice
- **A: Keep Render until replacement is proven** — recommended current operational default, proven production smoke, no verified cost reduction from moving an already-free backend.
- **B: Isolated Worker adapter + Hyperdrive candidate** — potential future migration if all routes, authentication, database, global rate-limiting, CPU and cost gates pass.
- **C: Add Cloudflare as proxy in front of Render** — REJECT as a replacement because it adds a hop and does not eliminate Render.

## Read-only candidate gate implemented in this branch
The API parity probe permits only a separate HTTPS staging origin and never sends mutations, tokens or real contact records. The seven required checks are: semantic health and auth/storage configuration; anonymous session denied 401; anonymous CRM admin denied 403 FORBIDDEN; public tRPC system.health read; anonymous student-profile denied 401 UNAUTHORIZED; foreign-origin access rejected without credentialed CORS; and allowed-origin OPTIONS preflight with credentials. Test regressions use synthetic fixtures.

Run Node 22+:
    node --test scripts/probe-api-parity-checks.mjs
    CANDIDATE_API_ORIGIN=https://APPROVED_STAGING_WORKER.workers.dev node scripts/probe-api-parity.mjs

Passing this gate means only STAGING_PREFLIGHT_PASS_NOT_RELEASE. There is currently **no tested staging Worker or Hyperdrive binding**.

## Remaining critical release checks
- [ ] Prove free-tier cost/quotas and representative workload fit: requests, CPU per invocation, memory, cold start, external subrequests; no card, paid upgrade or overages.
- [ ] Build and test a separate Cloudflare Worker entry using the documented HTTP adapter, preserving all Express/tRPC handlers, methods and error semantics.
- [ ] Prove Drizzle/Postgres.js + Hyperdrive connectivity with privately supplied authorized credentials. No duplicate database, leaked DATABASE_URL or unapproved schema changes.
- [ ] Replace or prove a globally correct rate limiter. An in-memory Express limiter cannot be presumed equivalent across Workers isolates.
- [ ] Prove complete founder-admin, student and native bearer sessions, new/returning auth, refresh and revoke/logout, cookie flags, CORS, cross-origin negative cases, and role boundaries.
- [ ] Prove synthetic-only database reads and approved writes, idempotency, RLS, provider failure modes, retry boundaries and integrity. Real CRM writes and outbound messaging require separate consent and approval.
- [ ] Compare staging vs Render responses, cookies, auth state, database effects and failure cases across representative traffic. Measure p95 latency, error rates and CPU on the permitted Free tier.
- [ ] Rehearse rollback to the existing Render origin. Record exact DNS and deployment reversals and independent post-cutover receipts.
- [ ] Obtain exact-scoped founder approval for publishing, DNS cutover and any material security/billing changes. Independently verify new live SHA and full operation. Retire Render last.

## Release decision
**JEV GATE: BLOCKED for cutover.** Preserve the current healthy Render API and Cloudflare routes until all tests and protected approvals are satisfied. This branch is a safety preflight improvement, not a migration or 10.5/10 acceptance claim.
