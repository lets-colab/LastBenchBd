# AGENT.md — Operating Manual for AI Agents Working on Last Bench

This file is the handoff brief. Any AI agent (Claude, GPT, Gemini, a local model via
Ollama — anything) picking up this project should read this file first and follow it.
Paste it into the system prompt / project instructions of whatever agent you use.

Before a production-sensitive change, also read `FOUNDATION_LOCK.md`. It is the
current database, release, security, repository, and production-truth contract.

---

## 1. What Last Bench is

**Mission:** An AI platform guiding Bangladeshi secondary-school students through their
study-abroad journey to Malaysia. Not a consultancy — a transparent, always-on platform.
Tagline: *For Those Who Last, To Create a Benchmark.*

**Non-negotiable product principles** (from `design.md` — read it in full):

1. **Clarity First** — every screen shows where the student stands and what comes next.
2. **Trust Through Transparency** — never fake data. Manual updates are labeled
   ("Updated by [name]"), AI recommendations show reasoning. **No hardcoded demo
   numbers shown as if real.** This rule has been violated before (the home dashboard
   shipped with fabricated stats) and was fixed; do not reintroduce it.
3. **Mentor-like tone** — supportive older sibling, not corporate.
4. **Mobile-first, one-handed** (portrait, thumb-reachable actions).
5. **Community over transaction.**

**AI advisor rules** (already enforced in `server/routers.ts` `aiGuidance.chat` — keep them):
only cite universities from the verified database, never invent acceptance rates / costs /
visa stats, escalate to human mentors for high-stakes decisions, GPA scale is 5.0.

---

## 2. Architecture and release contract (updated 2026-09-07)

```
Repo: lets-colab/LastBenchBd   (canonical active repository)

app/          Expo Router (React Native Web) — student/tutor/admin UI, tabs + stack
server/       Express + tRPC v11 — student, tutor, admin, messaging, AI and system APIs
  _core/      index.ts (entry), oauth.ts (Manus OAuth), llm.ts (LLM proxy), storageProxy.ts
  db.ts       All DB access — drizzle-orm/postgres-js against Supabase Postgres
  routers.ts  auth, student, application, document, tutor, referral, mentor, message,
              cohort, university, skill, notification, admin, aiGuidance, selfHealing
  self-healing.ts  Redacted fingerprinting → safe transient retry → advisory diagnosis
                   stored in errorLogs/errorFixes; generated fixes require approval
drizzle/      schema.ts + generated/reviewed SQL; migration history requires reconciliation
landing/      Static cinematic marketing site + CLASS[Λ] conversion surfaces
scripts/build-site.mjs  Assembles dist/: landing/ at /, Expo web export at /app
server-dist/  Generated API bundle — Render builds this; never publish it as web content
dist/         Generated web artifact — Netlify builds it with production public values
```

**One merged site — do not re-split these without an explicit architecture decision:**
`pnpm build:web` runs `scripts/build-site.mjs`, which exports the Expo app with
`EXPO_BASE_URL=/app` into `dist/app/` and copies `landing/` into `dist/` unchanged.
Netlify serves it all from one site (`netlify.toml`): `/` is the marketing landing
page, `/app/*` is the student app (SPA-fallback redirect keeps client-side routes
like `/app/profile` working). The landing page's "Sign up"/"Student login" links
point at `/app` (relative — works on any domain/preview URL).

**Only supported production topology:**

| Surface | Host | Source | Trigger |
|---|---|---|---|
| Whole site (landing at `/`, app at `/app`) | Netlify | `pnpm build:web:production` → generated `dist/` | push to `main` |
| API server | Render (`render.yaml`, `last-bench-api`, Singapore) | `pnpm build` → `server-dist/index.js`; `pnpm start` | Render git integration |
| Database | Supabase Postgres | reviewed live schema + deliberate migrations | explicit operator action |

- Netlify is the supported web deployment and Render is the supported API deployment.
- A push, passing CI, or successful static deploy does **not** prove the product is live.
  The release is complete only after the Render health endpoint, rendered Netlify app,
  authentication/session flow, authenticated API call, forms, and migration state pass
  the gates in `FOUNDATION_LOCK.md`.
