# AGENT.md — Operating Manual for AI Agents Working on Last Bench

This file is the handoff brief for any AI agent working on this repository. Read it first. Before any production-sensitive change also read `PRODUCT.md`, `design.md`, `FOUNDATION_LOCK.md`; for database work read `drizzle/MIGRATION_STATUS.md`.

---

## 1. Product identity

**Last Bench** is an **Opportunity Accelerator**.

Corporate descriptor: **Education · Capability · Business · Community.**

Brand promise: **From where you are. To what you can build.**

Last Bench is the umbrella platform. It is not defined by Malaysia, admissions, CLASS[Λ] or co.lab alone.

Canonical architecture:

1. **Education & Mobility — Access**: education pathways, admissions/application support, visa/process guidance, pre-departure, settlement and student community.
2. **CLASS[Λ] — Capability**: AI, research, building, creation, growth, sales, automation and proof-of-work.
3. **co.lab — Business & Growth**: brand development, business development, growth strategy, creative execution, creator/community systems, venture validation and automation.
4. **Community + Platform — Connection & Continuity**: relationships, verified progress, opportunity routing and shared context across the ecosystem.

**Malaysia Admissions is one current active service inside Education & Mobility. It is not the corporate backbone.**

The Malaysia service promise remains: **help Bangladeshi students study, settle and succeed in Malaysia.**

Do not turn that service promise into the parent-company definition.

The ecosystem is not a mandatory funnel. Students, learners, founders, businesses and partners may enter through the engine relevant to their need.

Strategic progression thesis: **Access → Capability → Creation → Ownership.**

Non-negotiable product principles:

1. Clarity first — show where the person stands and what comes next.
2. Truth through evidence — never present demo, guessed or future-state values as current fact.
3. Multiple entry points — do not force every user through Malaysia mobility.
4. Outcome before feature — explain the opportunity and next meaningful action before technology.
5. Mentor-like tone — supportive and direct, not corporate filler.
6. Mobile-first, one-handed usability where relevant.
7. Community should compound relationships, not manufacture social proof.
8. Canonical brand assets are immutable: do not redraw, approximate or substitute approved logos.

AI guidance must use verified product/domain data, never invent admissions, cost, visa, acceptance, revenue, traction or partnership claims, and escalate high-stakes uncertainty to a human owner.

---

## 2. Canonical repository and architecture

```text
Repo: lets-colab/LastBenchBd

app/          Expo Router / React Native Web student, tutor and admin product
server/       Express + tRPC API
  _core/      server entry/auth/runtime infrastructure
  db.ts       database access
  routers.ts  product APIs
  self-healing.ts privacy-bounded diagnostics
landing/      cinematic Last Bench marketing site + CLASS[Λ] conversion surfaces
drizzle/      reviewed database schema/migrations and migration-status evidence
supabase/     Edge Functions and Supabase-side runtime code
scripts/      build/release verification tooling
server-dist/  generated API bundle
dist/         generated host-neutral static web artifact
```

One merged public web artifact is intentional:

- `/` = current Last Bench marketing landing
- `/app/*` = student application / Journey OS surfaces
- `/class-a/*` = CLASS[Λ] conversion surfaces

`pnpm build:web:production` assembles the complete static production artifact into `dist/`.

The parent runtime is aligned to the Opportunity Accelerator architecture. Malaysia remains a focused Education & Mobility service and must not be promoted back into the parent-company definition. Preserve the current service truth and the independent CLASS[Λ]/co.lab entry paths.

---

## 3. Current production topology — verified 22 September 2026

### Web

- Canonical URL: `https://lastbenchbd.com`.
- Primary production deployment: GitHub Pages from `main` via `.github/workflows/deploy-github-pages.yml`.
- The verified Pages deployment for the canonical design-system release is built from repository commit provenance and immutable workflow artifacts.
- Automatic Netlify production deployment is retired; Netlify is a legacy manual fallback only.
- Canonical-domain DNS still points at Netlify and is the remaining web-host cutover gate. Do **not** claim `lastbenchbd.com` is served by GitHub Pages until DNS and the release fingerprint prove it.
- Current `main` builds the complete host-neutral production site successfully.

