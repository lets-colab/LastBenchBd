<p align="center">
  <img src="./landing/assets/logo-full.png" alt="Last Bench" width="320" />
</p>

<h1 align="center">Last Bench</h1>

<p align="center"><strong>The Company · Two Labs · One Intelligence Loop</strong></p>

<p align="center"><strong>CLASS[Λ] Human Lab · co.lab Business Lab · Co.MPASS · Dr. X</strong></p>

<p align="center">From where you are. To what you can build.</p>

<p align="center">Last Bench is the company. CLASS[Λ] builds builders. co.lab incubates, accelerates and grows businesses through Ventures, Projects, Services and Community. Co.MPASS converges governed evidence. Dr. X is the Founder Second Brain / Twin.</p>

<p align="center">
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml/badge.svg" alt="Production Smoke" /></a>
</p>

---

## Business architecture

- **CLASS[Λ] — Human Lab:** builds builders through capability, execution and proof.
- **co.lab — Business Lab:** Ventures · Projects · Services · Community. ProjectX = Website Projects.
- **Co.MPASS — Business Dashboard:** converges governed company evidence into context, clarity and direction.
- **Dr. X — Founder Second Brain / Twin:** governed memory, founder context, JEV judgment and reasoning for decisions.
- **Education & Mobility:** an operating/service domain inside Last Bench; Malaysia Admissions is one current service.

Flywheel: **CLASS[Λ] + co.lab activity → governed evidence → Co.MPASS → Dr. X → decision → improved labs → new evidence.**

For canonical product positioning, read [`PRODUCT.md`](./PRODUCT.md). For experience rules, read [`design.md`](./design.md).

---

## Production architecture

| Layer | Platform | Contract |
| --- | --- | --- |
| Marketing + web app | **GitHub Pages** | Sole canonical production web host; `main` builds and deploys the exact production artifact |
| API | **Render** | Express + tRPC |
| Identity | **Supabase Auth** | Email/password sessions; HTTP-only cookies on web, bearer/refresh tokens on native |
| Database | **Supabase Postgres** | Drizzle schema + reviewed SQL migration ledger |
| Private files | **Supabase Storage** | `student-documents`, private, per-user RLS |
| Public intelligence | **Dr. X** | Human-facing Last Bench intelligence identity; founder profiles remain real-person profiles powered by Dr. X |
| AI execution provider | **OpenAI Responses API** | Current server-side provider when configured; replaceable implementation detail |
| Canonical web | `https://lastbenchbd.com` | DNS cutover to GitHub Pages complete; current release fingerprint/render verification remains a release gate |
| Canonical API | `https://api.lastbenchbd.com` | Render custom domain |

**Manus and Forge are not part of the supported production architecture.** Legacy integration modules and environment contracts have been removed.

> Product truth is a feature. Last Bench must never present fabricated admissions data, fake progress, placeholder metrics, invented business results or AI guesses as real guidance.

---

## Product system

```text
lastbenchbd.com/
├── /          → current cinematic marketing experience
├── /app       → student/Journey OS application
└── /class-a/* → CLASS[Λ] conversion + program surfaces

api.lastbenchbd.com/
└── /api       → Express + tRPC runtime
```

The current `/` marketing implementation has historical Malaysia-service-led sections. They must remain correctly scoped as service content while the corporate framing follows JEV Architecture `2026.09.29`. Any migration must be tested and visually verified so the active Malaysia conversion journey is not broken.

Repository surfaces:

| Surface | Location |
| --- | --- |
| Marketing experience | `landing/` |
| Student/tutor/admin app | `app/` |
| CLASS[Λ] | `landing/class-a/` |
| API | `server/` |
| Database schema + migrations | `drizzle/` |
| Shared logic | `shared/` |
| Design system | `design-system/`, `design.md` |
| Verification | `tests/`, `.github/workflows/` |

### Core stack