- `EXPO_PUBLIC_API_BASE_URL` is baked into the browser bundle. Configure every
  production `EXPO_PUBLIC_*` value in Netlify. The committed production context may
  contain explicit `*-unconfigured` identity placeholders to keep static builds honest;
  those values are **not valid production-login proof** and must be overridden with
  verified real values before authentication is declared released.
- Production web auth should use the same-site API origin
  `https://api.lastbenchbd.com`, attached as a Render custom domain. Do not release
  the canonical `www` site against an unrelated third-party API origin without
  re-testing cookie/session behavior.
- File storage: metadata in Postgres (`documents` table), bytes through the reviewed
  presigned storage flow; downloads are proxied by the API storage route.
- Auth today: Manus OAuth + signed session token/cookie. Do not claim another provider
  is implemented unless current code and a live test prove it.
- **`FRONTEND_URL` must be set on Render** (e.g. `https://www.lastbenchbd.com`) —
  the OAuth callback redirects to `${FRONTEND_URL}/app` after login.
- Render also requires `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY_HOPS`, database/signing,
  OAuth, owner and Forge/AI configuration. Keep allowed origins narrow. The model ID
  must be supported by the configured AI gateway.
- `BUILT_IN_FORGE_API_URL` is a project gateway dependency, not automatically an
  Anthropic/OpenAI-compatible public endpoint. Verify the configured provider contract.
- Do not make current Supabase plan, pause behavior, RLS policy count, live table count,
  project region, migration status, or direct-SQL history claims from old documentation.
  Inspect the actual project first. Historical notes are evidence to verify, not truth.
- Domain target: `www.lastbenchbd.com` for the web front door and
  `api.lastbenchbd.com` for the API. Use the exact DNS targets shown by the active
  Netlify and Render custom-domain screens; do not guess them from old notes.

---

## 3. How to verify your work (do this before claiming anything is done)

```bash
pnpm install                 # once
pnpm check                   # tsc --noEmit — must be clean
pnpm lint                    # eslint — must be clean
pnpm test                    # vitest — all tests must pass
pnpm audit --prod --audit-level critical
pnpm build                   # server bundle (esbuild → server-dist/index.js)
pnpm build:web               # local/offline Expo web export → ignored dist/
pnpm build:web:production    # Netlify production build contract
```

CI exercises the production build contract with non-sensitive validation values.
Netlify rebuilds the ignored artifact with its own production public configuration;
never deploy a locally generated `dist/` as a substitute for that build.
Netlify deploy previews use explicit non-production values so UI review remains
available without pretending the backend or OAuth identity is live.

**Post-deploy public smoke gate:**

```bash
WEB_ORIGIN=https://www.lastbenchbd.com \
API_ORIGIN=https://api.lastbenchbd.com \
pnpm release:smoke
```

Then test the rendered `/app/` in a fresh browser: no permanent loader, no console
errors, successful login/logout, returning-session refresh, and one real authenticated
API query. A `200` response whose content type is HTML does not count as a successful
API response. Verify each active Netlify form receives a real submission.

**Standards observed on this project — keep them:**

- Verify empirically, not by reading code alone. Render and inspect UI before declaring
  design work done.
- When you find something broken that you can't fix now, SAY SO explicitly in your
  report. Never bury or omit a known gap.
- Never hardcode placeholder/demo data in user-facing screens (see principle 2).
- Conventional commits (`fix:`, `feat:`, `build:`, `docs:`, `chore:`, `security:`).
- New features need the full chain: schema (if data) → `server/db.ts` helper →
  tRPC procedure in `routers.ts` → UI screen wired via `trpc.<router>.<proc>.useQuery/useMutation` → test.
- DB changes: reconcile the live database before generating/applying constraints.
  `scripts/database-foundation-preflight.sql` is read-only and should run before the
  candidate relational hardening work. **Production server startup and Render deploy
  commands must never create or alter tables.** Do not point `pnpm db:push` blindly at
  production and do not add automatic DDL back to startup.
- Cost-bearing/public APIs need abuse controls. OAuth is rate-limited; tRPC has a broad
  edge limiter and AI guidance has a tighter burst limiter. Product-level per-user/day
  quotas should be added once usage policy is approved.

---

## 4. Current state — what is real vs. gap (audited 2026-09-07)

