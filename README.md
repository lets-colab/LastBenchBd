<p align="center">
  <img src="./landing/assets/logo-full.png" alt="Last Bench" width="320" />
</p>

<h1 align="center">Last Bench</h1>

<p align="center"><strong>We help Bangladeshi students study, settle and succeed in Malaysia.</strong></p>

<p align="center">
  A student-first digital journey platform for clearer decisions, transparent progress, verified guidance and community support.
</p>

<p align="center">
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml/badge.svg" alt="Production Smoke" /></a>
</p>

---

## At a glance

| | |
| --- | --- |
| **Product** | Bangladesh → Malaysia student journey platform |
| **Experience** | Marketing site at `/` + student application at `/app` |
| **Frontend** | Expo Router · React Native · React · TypeScript |
| **API** | Express · tRPC |
| **Data** | Drizzle ORM · Supabase Postgres |
| **Web deployment** | Netlify |
| **API deployment** | Render |
| **Repository** | `lets-colab/LastBenchBd` |
| **Canonical web** | `https://lastbenchbd.com` |
| **Release posture** | Repository + database foundation locked; production identity/auth verification remains gated |

> **Product truth is a feature.** Last Bench must never present fabricated admissions data, fake progress, placeholder metrics or AI guesses as real student guidance.

---

## Why Last Bench exists

Studying abroad is not one decision. It is a chain of decisions: university discovery, eligibility, documents, applications, visas, communication, arrival and what happens after admission.

Last Bench is being built to make that journey understandable.

The product is not designed as a traditional education-consultancy website. It is a student-first system that should always answer three questions:

1. **Where am I now?**
2. **What happens next?**
3. **Who can help when the answer needs a human?**

### Product principles

- **Clarity first** — the next action should be obvious.
- **Trust through transparency** — distinguish verified facts, system state, AI guidance and human updates.
- **Mentor-like guidance** — direct, supportive and human; never corporate or patronizing.
- **Mobile first** — designed for real student devices and imperfect connections.
- **Community over transaction** — the relationship should continue beyond admission.

For deeper product and brand context, read [`PRODUCT.md`](./PRODUCT.md), [`design.md`](./design.md), [`AGENT.md`](./AGENT.md) and [`FOUNDATION_LOCK.md`](./FOUNDATION_LOCK.md).

---

## The product system

This repository contains one connected platform rather than separate disconnected projects.

| Surface | Role | Location |
| --- | --- | --- |
| **Marketing experience** | Story, trust, lead capture and entry into the student journey | `landing/` |
| **Student app** | Dashboard, applications, universities, messages, community, AI Guides and profile | `app/` |
| **API** | Authenticated product and business logic | `server/` |
| **Database** | Product schema and reviewed migrations | `drizzle/` |
| **Shared logic** | Cross-surface types and business logic | `shared/` |
| **Design system** | Product visual and interaction standards | `design-system/`, `design.md` |
| **Tests** | Auth, privacy, matching, CORS, AI and product verification | `tests/` |

The web build is intentionally unified:

```text
lastbenchbd.com/
├── /          → marketing experience
└── /app       → student application
```

---

## What is already built

### Student journey

- Profile and onboarding
- Journey dashboard connected to backend data
- Multi-stage application tracking
- Application detail, timeline, mentor notes and document metadata
- University discovery and comparison
- Malaysia university dataset used by product logic
- Notifications and notification settings

### Guidance and community

- Three AI Guides representing **Sayem, Fahim and Erfan**
- Guide-specific persistent chat history
- Shared student memory for AI guidance
- Two-way messaging and conversation threads
- Community and cohort experiences

### Operations

- Tutor referral flows
- Commission and payout flows
- Admin views for students, applications, tutors, payouts and analytics
- Lead form with explicit WhatsApp consent and Bangladesh phone validation

### Trust and resilience

- Real loading, empty, error and service-unavailable states
- Privacy-bounded diagnostics / self-healing support
- Automated TypeScript, lint, test, production-build and critical dependency-audit checks in CI
- Scheduled + post-`main` production smoke monitoring with automatic GitHub incident issue handling
- Grounding rules for AI-generated university guidance
- Live Supabase relational integrity with explicit foreign keys, uniqueness rules and query indexes

### AI guidance rule

