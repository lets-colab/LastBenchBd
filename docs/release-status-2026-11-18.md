# Last Bench release status — 18 November 2026

This is a dated verification record, not a production acceptance certificate. Checked production source: `lets-colab/LastBenchBd@102ce7d45a50aa00abae8ddde6fdb288cbec1ad8`. Checked decision source: `lets-colab/Dr.X@4fc992c`.

| Item | Current evidence | Remaining work |
| --- | --- | --- |
| Website hosting | GitHub Pages configuration uses `lastbenchbd.com`; deployment `7814224261` succeeded on 16 November for `102ce7d`. Fresh requests to `/` and `/app/` returned HTTP 200. | Authenticated journeys and current visual fidelity remain separate acceptance checks. |
| Netlify cleanup | GitHub Pages is the canonical web host. Netlify preview statuses were still created for PR #184 on 10 November. Repository webhook inspection returns HTTP 403 for the current integration. | An authorized account owner must verify and remove remaining Netlify site/build hooks or GitHub app access scoped to Last Bench. Do not claim account cleanup from the absence of recent checks. |
| Backend replacement | Fresh DNS lookup still resolves `api.lastbenchbd.com` to `last-bench-api-v2.onrender.com`. A fresh `/api/health` request timed out. | Validate the approved replacement in staging, including session/auth, administrator denial, DB transport, CORS/rate limits and rollback, before a separately approved cutover. A timeout does not establish a root cause. |
| Mobile/UI repairs | PR #185 merged into `fix/mobile-eas-project-slug`, not `main`. PR #184 remains open and had dependency conflicts with current main. This reconciliation preserves its authentication accessibility, recovery, Expo project identity and SDK 54 fixes, together with main's unrelated changes. | Pass refreshed checks and merge the reviewed PR before calling the repairs production-deployed. |
| Native release | Android production build run `42340978893` succeeded for `e33e01f`; its artifact predates subsequent UI changes. The all-platform run `42340343053` stopped at missing iOS signing credentials. No newer mobile workflow run was found. | Configure iOS signing, build the exact final release commit on both platforms, perform device/authenticated QA, and verify store submission separately. No iOS/store completion is established. |

## Latest directions supported by retrieved sources

- Retire Render and Netlify as Last Bench targets. Keep GitHub Pages for static web, Supabase for Auth/data, and Cloudflare for DNS/edge. A backend candidate is not an approved or verified production replacement. Preserve continuity and rollback until cutover acceptance; no new paid service is authorized. See `FOUNDATION_LOCK.md` and `docs/cloudflare-api-cutover-gate.md`.
- Last Bench is the parent company. CLASS[Λ] is the Human Lab; co.lab is the Business Lab with Ventures, Projects, Services and Community; Co.MPASS is the business dashboard/evidence convergence layer; Dr. X is the founder intelligence layer. Education & Mobility remains a service domain, not the definition of the company. Source: `Dr.X/projects/last-bench.md`.
- Rafsun's finance/investor work stays within the shared governed intelligence architecture. External disclosures, capital commitments, payments and binding decisions retain their approval boundaries. The October 5 investor-state record is historical, not fresh traction evidence. Source: `Dr.X/decisions/last-bench-finance-investors-rafsun-2026-10-05.md`.
- Keep Last Bench and CLASS[Λ] design namespaces separate and preserve approved brand assets. The retrieved Claude snapshot is a user export; the registry still records live Claude Design OAuth as pending. It does not establish a newer private Claude revision or the creating model. Source: `Dr.X/integrations/claude-design/BRAND_REGISTRY.yaml`.
- The five linked ChatGPT conversations (Co.MPASS, DR.X engineering, Rafsun, Co.Lab operations and CLASS[Λ]) have empty previews and no available `read_thread` tool here. Their contents were not read. Later decisions inside those chats must be supplied before this record can claim to include them.

## Work completed in this reconciliation

- Resolve PR #184's dependency conflicts without discarding its merged UI fixes or unrelated main changes.
- Preserve SDK 54-compatible native packages; retain main's CSS interop patch after validation.
- Add Expo compatibility validation to ordinary PR CI as well as the existing mobile workflow, so incompatible native upgrades fail before release.
- Refresh the release status and clarify that a closed historical smoke issue is not proof of backend retirement.

Local verification passed: 107 tests across 23 files; type checking; Expo SDK compatibility; design/brand checks; full lint with zero errors and three existing warnings; complete web export with 25 verified local asset references; and patch integrity. This is source/build validation, not a new native artifact or authenticated production acceptance.

Production DNS, Netlify configuration, database state and store publication are unchanged by this reconciliation. No Cloudflare, Supabase, Netlify or Expo credential binding is present in this cloud process; GitHub's mobile workflow has separate Expo authentication, confirmed by its earlier successful build. Do not request or duplicate credentials merely because they are unavailable locally.

## Evidence

- Repair PR: https://github.com/lets-colab/LastBenchBd/pull/184
- UI PR: https://github.com/lets-colab/LastBenchBd/pull/185
- Web deployment: https://api.github.com/repos/lets-colab/LastBenchBd/deployments/7814224261/statuses
- Verified Android build: https://github.com/lets-colab/LastBenchBd/actions/runs/42340978893
- iOS signing failure: https://github.com/lets-colab/LastBenchBd/actions/runs/42340343053
- Historical issue #173 is closed; its closure is not migration acceptance: https://github.com/lets-colab/LastBenchBd/issues/173
