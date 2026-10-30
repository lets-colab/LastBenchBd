# Issue #173 — backend migration readiness (DIAGNOSTIC ONLY)

Source pin: `lets-colab/LastBenchBd@71dcccd9fd597e73e03ffe717ea566dcd0a604ae`
Date: 2026-10-30 UTC. Scope: Last Bench CRM v2.2. This document does **not** authorize deployment, DNS change, billing, database writes, or Render retirement.

## Observed source evidence
- `package.json`: production build bundles `server/_core/index.ts` for Node, and `start` executes `node server-dist/index.js`. GitHub Pages builds the separate static site.
- `server/_core/index.ts`: Express, `http.createServer`, `net.createServer`, process error handlers, Express tRPC adapter, auth routes, rate limits, CORS and `/api/health`.
- `server/_core/context.ts`: authentication uses Express request/response objects and `authenticateRequest`.
- `server/_core/authRoutes.ts`: password sign-in/sign-up, refresh, logout and session cookies; native clients receive tokens. Auth errors must remain fail-closed.
- `server/_core/trpc.ts`: admin procedure returns FORBIDDEN for anonymous or non-admin callers.
- `server/db.ts`: Drizzle + postgres-js with lazily cached PostgreSQL connection; direct TCP/connection pooling behavior requires runtime verification.
- `server/routers.ts`: `createRequire(import.meta.url)` loads local JSON data; must be bundled or adapted.
- `server/_core/env.ts`: requires DATABASE_URL, Supabase URL/key, frontend and CORS origins in production.
- Production smoke run 41038009961 failed on 2026-10-30, whereas domain verification run 41059069129 succeeded. Neither proves current backend production acceptance.
- Render deploy `dep-dbgrfqcs728c7395pm7g` failed with `pipeline_minutes_exhausted`. Do not retry unchanged build. Canonical issue: #173.

## Runtime choice — unverified
GitHub Pages **cannot host** the Node/tRPC API. GitHub Actions is CI/CD, not a persistent HTTP runtime.
Cloudflare Workers is a **candidate**, not yet a proven drop-in replacement. A direct deployment of the current Node entry point is unsafe. Compare (A) a Workers-native Fetch/tRPC adapter with supported database transport and auth semantics against (B) an approved zero-cost Node-compatible runtime. Do not create a service until feasibility, free limits and rollback are established.

## Required capability inventory and acceptance contract
1. Enumerate every `appRouter` route, including admin automation overview; classify public/protected/admin, GET/POST, DB writes, external calls and timeouts.
2. Preserve HTTP routes `/api/health`, `/api/auth/sign-in`, `/api/auth/sign-up`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`, and `/api/trpc/*`.
3. Preserve Supabase session issuance, refresh, cookie flags, bearer-token native-client behavior, logout revocation, role-based access and CORS allowlist. No auth bypass or silent 404 for recognized admin procedures.
4. Verify Workers-compatible PostgreSQL transport, pool/concurrency lifecycle, TLS, timeouts, and transaction semantics against an **isolated nonproduction** database; never infer production RLS/grants from synthetic tests.
5. Verify rate limiting, process error reporting, JSON assets, runtime environment secrets, AI integration, scheduled/background tasks and all frontend API calls.
6. TDD: first reproduce anonymous admin route failure in an isolated test (expected JSON HTTP 403), then implement smallest change and demonstrate RED -> GREEN with exact commands, exit codes, versions and pinned SHA. Run full `pnpm test`, `pnpm check`, `pnpm build` and release smoke against staging before proposing production.
7. Obtain scoped founder + responsible owner approval for exact deployment artifact SHA, runtime, DNS, rollback and Render retirement.
8. Independent release proof: exact deployed SHA; health; anonymous admin 403 JSON; founder-admin authenticated read; consent-gated HubSpot pilot; website/API integration; rollback rehearsal. Only then close #173 and consider retiring Render.

## STOP / UNKNOWN
No approved safe runner, no Workers compatibility proof, no staging acceptance receipts, no production authorization and no rollback evidence as of this diagnostic snapshot. Therefore **no migration, production deployment or Render deletion is approved or proven**. Preserve existing five departmental watches and ProjectX hold; exclude Season KL.