AI guidance must remain grounded in verified project data. Do not invent or imply certainty around acceptance rates, current fees, rankings, visa probability, scholarships, eligibility or other high-stakes facts. When current verification or professional judgment is required, escalate to a human mentor.

---

## Architecture

```text
landing/                 Static marketing experience
app/                     Expo Router student, tutor and admin UI
components/              Shared UI components
hooks/                   React hooks
lib/                     Client/shared libraries
server/                  Express + tRPC API
server/db.ts             Database access layer
server/routers.ts        Product/API procedures
server/self-healing.ts   Redacted diagnostics + safe retry/advisory logic
drizzle/                 Postgres schema + reviewed migrations
shared/                  Shared business logic and types
design-system/           Design-system resources
scripts/                 Build, validation and utility scripts
tests/                   Vitest test suite
```

### Core stack

`Expo 54` · `React Native 0.81` · `React 19` · `Expo Router 6` · `TypeScript 5.9` · `NativeWind` · `TanStack Query` · `tRPC 11` · `Express` · `Drizzle ORM` · `PostgreSQL / Supabase` · `Vitest` · `pnpm 9.12`

---

## Quick start

### Prerequisites

- Node.js 20 is the CI baseline
- `pnpm` 9.12.x
- Required environment configuration from `.env.example`

### Install

```bash
git clone https://github.com/lets-colab/LastBenchBd.git
cd LastBenchBd
pnpm install
cp .env.example .env
```

Supply your own local environment values. **Never commit real credentials.**

### Run the application and API

```bash
pnpm dev
```

Or run surfaces separately:

```bash
pnpm dev:server
pnpm dev:metro
pnpm android
pnpm ios
```

---

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run API + Expo development processes |
| `pnpm check` | TypeScript verification |
| `pnpm lint` | ESLint verification |
| `pnpm test` | Vitest suite |
| `pnpm build` | Build production API bundle to `server-dist/` |
| `pnpm build:web` | Assemble the combined local web artifact in `dist/` |
| `pnpm build:web:production` | Validate public environment configuration + build production web artifact |
| `pnpm release:smoke` | Verify canonical public web routes + API health with retries |
| `pnpm audit --prod --audit-level critical` | Block critical production dependency findings |
| `pnpm db:push` | **Safety guard:** intentionally refuses until Drizzle snapshots are rebuilt from the reconciled live baseline |
| `pnpm qr` | Generate a project QR code |

Production DDL follows the reviewed **GitHub SQL → CI/CodeQL → Supabase migration → advisor verification** path documented in [`drizzle/MIGRATION_STATUS.md`](./drizzle/MIGRATION_STATUS.md).

---

## Verification contract

A change is not complete because it compiles. Before merging or releasing, verify it.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
pnpm audit --prod --audit-level critical
pnpm build
pnpm build:web
```

For the production web build path:

```bash
pnpm build:web:production
```

For public production health:

```bash
pnpm release:smoke
```

The repository also runs `.github/workflows/production-smoke.yml` after pushes to `main`, once daily, and on manual dispatch. Failures create/update a GitHub issue named **Production smoke gate**; recovery closes it automatically.

---

## Production topology

| Layer | Platform | Contract |
| --- | --- | --- |
| Marketing + web app | **Netlify** | `/` = landing · `/app` = student app |
| API | **Render** | Express/tRPC runtime |
| Database | **Supabase Postgres** | Product data + reviewed migration ledger |
| Canonical web host | `lastbenchbd.com` | Current Netlify primary custom domain |
| Canonical API host | `api.lastbenchbd.com` | Intended Render custom domain |

Netlify is the supported web deployment for this repository. Render is the supported API runtime.

### Release gate

Repository configuration or a green CI badge alone does **not** prove authenticated production is live.

Verified foundation state:

- [x] Canonical Netlify project identified and production deployment is connected to `main`
- [x] Supabase repo migrations `0001` and `0002` applied
- [x] Supabase relational foundation migration applied
- [x] Live database preflight found no duplicate/orphan business rows before hardening
- [x] Supabase security advisor has no WARN/ERROR findings after hardening
- [x] Automated production smoke workflow exists

Still required before calling the complete authenticated product released:

- [ ] Real Manus `APP_ID` and `OWNER_OPEN_ID` are configured for production; placeholder `*-unconfigured` values are not accepted
- [ ] Required server values are verified in Render
- [ ] `api.lastbenchbd.com` resolves to the intended Render service and `/api/health` returns JSON `{ ok: true }`
- [ ] Fresh-browser login and logout succeed
- [ ] Returning-session authentication succeeds
- [ ] A real authenticated API request succeeds
- [ ] Real submissions are received by `signup`, `class-a-masterclass` and `class-a-course`
- [ ] Document/storage authorization is verified before opening the full upload flow

Detailed release rules live in [`FOUNDATION_LOCK.md`](./FOUNDATION_LOCK.md) and [`AGENT.md`](./AGENT.md).

---

## Brand system

Canonical brand resources live under [`assets/branding/`](./assets/branding/) and production logo assets under [`landing/assets/`](./landing/assets/).

Approved brand assets are source assets:

- Do not redraw or approximate the logo
- Do not regenerate approved marks with AI
- Do not distort proportions
- Do not recolor outside approved variants
- Preserve clear space and visual hierarchy

Current documented palette:

| Token | Value |
| --- | --- |
| Brand Green | `#00C853` |
| Charcoal | `#111111` |
| Warm White | `#FAFAF8` |
| Sage | `#E6F2E9` |
| Gray | `#6B6F76` |