`Expo 54` · `React Native 0.81` · `React 19` · `Expo Router 6` · `TypeScript 5.9` · `NativeWind` · `TanStack Query` · `tRPC 11` · `Express` · `Drizzle ORM` · `Supabase` · `Vitest` · `pnpm 9.12`

---

## Authentication

Supabase Auth is the identity authority.

- Web: Last Bench API stores Supabase access and refresh tokens in HTTP-only cookies.
- Native: access and refresh tokens are stored with Expo SecureStore and sent as bearer credentials.
- `public.users.openId` is retained only as a compatibility column and stores the Supabase Auth UUID (`auth.users.id`). It is no longer a Manus/OpenID identifier.
- Logout revokes the Supabase session where possible and prevents refresh-cookie session resurrection.
- No Supabase service-role/secret key belongs in the client bundle.

Public client configuration uses only the Supabase project URL and **publishable** key.

---

## Student documents

`drizzle/0004_supabase_identity_storage.sql` establishes the storage contract:

- private bucket: `student-documents`
- maximum file size: 10 MB
- allowed types: PDF, JPEG, PNG
- authenticated users can only select/insert/update/delete objects inside a top-level folder matching their own Supabase Auth UUID

The bucket/policies are infrastructure foundation. The complete document-picker/upload UX must still be verified end to end before calling student uploads released.

---

## Dr. X public intelligence

The public Last Bench intelligence identity is **Dr. X**. The previous visible **Bench AI** name is retired. The legacy `landing/bench-ai.js` filename remains temporarily for compatibility with the verified landing export and must not be treated as a separate product or brain.

The founder experience is human-first:

- **Sayem Ahmed** — Co-founder & CEO — interactive profile **Powered by Dr. X**;
- **Fahim Shahbaz Mahmud** — Co-founder & COO — interactive profile **Powered by Dr. X**;
- **Erfan Uddin** — Co-founder & Chief Business & Innovation Officer — **Also known as Dr. X**.

Portraits must come from approved identity sources. Exact external founder-profile links are published only after URL verification. Generated founder-profile replies are not direct statements from the founder unless explicitly source-verified.

Current runtime truth: AI guidance still calls the OpenAI Responses API from the Render server when `OPENAI_API_KEY` is configured. A future DR.X Gateway/provider route may replace or govern that provider, but repository identity changes do not prove that Gateway routing is live in production.

The core API, auth, applications and other product functions must remain available when no AI provider key is configured. `/api/health` reports `aiConfigured` and the overall degraded state.

Dr. X guidance must remain grounded in verified project data. Never invent or imply certainty around current fees, rankings, visa probability, scholarships, eligibility, admission probability, partner status, revenue, traction or other high-stakes facts. Escalate to a human owner when current verification or professional judgment is required. Public Dr. X/founder-profile requests are Last Bench-scoped and must not receive private Founder DR.X, unrelated-project or unrestricted Second Brain context.

---

## Quick start

Prerequisites: Node.js 20, pnpm 9.12.x, and your own local environment values.

```bash
git clone https://github.com/lets-colab/LastBenchBd.git
cd LastBenchBd
pnpm install
cp .env.example .env
pnpm dev
```

Never commit real credentials.

Useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | API + Expo development |
| `pnpm check` | TypeScript verification |
| `pnpm lint` | ESLint verification |
| `pnpm test` | Vitest suite |
| `pnpm build` | Build API to `server-dist/` |
| `pnpm build:web` | Build combined local web artifact |
| `pnpm build:web:production` | Validate public env + production web build |
| `pnpm release:smoke` | Verify canonical public routes and API health |
| `pnpm audit --prod --audit-level critical` | Critical production dependency audit |
| `pnpm db:push` | Intentionally blocked until Drizzle snapshots are rebuilt from the reconciled baseline |

Production DDL follows: **reviewed GitHub SQL → CI/CodeQL → merge → Supabase migration → advisor verification**. See [`drizzle/MIGRATION_STATUS.md`](./drizzle/MIGRATION_STATUS.md).