### API

- Hosting: Render
- Canonical working service: `last-bench-api-v2`
- Region: Singapore
- Direct origin: `https://last-bench-api-v2.onrender.com`
- Direct `/api/health` is verified healthy.
- Public API hostname: `https://api.lastbenchbd.com`
- Custom-domain `/api/health` is verified reachable with semantic JSON `ok: true`.

### Database/Auth

- Supabase project: `the-last-bench`
- Authentication: **Supabase Auth**, not Manus OAuth.
- Production client values are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `/app/auth` contains the current sign-in/account-creation flow.
- `public.lastbench_signups` is the insert-only, RLS-protected homepage intake table.

Do not reintroduce Manus OAuth assumptions into current production documentation, checks or UI.

---

## 4. Service and engine boundaries

### Education & Mobility

Current active service: Malaysia Admissions.

Canonical Malaysia journey:

**DISCOVER → MATCH → APPLY → SECURE → PREPARE → ARRIVE**

Current service scope may include university selection, admissions/application support, visa/EMGS guidance, scholarship/funding-route verification, pre-departure, settlement and community.

Never guarantee visa, admission, scholarship, timeline or university relationship status.

### CLASS[Λ]

Current flagship capability path:

- Free Class 0 masterclass.
- Paid 20-Class One-Person Venture Builder.
- Five phases: AI Driver → AI Builder → AI Creator → AI Operator → AI Founder.
- Final five classes use co.lab venture gates: Select → Validate → Design → Automate → Launch.

CLASS[Λ] is an independent entry point and distinct visual namespace.

### co.lab

Current standalone positioning: Brand & Business Development / **The Growth Operating System for Modern Brands**.

Core sequence: **Collaboration → Connection → Community.**

co.lab serves founders/businesses directly and must not be reduced to a CLASS[Λ] course module.

### Community + Platform

Connective layer across engines. Shared identity, opportunity routing, referral systems or cross-engine context must be described as current only when implementation and evidence exist.

---

## 5. Release verification

Required local/CI verification before a production-sensitive merge:

```text
pnpm install
pnpm check
pnpm lint
pnpm test
pnpm audit --prod --audit-level critical
pnpm build
pnpm build:web
pnpm build:web:production
```

Current CI additionally verifies API startup, full site build and patch integrity. CodeQL must pass.

HTTP 200 alone is not release proof.

---

## 6. Authentication/session release gates

Public health checks do not prove session correctness. Before calling authenticated production complete, verify in a fresh browser:

1. account creation/sign-in through Supabase Auth
2. returning session survives refresh
3. authenticated tRPC request succeeds
4. logout invalidates the next protected request
5. CORS allows `https://lastbenchbd.com`

Do not claim these steps are complete without evidence from deployed production surfaces.

---

## 7. Database mutation rule

Production DDL is explicit and reviewed.

1. Update `drizzle/schema.ts` when application schema changes.
2. Write/review matching SQL under `drizzle/`.
3. Run read-only preflight when relations/data assumptions change.
4. Pass CI + CodeQL.
5. Merge the exact SQL.
6. Apply that exact SQL using the Supabase migration workflow.
7. Re-run security/performance advisors.
8. Update `drizzle/MIGRATION_STATUS.md` when live state changes materially.

`pnpm db:push` is intentionally blocked while legacy Drizzle snapshots are incomplete. Production server startup must never create or alter tables.

---

## 8. Forms and conversion truth