The intended direction is cinematic, sincere and forward-moving — never generic education-agency design and never charity/pity framing.

---

## Engineering guardrails

- Use conventional commits: `feat:`, `fix:`, `docs:`, `build:`, etc.
- Never ship hardcoded demo values disguised as real data
- Verify behavior empirically; do not infer production health from source alone
- Keep database changes deliberate and reviewed
- Never auto-create or auto-alter production tables during normal server startup
- New data-backed features should follow: **schema → DB helper → tRPC procedure → UI → tests**
- Surface known gaps rather than hiding them
- Treat authentication, documents, commissions, student records and AI guidance as high-trust surfaces

---

## Documentation map

| Document | Purpose |
| --- | --- |
| [`README.md`](./README.md) | Repository front door, architecture and release posture |
| [`FOUNDATION_LOCK.md`](./FOUNDATION_LOCK.md) | Production trust, database, release and automation contract |
| [`drizzle/MIGRATION_STATUS.md`](./drizzle/MIGRATION_STATUS.md) | Verified database reconciliation and migration workflow |
| [`AGENT.md`](./AGENT.md) | Detailed engineering/AI-agent operating manual |
| [`AGENTS.md`](./AGENTS.md) | Additional agent instructions |
| [`PRODUCT.md`](./PRODUCT.md) | Product and brand definition |
| [`design.md`](./design.md) | Product design system and interaction rules |
| [`DESIGN_AUDIT_AND_REBUILD.md`](./DESIGN_AUDIT_AND_REBUILD.md) | Design audit and rebuild record |
| [`MESSAGING_FEATURES.md`](./MESSAGING_FEATURES.md) | Messaging implementation documentation |
| [`todo.md`](./todo.md) | Working backlog; not proof of completion |

### Source-of-truth order

When documentation disagrees:

1. **Current code + verified runtime/infrastructure behavior**
2. **FOUNDATION_LOCK.md / drizzle/MIGRATION_STATUS.md for production + DB truth**
3. **README**
4. **AGENT.md**
5. **PRODUCT.md / design.md**
6. Feature-specific documentation
7. `todo.md`

> The active repository is **`lets-colab/LastBenchBd`**. Treat older repository names or obsolete deployment hosts as documentation drift, not canonical identity.

---

## Current priority

The foundation is locked. The remaining work is release proof and user-flow completion:

1. Replace production Manus OAuth identity placeholders with verified real values
2. Verify Render configuration + `api.lastbenchbd.com` health
3. Prove fresh/returning authentication and authenticated API access end to end
4. Prove receipt of all three active Netlify forms
5. Finish and verify the student document-picker/storage flow
6. Add automated browser E2E for auth → onboarding → application → messaging → logout
7. Lock permanent native app identity before store distribution
8. Keep university/admissions data current, attributable and reviewable

---

<p align="center">
  <strong>Last Bench</strong><br />
  From uncertainty to a clear next step.
</p>