---

## Environment contract

### Render

Required core runtime values:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`

Optional integrations:

- `ADMIN_AUTH_USER_ID`
- `OPENAI_API_KEY`
- `OPENAI_API_BASE_URL`
- `AI_GUIDANCE_MODEL`
- `AUTO_DIAGNOSE_ERRORS`

### Static web / Expo public bundle

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The production build rejects a Supabase `sb_secret_*` value if it is accidentally placed in the public publishable-key variable.

---

## Release truth

A green build is not proof of a working product. Before calling the authenticated product fully released, verify:

- [x] Supabase database migrations through homepage intake `0005` are applied
- [x] relational foreign keys/uniqueness/indexes are verified
- [ ] production DB security advisor is fully reconciled — current live advisor still reports WARN findings: public `SECURITY DEFINER` CLASS RPC exposure, `pg_net` installed in `public`, and Auth leaked-password protection disabled. RLS-enabled/no-policy notices remain informational/default-deny candidates and must not be blanket-fixed without an access model.
- [x] production smoke workflow exists
- [x] migration `0004` storage/auth-identity contract is merged and applied
- [x] canonical Render service reports Supabase auth/storage configured
- [x] `api.lastbenchbd.com/api/health` returns semantic JSON health
- [x] homepage Supabase REST intake accepts an anonymous insert without exposing lead reads
- [x] GitHub Pages builds and deploys the verified production artifact from current `main`
- [x] `lastbenchbd.com` DNS points to the GitHub Pages custom-domain configuration
- [ ] fresh sign-in succeeds with a real user
- [ ] returning session succeeds
- [ ] authenticated API request succeeds
- [ ] logout prevents session resurrection
- [ ] student document upload/download authorization is verified
- [ ] homepage, CLASS[Λ] masterclass and CLASS[Λ] course receipt is verified with real production Supabase rows
- [ ] corporate runtime architecture passes the JEV `2026.09.29` architecture-release gate on the canonical domain
- [ ] visually verify the canonical-domain render and current release fingerprint

No production user, credential, admissions result, business outcome or verification evidence should ever be fabricated to satisfy this checklist.

---

## Brand guardrails

Canonical logo assets live under `assets/branding/` and `landing/assets/`.

- Do not redraw or approximate approved logos.
- Do not regenerate approved marks with AI.
- Do not distort proportions or recolor outside approved variants.
- Preserve the established Last Bench green/white/charcoal visual system.
- Keep CLASS[Λ] and co.lab in their own approved visual namespaces.

Current documented palette:

| Token | Value |
| --- | --- |
| Brand Green | `#00C853` |
| Charcoal | `#111111` |
| Warm White | `#FAFAF8` |
| Sage | `#E6F2E9` |
| Gray | `#6B6F76` |

---

## Engineering guardrails

- Never ship hardcoded demo values disguised as real data.
- Verify runtime behavior empirically rather than inferring production health from source.
- Keep database changes deliberate and reviewed.
- Never auto-alter production tables during normal startup.
- New data-backed features should follow: **schema → DB helper → tRPC procedure → UI → tests**.
- Treat authentication, documents, commissions, student records, partner claims and AI guidance as high-trust surfaces.
- Surface known gaps rather than hiding them.

### Source-of-truth order

When documentation disagrees:

1. Current explicit user direction recorded in canonical business/product documents.
2. Current code + verified runtime/infrastructure behavior for implementation claims.
3. `architecture/JEV_VERSION.json` + `PRODUCT.md` for current business/product architecture.
4. `FOUNDATION_LOCK.md` / `drizzle/MIGRATION_STATUS.md` for production truth.
5. `README.md` / `AGENT.md` / `design.md`.
6. Feature-specific documentation.
7. Historical design handoffs and archived notes.

The active repository is **`lets-colab/LastBenchBd`**.

---

<p align="center">
  <strong>Last Bench</strong><br />
  From where you are. To what you can build.
</p>