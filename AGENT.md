# AGENT.md — Operating Manual for AI Agents Working on Last Bench

This file is the handoff brief for any AI agent working on this repository. Read it first. Before any production-sensitive change also read `FOUNDATION_LOCK.md`; for database work read `drizzle/MIGRATION_STATUS.md`.

---

## 1. Product identity

**Last Bench** is a Bangladesh → Malaysia student accelerator and AI-guided student platform. It is not positioned as a traditional consultancy.

Mission: help Bangladeshi students study, settle and succeed in Malaysia through transparent admissions support, onboarding, community and AI-assisted guidance.

Non-negotiable product principles:

1. Clarity first — show where the student stands and what comes next.
2. Trust through transparency — never present demo or guessed values as real facts.
3. Mentor-like tone — supportive and direct, not corporate filler.
4. Mobile-first, one-handed usability.
5. Community over transaction.
6. Canonical brand assets are immutable: do not redraw, approximate or substitute approved logos.

AI guidance must use verified university/product data, never invent admissions, cost, visa or acceptance claims, and escalate high-stakes uncertainty to a human mentor.

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
 dist/        generated host-neutral static web artifact
```

One merged public web artifact is intentional:

- `/` = Last Bench cinematic marketing landing
- `/app/*` = student product
- `/class-a/*` = CLASS[Λ] conversion surfaces

`pnpm build:web:production` assembles the complete static production artifact into `dist/`.

---

## 3. Current production topology — verified 10 September 2026

### Web

- Canonical URL: `https://lastbenchbd.com`.
- Current public host: Netlify project `lastbenchbdd` (site ID `04a1423a-961c-4b5e-bb4b-53db3027317e`).
- Current public deploy is an older upload-based production deploy. Do **not** assume current `main` is live just because Netlify reports the deploy as `ready`.
- Approved deployment target: Cloudflare Pages with GitHub `main` integration. Create and verify a Pages preview before moving the canonical domain.
- Production smoke requires `claude-design-support.js`, `bench-ai.js` and the Supabase homepage-signup endpoint; the current Netlify homepage does not yet contain that release.
- Current `main` builds the complete host-neutral production site successfully. Public build values in `netlify.toml` must be mirrored into Cloudflare Pages until configuration is consolidated.

### API

- Hosting: Render
- Canonical working service: `last-bench-api-v2`
- Region: Singapore
- Direct origin: `https://last-bench-api-v2.onrender.com`
- Direct `/api/health` is verified healthy.
- Public API hostname: `https://api.lastbenchbd.com`
- Custom-domain `/api/health` is verified reachable with semantic JSON `ok: true`. AI remains an optional unconfigured integration, so health currently reports `degraded: true` without making the core API unavailable.

### Database/Auth

- Supabase project: `the-last-bench`
- Project ref: `tocxdyqlrvzthpexnmxe`
- Region: `ap-southeast-1`
- Status: `ACTIVE_HEALTHY`
- Authentication: **Supabase Auth**, not Manus OAuth.
- Production client values are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `/app/auth` contains the current sign-in/account-creation flow.
- `public.lastbench_signups` is the insert-only, RLS-protected homepage intake table; migration `lastbench_homepage_signups` is applied.

Do not reintroduce Manus OAuth assumptions into current production documentation, checks or UI.

---

## 4. Release verification

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

### Production smoke

`pnpm release:smoke` / `.github/workflows/production-smoke.yml` verifies:

- custom API hostname returns semantic JSON health
- direct Render origin returns semantic JSON health
- landing is the expected current release, not merely HTTP 200
- `/app/`
- `/class-a/`
- CLASS masterclass
- CLASS course

When custom API DNS fails, smoke diagnostics print CNAME/A/AAAA and authoritative-zone information. A failed run maintains GitHub issue **Production smoke gate**.

HTTP 200 alone is not release proof.

---

## 5. Authentication/session release gates

Public health checks do not prove session correctness. Before calling authenticated production complete, verify in a fresh browser:

1. account creation/sign-in through Supabase Auth
2. returning session survives refresh
3. authenticated tRPC request succeeds
4. logout invalidates the next protected request
5. CORS allows `https://lastbenchbd.com`

Do not claim these steps are complete without evidence from the deployed production surfaces.

---

## 6. Database mutation rule

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

Current Supabase security advisor has no WARN/ERROR findings. Informational RLS-enabled/no-policy notices are expected under the server-owned default-deny architecture unless the architecture is deliberately changed.

---

## 7. Forms and conversion truth

- The current homepage source submits directly to `public.lastbench_signups` through Supabase REST. Anonymous clients have INSERT only; submitted leads are not publicly readable.
- CLASS[Λ] JavaScript submits to `public.class_a_registrations`; its HTML retains Netlify form markup as a compatibility fallback while the current public host remains Netlify.
- Historical Netlify submissions must be preserved, but they do not prove receipt for the new Supabase homepage path.

A thank-you screen or HTTP 200 does not prove receipt. Verify a real row in the intended Supabase table for each active production conversion journey.

---

## 8. Brand/design guardrails

### Last Bench

Preserve the approved green/white/black identity and canonical bench/tick logo. Do not generate replacement logos. Marketing/UI must preserve Student Accelerator positioning.

### CLASS[Λ]

Treat CLASS[Λ] as a distinct visual namespace. Its cinematic dark/high-contrast 3D/motion language must not leak into Last Bench admissions surfaces unless an explicitly approved crossover component calls for it.

The design source of truth is version-controlled source + approved design assets, not a model's memory of a screenshot.

---

## 9. Current known blockers

In priority order:

1. Create a Cloudflare Pages project from GitHub `main`, deploy `dist/`, and verify the `pages.dev` preview.
2. Move `lastbenchbd.com` to the verified Pages project without interrupting the healthy Render API hostname.
3. Verify production Supabase Auth session journey end-to-end.
4. Verify real receipt in Supabase for the homepage and both CLASS[Λ] conversion journeys.
5. Finish the reviewed student document-picker/upload UI before calling upload complete.
6. Resolve hidden `discover` / `community` route status.
7. Lock mobile app identity before any store release.
8. Add persistent AI/message quotas when commercial usage policy is approved.

---

## 10. Engineering standards

- Verify empirically; model/tool choice is never evidence.
- Never invent credentials, environment state, DNS state, deployment state, database rows or product facts.
- Never hide a release blocker to make a status look green.
- Never commit credentials or temporary deployment tokens to the public repository.
- Keep sensitive logs free of bearer/session tokens, private document URLs and student PII.
- Conventional commit prefixes: `fix:`, `feat:`, `build:`, `docs:`, `chore:`, `security:`, `db:`.
- High-trust surfaces include auth, documents, student data, commissions/payouts and AI guidance.

---

## 11. Replacement-agent bootstrap

> You are the lead engineer-agent for Last Bench (`lets-colab/LastBenchBd`). Read `AGENT.md`, `FOUNDATION_LOCK.md`, `drizzle/MIGRATION_STATUS.md`, `README.md` and relevant design/product sources before making changes. Use current `main` plus verified live infrastructure as truth. Authentication is Supabase Auth. The healthy API control-plane origin is `last-bench-api-v2.onrender.com`; `api.lastbenchbd.com/api/health` is verified healthy. The canonical web domain is still serving a stale Netlify upload while the approved Cloudflare Pages cutover is pending preview verification. Never claim deployment, authentication or form receipt without production evidence. Preserve canonical brand assets exactly.