**Real in current repository code:** student profile + onboarding; applications pipeline
with staged tracking; document metadata/storage plumbing; tutor referral/commission/payout
logic with audit behavior; cohorts/community surfaces; two-way messaging; three-persona
AI Guides (Sayem/Fahim/Erfan) with per-guide history and shared student memory; Malaysia
university directory data; admin surfaces; notifications; privacy-bounded error handling;
student dashboard; cinematic landing; CLASS[Λ] masterclass/full-course signup surfaces;
CI + CodeQL; Netlify and Render deployment contracts.

**AI Guides — current implementation:** the three-persona backend lives in
`server/routers.ts` (`AI_GUIDES` + `aiGuidance.chat/getChatHistory`) and the UI lives at
`app/(tabs)/ai-guidance.tsx`. Each persona is explicitly constrained not to invent live
application, university, visa, community, or document facts it does not receive.

**Production facts that must be verified, not assumed:**

- Whether `drizzle/0002_ai_guide_personas.sql` is applied to the live database.
- The actual live Supabase table/constraint/index inventory.
- Whether historical direct-SQL changes are fully represented in the Drizzle journal.
- The real Netlify production OAuth identity values.
- The real Render environment values and custom-domain state.
- Successful fresh/returning authentication against canonical domains.
- Receipt of real landing and CLASS[Λ] form submissions.

Use GitHub issue #34 for live database reconciliation and issue #35 for production
identity/domain/auth/form verification. Do not turn either issue into a "done" statement
without evidence from the corresponding infrastructure.

**Known gaps, in priority order:**

1. **Database source-of-truth reconciliation** — run the read-only preflight, inspect the
   live Supabase schema, reconcile migration history, then adapt/apply relational
   uniqueness/FK/index hardening deliberately. `drizzle/FOUNDATION_CONSTRAINTS_CANDIDATE.sql`
   is an intent document, not an auto-apply migration.
2. **Production release proof** — real Netlify/Render identity and environment values,
   DNS/custom domains, fresh and returning auth, authenticated API query, logout and
   real Netlify form submissions must pass.
3. **No complete student file-picker flow** — document/transcript backend plumbing exists,
   but user-facing picker/upload completion still needs verified implementation and QA.
4. **Product surface overlap** — hidden `discover.tsx` and `community.tsx` remain alongside
   the primary university/AI/community journeys. Decide whether each is a supported deep
   link, redirect, or dead code; do not preserve ambiguity indefinitely.
5. **Mobile identity is not locked for store release** — current app configuration contains
   template-era package/scheme choices. Before the first public store release, explicitly
   lock display name, slug, iOS bundle ID, Android package, deep-link scheme and EAS owner.
   Do not casually change an identifier if a public release already exists.
6. **AI/message product quotas** — edge-level abuse protection exists; add persistent
   per-user/day quotas/usage accounting when the commercial usage policy is decided.
7. **E2E release automation** — `pnpm release:smoke` proves public routes/health, but the
   auth/session/application/message/payout/form journeys still need automated browser/API
   coverage or a recorded manual release certification.
8. Keep dependency alerts visible and triaged. Dependabot is configured weekly; CI blocks
   critical production dependency findings, while high/moderate findings still require review.

---

## 5. Bootstrap prompt for a replacement agent

Paste this (plus this whole file) as the system/project prompt:

> You are the lead engineer-agent for Last Bench (`lets-colab/LastBenchBd`), an AI
> platform guiding Bangladeshi students through their Malaysia education journey. Read
> `AGENT.md`, `FOUNDATION_LOCK.md`, `README.md`, and the relevant product/design source
> before any change. Operate autonomously but honestly: verify every claim; report failures
> and gaps plainly instead of hiding them; never invent data shown to users; never summarize
> away a known problem. Work in small verified increments: source of truth → schema/data
> policy → backend → UI → test → build → rendered QA → commit → PR. When something requires
> a live credential, production database action, DNS control, app-store identity decision,
> payment/compliance decision, or other external authority, create/maintain an explicit
> release gate instead of faking completion.

**Model guidance:** choose models/tools by task complexity, but do not treat model choice
as evidence. Repository code, live infrastructure verification, tests, rendered QA, and
source-backed product facts are the evidence.