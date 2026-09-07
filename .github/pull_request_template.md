## What changed

<!-- Describe the user-visible and system-level change. -->

## Source of truth

- [ ] I checked `README.md` / `AGENT.md` for current architecture and release rules.
- [ ] I did not use a stale PR or branch as canonical product truth.
- [ ] Product, pricing, role, university, visa, scholarship, or commission claims are verified or explicitly marked unverified.

## Trust / privacy / authorization

- [ ] No student PII, session token, OAuth code, API key, secret, document URL, or raw sensitive prompt is added to logs.
- [ ] New data access is ownership/role checked on the server.
- [ ] Student responses do not expose internal notes or unverified operational fields.
- [ ] New state-changing flows have abuse/rate-limit/CSRF implications reviewed.

## Database

- [ ] No production database mutation happens automatically at application startup.
- [ ] Schema changes have a reviewed migration.
- [ ] I ran/reviewed the database foundation preflight before adding uniqueness/foreign-key constraints.
- [ ] Destructive or data-cleaning migration steps are explicitly called out.

## Verification

- [ ] `pnpm check`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm audit --prod --audit-level critical`
- [ ] `pnpm build`
- [ ] `pnpm build:web:production` when web/build behavior changes
- [ ] Relevant route/UI behavior was rendered and visually inspected

## Production release gate

<!-- Mark N/A if this PR cannot affect production runtime. -->

- [ ] Real production environment values are configured outside the repo where required.
- [ ] Fresh login / returning session / logout tested when auth changes.
- [ ] At least one authenticated API request tested when backend changes.
- [ ] Netlify forms tested when conversion forms change.
- [ ] Database migration status explicitly verified when schema changes.

## Known gaps

<!-- List remaining uncertainty. Do not convert unknowns into "done" statements. -->
