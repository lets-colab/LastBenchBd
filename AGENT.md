# AGENT.md — Operating Manual for AI Agents Working on Last Bench

This file is the handoff brief. Any AI agent (Claude, GPT, Gemini, a local model via
Ollama — anything) picking up this project should read this file first and follow it.
Paste it into the system prompt / project instructions of whatever agent you use.

Before a production-sensitive change, also read `FOUNDATION_LOCK.md`. It is the
current database, release, security, repository, and production-truth contract.
For database work, also read `drizzle/MIGRATION_STATUS.md`.

---

## 1. What Last Bench is

**Mission:** An AI platform guiding Bangladeshi secondary-school students through their
study-abroad journey to Malaysia. Not a consultancy — a transparent, always-on platform.
Tagline: *For Those Who Last, To Create a Benchmark.*

**Non-negotiable product principles** (from `design.md` — read it in full):

1. **Clarity First** — every screen shows where the student stands and what comes next.
2. **Trust Through Transparency** — never fake data. Manual updates are labeled
   ("Updated by [name]"), AI recommendations show reasoning. **No hardcoded demo
   numbers shown as if real.**
3. **Mentor-like tone** — supportive older sibling, not corporate.
4. **Mobile-first, one-handed** (portrait, thumb-reachable actions).
5. **Community over transaction.**

**AI advisor rules** (already enforced in `server/routers.ts` `aiGuidance.chat` — keep them):
only cite universities from the verified database, never invent acceptance rates / costs /
visa stats, escalate to human mentors for high-stakes decisions, GPA scale is 5.0.

---

## 2. Architecture and release contract (updated 2026-09-07)

```text
Repo: lets-colab/LastBenchBd   (canonical active repository)

app/          Expo Router (React Native Web) — student/tutor/admin UI, tabs + stack
server/       Express + tRPC v11 — student, tutor, admin, messaging, AI and system APIs
  _core/      index.ts (entry), oauth.ts (Manus OAuth), llm.ts (LLM proxy), storageProxy.ts
  db.ts       All DB access — drizzle-orm/postgres-js against Supabase Postgres
  routers.ts  auth, student, application, document, tutor, referral, mentor, message,
              cohort, university, skill, notification, admin, aiGuidance, selfHealing
  self-healing.ts  Redacted fingerprinting → safe transient retry → advisory diagnosis
                   stored in errorLogs/errorFixes; generated fixes require approval
drizzle/      schema.ts + reviewed SQL migrations + live-ledger documentation
landing/      Static cinematic marketing site + CLASS[Λ] conversion surfaces
scripts/build-site.mjs  Assembles dist/: landing/ at /, Expo web export at /app
server-dist/  Generated API bundle — Render builds this; never publish it as web content
dist/         Generated web artifact — Netlify builds it with production public values
```

**One merged site — do not re-split these without an explicit architecture decision:**
`pnpm build:web` exports the Expo app with `EXPO_BASE_URL=/app` into `dist/app/` and
copies `landing/` into `dist/` unchanged. Netlify serves `/` as the marketing landing
and `/app/*` as the student app.

### Supported production topology

| Surface | Host | Source | Trigger |
|---|---|---|---|
| Whole site (landing at `/`, app at `/app`) | Netlify | `pnpm build:web:production` → `dist/` | push to `main` |
| API server | Render (`render.yaml`, `last-bench-api`) | `pnpm build` → `server-dist/index.js`; `pnpm start` | Render git integration |
| Database | Supabase Postgres | reviewed GitHub SQL → explicit Supabase migration | explicit operator action |

### Current verified production facts

- Canonical Netlify project: `lastbenchbdd`.
- Current Netlify primary production URL: `https://lastbenchbd.com`.
- The production Netlify project is connected to `main` and its current deployment is ready.
- Active Netlify forms: `signup`, `class-a-masterclass`, `class-a-course`.
- At the last infrastructure check, all three forms existed but had no real submissions yet.
- Canonical API target remains `https://api.lastbenchbd.com`.
- Netlify currently has no site-level environment variables configured; committed
  `netlify.toml` production values therefore matter unless overridden later.