- The current homepage source submits directly to `public.lastbench_signups` through Supabase REST. Anonymous clients have INSERT only; submitted leads are not publicly readable.
- CLASS[Λ] JavaScript submits to `public.class_a_registrations`; its HTML retains Netlify form markup only as a compatibility/no-JavaScript fallback during the host transition.
- Historical Netlify submissions must be preserved, but they do not prove receipt for the new Supabase paths.

A thank-you screen or HTTP 200 does not prove receipt. Verify a real row in the intended Supabase table for each active production conversion journey.

---

## 9. Brand/design guardrails

### Last Bench

Preserve the approved green/white/charcoal identity and canonical bench/tick logo. Do not generate replacement logos.

Corporate identity: **Opportunity Accelerator**.

Visual law: **dark for emotion, white for trust, green for progress.**

### Education & Mobility / Malaysia service

May use the Last Bench corporate visual system while keeping the service conversion path focused on Malaysia and the six-stage student journey.

### CLASS[Λ]

Treat CLASS[Λ] as a distinct visual namespace. Its cinematic dark/high-contrast 3D/motion language must not automatically leak into Last Bench corporate or Education & Mobility surfaces.

### co.lab

Treat co.lab as a distinct business/visual namespace. Its brand system and commercial positioning must not be overwritten by Last Bench or CLASS[Λ] styling.

The design source of truth is version-controlled source + approved design assets, not a model's memory of a screenshot.

---

## 10. Current known blockers

In priority order:

1. Move `lastbenchbd.com` apex and `www` DNS from legacy Netlify to the verified GitHub Pages custom-domain configuration, then re-run release smoke.
2. Verify production Supabase Auth session journey end-to-end.
3. Verify real receipt in Supabase for homepage and CLASS[Λ] conversion journeys.
4. Finish the reviewed student document-picker/upload UI before calling upload complete.
5. Resolve hidden `discover` / `community` route status.
6. Lock mobile app identity before any store release.
7. Add persistent AI/message quotas when commercial usage policy is approved.
8. Visually certify the canonical-domain render after DNS cutover; build/deploy success is not visual approval.

---

## 11. Engineering standards

- Verify empirically; model/tool choice is never evidence.
- Never invent credentials, environment state, DNS state, deployment state, database rows or product facts.
- Never hide a release blocker to make a status look green.
- Never commit credentials or temporary deployment tokens to the public repository.
- Keep sensitive logs free of bearer/session tokens, private document URLs and student PII.
- Conventional commit prefixes: `fix:`, `feat:`, `build:`, `docs:`, `chore:`, `security:`, `db:`.
- High-trust surfaces include auth, documents, student data, commissions/payouts, partner claims and AI guidance.

---

## 12. Source-of-truth priority

When documentation disagrees:

1. Current explicit user direction recorded in canonical decision/product documents.
2. Current code + verified runtime/infrastructure behavior for implementation claims.
3. `PRODUCT.md` for business/product architecture.
4. `FOUNDATION_LOCK.md` / `drizzle/MIGRATION_STATUS.md` for production truth.
5. `README.md` / `AGENT.md` / `design.md`.
6. Feature-specific documentation.
7. Historical design handoffs and archived notes.

Historical Malaysia-first design snapshots remain useful evidence of the service experience, but they no longer define the parent-company category.

---

## 13. Replacement-agent bootstrap

> You are the lead engineer-agent for Last Bench (`lets-colab/LastBenchBd`). First understand the business truth: Last Bench is an **Opportunity Accelerator** with Education & Mobility, CLASS[Λ], co.lab, and a connective Community + Platform layer. Malaysia Admissions is one current active service inside Education & Mobility, not the corporate backbone. Read `PRODUCT.md`, `design.md`, `AGENT.md`, `FOUNDATION_LOCK.md`, `drizzle/MIGRATION_STATUS.md` and relevant feature/design sources before changing anything. Use current code plus verified live infrastructure as truth for implementation claims. Never claim deployment, authentication, admissions outcomes, form receipt, partnerships or future platform capability without evidence. Preserve canonical brand assets exactly.