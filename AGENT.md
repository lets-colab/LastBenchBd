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
 dist/        generated Netlify web artifact
```

One merged public web artifact is intentional:

- `/` = Last Bench cinematic marketing landing
- `/app/*` = student product
- `/class-a/*` = CLASS[Λ] conversion surfaces

`pnpm build:web:production` assembles the complete Netlify artifact into `dist/`.

---

## 3. Current production topology — verified 9 September 2026

### Web

- Hosting: Netlify
- Canonical project: `lastbenchbdd`
- Site ID: `04a1423a-961c-4b5e-bb4b-53db3027317e`
- Primary URL: `https://lastbenchbd.com`
- Current public deploy is an older upload-based production deploy. Do **not** assume current `main` is live just because Netlify reports the deploy as `ready`.
- Production smoke requires the homepage release fingerprint `claude-design-support.js` + `bench-ai.js`; the current public homepage does not yet contain that fingerprint.
- Current `main` does build the complete production site successfully in CI.
- Netlify site-level environment variables are currently empty; reviewed public production values are committed in `netlify.toml`.

### API

- Hosting: Render
- Canonical working service: `last-bench-api-v2`
- Region: Singapore
- Direct origin: `https://last-bench-api-v2.onrender.com`
- Direct `/api/health` is verified healthy.
- Intended public API hostname: `https://api.lastbenchbd.com`
- Current DNS state: the `api` hostname has no CNAME, A or AAAA answer. This is a DNS/custom-domain routing blocker, not an API-code failure.

### Database/Auth

- Supabase project: `the-last-bench`
- Project ref: `tocxdyqlrvzthpexnmxe`
- Region: `ap-southeast-1`
- Status: `ACTIVE_HEALTHY`
- Authentication: **Supabase Auth**, not Manus OAuth.
- Production client values are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `/app/auth` contains the current sign-in/account-creation flow.

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

Canonical Netlify forms include:

- `signup`
- `class-a-masterclass`
- `class-a-course`

A thank-you screen does not prove receipt. A conversion flow is only verified when a real submission appears in Netlify.

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

1. Add correct DNS/custom-domain routing for `api.lastbenchbd.com` to the healthy Render service.
2. Publish current `main` to canonical Netlify project `lastbenchbdd`; current public homepage is stale.
3. Restore dependable Netlify deployment authorization/integration so future `main` updates cannot silently remain undeployed.
4. Verify production Supabase Auth session journey end-to-end.
5. Verify real receipt for each active Netlify conversion form.
6. Finish the reviewed student document-picker/upload UI before calling upload complete.
7. Resolve hidden `discover` / `community` route status.
8. Lock mobile app identity before any store release.
9. Add persistent AI/message quotas when commercial usage policy is approved.

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

> You are the lead engineer-agent for Last Bench (`lets-colab/LastBenchBd`). Read `AGENT.md`, `FOUNDATION_LOCK.md`, `drizzle/MIGRATION_STATUS.md`, `README.md` and relevant design/product sources before making changes. Use current `main` plus verified live infrastructure as truth. Authentication is Supabase Auth. The healthy API control-plane origin is `last-bench-api-v2.onrender.com`; `api.lastbenchbd.com` remains a DNS gate until verified. The canonical Netlify project is `lastbenchbdd`, but its currently public homepage is stale relative to `main`. Never claim deployment, authentication, form receipt or DNS correctness without production evidence. Preserve canonical brand assets exactly.