- `netlify.toml` intentionally still contains placeholder Manus `APP_ID` and
  `OWNER_OPEN_ID` values. Those make static builds honest but **do not prove production login**.

Do not revert the repository back to an older `www.lastbenchbd.com` assumption unless
Netlify is deliberately reconfigured and verified. The currently verified primary web
host is the apex `https://lastbenchbd.com`.

### Auth/runtime contract

- Auth today: Manus OAuth + signed session token/cookie.
- `EXPO_PUBLIC_API_BASE_URL` is baked into the browser bundle.
- Production web should call `https://api.lastbenchbd.com` so web and API remain same-site.
- `FRONTEND_URL` on Render should be `https://lastbenchbd.com` so OAuth redirects to
  `https://lastbenchbd.com/app`.
- Production CORS should explicitly allow `https://lastbenchbd.com`.
- Render also requires database/signing, OAuth identity, owner identity, proxy and
  Forge/AI configuration. Never invent missing credentials.
- File storage metadata lives in Postgres; bytes use the reviewed presigned storage flow.

---

## 3. Database migration rule — live foundation locked

The connected production Supabase project was inspected directly on 7 September 2026.
Before relational hardening, the checked business/product tables contained no rows and
the read-only preflight found no checked duplicate or orphan relationships.

The live Supabase migration ledger now includes:

- original schema migration
- default-deny RLS migration
- repo `0001_gifted_sunspot`
- repo `0002_ai_guide_personas`
- foundation security hardening
- foundation relational integrity (`drizzle/0003_foundation_relations.sql`)

The production database now has explicit foreign keys across identity/profile,
applications/documents, referrals/payouts, messaging/community, notifications, AI
history/memory and audit actors. One-profile-per-user and cohort-membership uniqueness
rules are also live.

After `0003`, the Supabase security advisor had **no WARN or ERROR findings**. Its
remaining security notices are informational RLS-enabled/no-policy notices consistent
with the server-owned default-deny architecture. Performance advisor notices about newly
created indexes being unused are informational and expected while the database has no
business traffic; do not delete those indexes merely because they have not been exercised yet.

`drizzle/meta/` snapshots still do not represent the complete reconciled live history.
Therefore `pnpm db:push` is intentionally blocked. Do not re-enable automatic
`drizzle-kit generate && drizzle-kit migrate` until the snapshots are regenerated from
and compared against the reconciled Supabase baseline.

### Required DB change workflow

1. Edit `drizzle/schema.ts`.
2. Write/review matching SQL under `drizzle/`.
3. Run the read-only preflight when data/relations are affected.
4. Pass TypeScript, lint, tests, dependency audit, API/web builds and CodeQL.
5. Merge the exact reviewed SQL.
6. Apply that exact SQL through the Supabase migration workflow.
7. Re-run Supabase security/performance advisors and inspect constraint/index state.
8. Update `drizzle/MIGRATION_STATUS.md` when the verified ledger changes materially.

**Production server startup and Render deploy commands must never create or alter tables.**

---

## 4. How to verify work before claiming it is done

```bash
pnpm install
pnpm check
pnpm lint
pnpm test
pnpm audit --prod --audit-level critical
pnpm build
pnpm build:web
pnpm build:web:production
```

For canonical public health:

```bash
pnpm release:smoke
```

`pnpm release:smoke` defaults to:

```text
WEB_ORIGIN=https://lastbenchbd.com
API_ORIGIN=https://api.lastbenchbd.com
```

It checks:

- API `/api/health` returns JSON with `ok: true`
- landing `/`
- student `/app/`
- CLASS masterclass
- CLASS full course

It retries transient failures.

### Automated production monitoring

`.github/workflows/production-smoke.yml` runs:

- after every push to `main` (after a deployment settle window),
- daily,
- on manual dispatch.

A failed smoke run creates or updates the GitHub issue **Production smoke gate**. A later
successful run comments on and closes that issue automatically. Keep this workflow
read-only against production; it must not mutate user data or infrastructure.

### Stateful release checks still required

Public health automation does **not** prove authentication or form storage. Before calling
the complete product released, verify:

