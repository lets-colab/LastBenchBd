<p align="center">
  <img src="./landing/assets/logo-full.png" alt="Last Bench" width="320" />
</p>

<h1 align="center">Last Bench</h1>

<p align="center"><strong>We help Bangladeshi students study, settle and succeed in Malaysia.</strong></p>

<p align="center">A student-first journey platform for clearer decisions, transparent progress, verified guidance and community support.</p>

<p align="center">
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml"><img src="https://github.com/lets-colab/LastBenchBd/actions/workflows/production-smoke.yml/badge.svg" alt="Production Smoke" /></a>
</p>

---

## Production architecture

| Layer | Platform | Contract |
| --- | --- | --- |
| Marketing + web app | **Netlify** | `/` landing · `/app` student app |
| API | **Render** | Express + tRPC |
| Identity | **Supabase Auth** | Email/password sessions; HTTP-only cookies on web, bearer/refresh tokens on native |
| Database | **Supabase Postgres** | Drizzle schema + reviewed SQL migration ledger |
| Private files | **Supabase Storage** | `student-documents`, private, per-user RLS |
| AI | **OpenAI Responses API** | Server-side only; optional until a production API key is configured |
| Canonical web | `https://lastbenchbd.com` | Netlify |
| Canonical API | `https://api.lastbenchbd.com` | Render custom domain |

**Manus and Forge are not part of the supported production architecture.** Legacy integration modules and environment contracts have been removed.

> Product truth is a feature. Last Bench must never present fabricated admissions data, fake progress, placeholder metrics or AI guesses as real student guidance.

---

## Product system

```text
lastbenchbd.com/
├── /          → cinematic marketing experience
└── /app       → student application

api.lastbenchbd.com/
└── /api       → Express + tRPC runtime
```

Repository surfaces:

| Surface | Location |
| --- | --- |
| Marketing experience | `landing/` |
| Student/tutor/admin app | `app/` |
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

## AI guidance

AI guidance calls the OpenAI Responses API directly from the Render server. `OPENAI_API_KEY` is server-only and never belongs in Netlify or the Expo bundle.

AI is deliberately an optional integration: the core API, auth, applications and other product functions must remain available when no OpenAI key is configured. `/api/health` reports `aiConfigured` and the overall degraded state.

AI guidance must remain grounded in verified project data. Never invent or imply certainty around current fees, rankings, visa probability, scholarships, eligibility, admission probability or other high-stakes facts. Escalate to a human mentor when current verification or professional judgment is required.

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

### Netlify / Expo public bundle

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The production build rejects a Supabase `sb_secret_*` value if it is accidentally placed in the public publishable-key variable.

---

## Release truth

A green build is not proof of a working product. Before calling the authenticated product fully released, verify:

- [x] Netlify production site is connected to `main`
- [x] Supabase database migrations through relational foundation `0003` are applied
- [x] relational foreign keys/uniqueness/indexes are verified
- [x] production DB security advisor has no known foundation WARN/ERROR findings
- [x] production smoke workflow exists
- [ ] migration `0004` storage/auth-identity contract is merged and applied
- [ ] Render is running the merged Supabase-auth build
- [ ] `api.lastbenchbd.com/api/health` reports the intended integration state
- [ ] fresh sign-in succeeds with a real user
- [ ] returning session succeeds
- [ ] authenticated API request succeeds
- [ ] logout prevents session resurrection
- [ ] student document upload/download authorization is verified
- [ ] `signup`, `class-a-masterclass` and `class-a-course` receipt is verified with real submissions

No production user, credential, admissions result or verification evidence should ever be fabricated to satisfy this checklist.

---

## Brand guardrails

Canonical logo assets live under `assets/branding/` and `landing/assets/`.

- Do not redraw or approximate approved logos.
- Do not regenerate approved marks with AI.
- Do not distort proportions or recolor outside approved variants.
- Preserve the established Last Bench green/white/charcoal visual system.

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
- Treat authentication, documents, commissions, student records and AI guidance as high-trust surfaces.
- Surface known gaps rather than hiding them.

### Source-of-truth order

When documentation disagrees:

1. Current code + verified runtime/infrastructure behavior
2. `FOUNDATION_LOCK.md` / `drizzle/MIGRATION_STATUS.md`
3. `README.md`
4. `AGENT.md`
5. `PRODUCT.md` / `design.md`
6. Feature-specific documentation
7. `todo.md`

The active repository is **`lets-colab/LastBenchBd`**.

---

<p align="center">
  <strong>Last Bench</strong><br />
  From uncertainty to a clear next step.
</p>