- real Netlify production Manus `APP_ID` and `OWNER_OPEN_ID`
- real Render environment values and API custom-domain state
- fresh-browser OAuth login
- returning session after refresh
- authenticated tRPC query
- logout rejects the next protected request
- receipt of one real submission in each active Netlify form
- document/storage authorization before opening the full upload flow

A `200` response whose content type is HTML does not count as successful API health.

---

## 5. Engineering standards

- Verify empirically, not by reading code alone.
- Report known gaps explicitly; never hide them to make a release look complete.
- Never hardcode placeholder/demo data as real product state.
- Conventional commits: `fix:`, `feat:`, `build:`, `docs:`, `chore:`, `security:`, `db:`.
- New data-backed features follow: schema → DB helper → tRPC procedure → UI → test.
- Auth, documents, commissions/payouts, student data and AI guidance are high-trust surfaces.
- Cost-bearing/public APIs need abuse controls. OAuth is rate-limited; tRPC has a broad
  edge limiter and AI guidance a tighter burst limiter. Persistent per-user/day quotas
  can be added once commercial usage policy is approved.
- Do not expose development-only routes as normal production features.
- Never use stale PRs/branches as architecture truth when current `main` or verified
  infrastructure disagrees.

---

## 6. Current state and remaining gaps

### Real in current repository code

- student profile + onboarding
- staged application tracking
- document metadata/storage plumbing
- tutor referral/commission/payout logic with audit behavior
- cohorts/community surfaces
- two-way messaging
- three-persona AI Guides (Sayem/Fahim/Erfan) with per-guide history and shared memory
- Malaysia university directory data
- admin surfaces
- notifications
- privacy-bounded error handling
- cinematic landing
- CLASS[Λ] masterclass + full-course signup surfaces
- CI + CodeQL
- Netlify/Render deployment contracts
- automated production smoke monitoring
- live relational Supabase foundation

### Remaining release blockers, in order

1. **Production OAuth identity** — replace placeholder Manus `APP_ID` and `OWNER_OPEN_ID`
   with verified real values in the actual production configuration.
2. **Render/API proof** — verify Render environment state and `api.lastbenchbd.com/api/health`.
3. **Authenticated E2E proof** — fresh login, returning session, authenticated query, logout.
4. **Form receipt proof** — verify real submissions for `signup`, `class-a-masterclass`,
   and `class-a-course`.
5. **Complete student file-picker flow** — backend plumbing exists; user-facing upload
   completion still needs implementation/QA.
6. **Product surface overlap** — decide whether hidden `discover.tsx` and `community.tsx`
   are supported deep links, redirects or dead code.
7. **Mobile identity lock** — confirm no public store release uses the template-era
   identifiers, then explicitly lock display name, slug, iOS bundle ID, Android package,
   deep-link scheme and EAS ownership.
8. **Persistent AI/message quotas** — add when usage/commercial policy is decided.
9. **Browser E2E automation** — automate auth → onboarding → application → messaging → logout.

Use GitHub issue #35 for production identity/domain/auth/form verification and issue #36
for mobile identity. The database reconciliation represented by issue #34 is complete once
its GitHub issue is updated/closed with the live migration/advisor evidence.

---

## 7. Bootstrap prompt for a replacement agent

> You are the lead engineer-agent for Last Bench (`lets-colab/LastBenchBd`), an AI
> platform guiding Bangladeshi students through their Malaysia education journey. Read
> `AGENT.md`, `FOUNDATION_LOCK.md`, `drizzle/MIGRATION_STATUS.md`, `README.md`, and the
> relevant product/design source before any change. Verify every claim; never invent
> product facts, credentials, infrastructure state or completion. Use current `main` plus
> verified live infrastructure as truth. For database changes, reviewed GitHub SQL must
> pass CI/CodeQL before the exact SQL is applied through Supabase. For release work, use
> the automated production smoke gate but remember that auth and form receipt require
> separate stateful verification. Preserve canonical brand assets exactly.

Model/tool choice is never evidence. Repository code, live infrastructure, tests,
rendered QA and source-backed product facts are the evidence.
