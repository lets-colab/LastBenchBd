# Current Last Bench release verification

## 22 November 2026 — verified scoped website release

**State: scoped website deployed and verified live at https://lastbenchbd.com/.** Released source: `1b7e441b590782aa0cd333bf3f7a01974d5d0f64` (PR #196). The full cinematic, authenticated LMS and realtime twin brief remains incomplete. This section supersedes the dated status below for this website task. It does not certify the full cinematic/LMS/twin brief.

| Gate | Observed state |
| --- | --- |
| Existing production | Pages run `45044226485` deployed `1b7e441b590782aa0cd333bf3f7a01974d5d0f64`. Fresh browser contexts verified that SHA on all seven desktop/phone page cases. All 112 publicly indexed files independently match the immutable GitHub artifact. Authenticated admissions and actual enquiry delivery remain unverified without approved smoke identities. |
| Rollback | Full 112-file artifact preserved locally with SHA-256 manifest and a ZIP; original artifact expires 27 November. Recovery must use the artifact/source above, not default `main`. Monitoring resolves the active successful Pages deployment receipt, including older workflow reruns, and checks out that source’s smoke contract. Integrity failures feed the existing incident reporter. |
| Scoped website changes | Verified live: direct navigation, ordered mobile choices, public source atlas, Business Lab/public Co.MPASS overview, Work clearance boundary, public-only Dr. X guide, privacy-preserving city-map action and observed contrast repairs. No production database changes or new private records. |
| Cinematic entry | BLOCKED: `48834.png`, named scene/decision/video archives and exact white-logo master unavailable. Current approved artwork/marks retained; no new approach shot or 30 fps hardware result claimed. |
| CLASS learner acceptance | BLOCKED: complete original portal references, approved content/rubrics, enrollment mapping, secure learner/reviewer identities and actual human review unavailable. No new proof backend or fictional progress is published. Existing admissions sign-in is preserved; it is not presented as the new CLASS portal. |
| Public evidence | Atlas uses existing first-party public programme/journey sources. No new client clearance is available; Work lists no client cases. Project X remains withheld. No private Cortex data is loaded. |
| Profile and maps | Exact outgoing People/Map URLs retained. Plain HTTP clients returned 403, but fresh Chromium contexts loaded both domains with HTTP 200. Profile title, visible portrait, CV/proof links and original portrait resources were baselined. The map fixture separately verifies URL/referrer/opener isolation, not spatial-map functionality. |
| Voice and avatar | Readable public profile HTML, JavaScript, knowledge projection, styles, CV/proof pages and four portrait assets were recovered with checksums. This is a public-production snapshot, not an authenticated Sites export or source-equivalence certificate. The current profile provides curated answers and optional device read-aloud/on-device AI; live voice/avatar acceptance and verified realtime entitlement remain unproven. No realtime, voice, microphone or avatar session was activated. Profile deployment authority remains separate. |
| Profile text guide | Existing curated-guide answer matched the published `capabilities` knowledge entry with its CV source label; zero network attempts during the question. This is deterministic retrieval, not generative inference. No audible voice, microphone or speaking-avatar session was tested. |
| Quality observations | Final live browser checks passed at 390×844 and 1440×1000 emulation: correct source SHA, ordered choices, 44px primary targets, route links, no overflow, guide Escape/focus return, sign-in mode switching, on-demand map privacy and zero observed automated WCAG violations/page errors. Synthetic loading/503/401 checks passed without real authentication or data writes. Offline hard reload is unavailable; returning online recovered the page. Physical OPPO A78 performance, actual screen reader and human five-second choice are UNOBSERVED. |
| Separate work | Native beta/signing/stores, five-phase learner brain, YouTube learning, Lovable Skill Builder, broader integrations, Netlify cleanup and Render retirement stay outside this release. The initial plain-HTTP health probe timed out, but final production smoke passed custom API health 200, Render-origin health 200 and anonymous admin denial 403. Database-backed learner acceptance remains separate; prior data-query failures are not declared repaired. |

PROXY sequence remains **Erfan public example first → learner-owned template later**, with **Enroll → Learn → Build → Publish PROXY**, an opt-in shareable AI-builder profile and Join CLASS[Λ] entry. Coursework stays private by default.

Pinned audit executed **CLI 4.9.2 / engine 0.1.28+engine**, official engine SHA-256 `bf0524d3b44a199953d70ba10548ba48c5ab50d6ad260eeaa84ed8945c10a721`. The final source scan has **219 findings**: reviewed exact fingerprints classify **P0 0 / P1 0 / P2 144 / P3 75 for this scoped release**. P2 includes existing readability/static-model findings needing further rendered review; P3 retains source/brand-intent styling findings. This is not a site-wide accessibility or full-brief acceptance claim. Unreviewed fingerprints, occurrence growth, inconsistent detector exit/results, operational failures, malformed reports and version mismatches now fail the audit job.

Local verification: **127 tests passed**, types and canonical design/brand/boundary checks passed. Lint has zero errors and three pre-existing `server/_core/llm.ts` warnings. Rendered entry, public routes, Malaysia and sign-in checks passed after fixing observed contrast failures. Operator Markdown and source archives are excluded from the public artifact; originals stay in Git. The public integrity index excludes uncleared showcase paths; a separate full inventory stays in CI. Existing concept URLs are not newly listed in Work or the public index.

The [source inventory](website-reference-inventory-2026-11-22.json) records missing originals and exact recovered-Claude duplicate hashes. Source roles remain: homepage master → Gemini CLASS structure → historical Claude admissions design → supporting handoff boards. Existing canonical production marks remain unchanged.

**Required owner handoff:** one accessible approved release-source index/bundle with the missing originals/publication clearances and secure environment references for approved learner/reviewer smoke identities, named human reviewer and any existing free realtime entitlement. Credentials must stay in the authorized secret store/environment. No ChatGPT Space access or synchronization is claimed.

### Final receipts

- Website: https://lastbenchbd.com/
- Released commit: `1b7e441b590782aa0cd333bf3f7a01974d5d0f64`; rollback commit: `84306e12a7bba8b1c439bf61e43732683b8f163e`.
- Merge: https://github.com/lets-colab/LastBenchBd/pull/196
- Main CI: https://github.com/lets-colab/LastBenchBd/actions/runs/45044226512
- Pages build/deploy: https://github.com/lets-colab/LastBenchBd/actions/runs/45044226485
- Production source/integrity and functional smoke: https://github.com/lets-colab/LastBenchBd/actions/runs/45044370840
- Pinned Impeccable: https://github.com/lets-colab/LastBenchBd/actions/runs/45044226499
- CodeQL: https://github.com/lets-colab/LastBenchBd/actions/runs/45044226492
- Public manifest SHA-256: `3cf0fc7aa3dd4c69e602935236eb84fc984137f3135ec19188e2360bf37b88b1`.
- Full artifact inventory SHA-256 (private inventory retained in CI): `d6d94502d4a3f31868ef9ed9738924af985100358116ceac9987cab309ef76a3`.

Fresh live browser and independent managed-HTTPS hash verification passed. Local direct Node fetch was refused by the execution environment; the production GitHub Node verifier passed and Python HTTPS independently verified the same artifact. No rollback was needed. The preserved 112-file known-good artifact passed checksum and local restoration checks, including original choices and sign-in controls.

Workspace evidence: `/workspace/release-evidence/2026-11-22/`. `release-receipt.json` classifies each observed/unobserved outcome; `live-home-390.png`, `live-home-1440.png` and the other route screenshots show the served revision. `website-1b7e441-verification.zip` contains receipts/screenshots/logs; `rollback-84306e1.zip` preserves the known-good artifact. A GitHub upload attempt returned HTTP 401 at the upload host; its empty task-created draft was removed. No claim is made that those ZIPs were uploaded. GitHub workflow receipts and immutable build/audit/smoke artifacts remain available under the runs above; retention is time-limited.

Workspace archive SHA-256:

- `website-1b7e441-verification.zip`: `0a6997207c7b7b1303910e4881c45ead276774e78f7b76aee8b49276a22aa88c`.
- `rollback-84306e1.zip`: `cecc75c172850c86db939549c67a83145da8df523602873d082e3b83d3d40ce1`.

### Recovery procedure

Cancel an in-flight bad Pages rollout before restoring. Rerun the known-good workflow run `44735383811` through the existing GitHub Actions workflow, or restore the preserved exact artifact through the same Pages deployment mechanism. Verify source `84306e1`, homepage SHA-256 `cbe29377e92f029124d477d6a07ae6242de7ef0cbd2e0976d77227071f60fbf3`, and admissions/sign-in/deep-link recovery. No database rollback is needed for this scoped release. A local restoration rehearsal is recorded separately from an actual production rollback.

## Historical verification — 20 November 2026


Application source: `84306e12a7bba8b1c439bf61e43732683b8f163e`. This updates the 18 November status; it is not a complete product or store acceptance certificate.

| Item | Verified outcome | Remaining gate |
| --- | --- | --- |
| Website hosting | GitHub Pages rollout `44735383811` passed for the application source above. Canonical `https://lastbenchbd.com/app/auth/` was tested in Chromium at 390×844 and 1440×1000. | Authenticated production journeys and native-device behavior are not covered by these browser checks. |
| Netlify cleanup | Preview integrations remain active. A fresh webhook-read attempt still returns HTTP 403 with the available GitHub integration. | Account owner must remove the Last Bench Netlify connections without disrupting unrelated sites, then verify new commits stop triggering previews. |
| Backend replacement | Current API DNS still targets `last-bench-api-v2.onrender.com`. Health returned HTTP 200, `ok=true`, `degraded=true`; Auth/storage report configured and AI unconfigured. | Staged replacement, authenticated/DB acceptance and separately approved cutover remain incomplete. `cohort.getAll` and `skill.getAll` independently returned HTTP 500 / INTERNAL_SERVER_ERROR with database-query errors; their underlying cause is not verified. |
| Mobile/UI repairs | PR #184 merged at `a182105f`; PR #192 fixed Pages font packaging; PR #193 made native production client configuration explicit; PR #194 merged at the application source above and restored the styled accessible sign-in controls. | Deployed browser behavior does not certify the complete student product. |
| Native release | Final-source Android run `44735457955` succeeded and emitted an App Bundle; EAS incremented Android versionCode to 7. Previous successful Android runs predate the final UI repair. iOS run `44730365665` failed at signing setup. | iOS account-owner signing, the same final source on both platforms, installed-device/authenticated QA, and store submission remain separate gates. Artifact download here returned HTTP 403, so independent binary inspection is unverified. |

## Repairs and observed checks

- Original release source and accessibility repairs are now on `main`; the prior branch-only status is superseded.
- Official Pages v5 upload defaults excluded hidden `.pnpm` directories containing exported fonts. The before-fix archive reproduction omitted the Anton font; after enabling hidden files for both artifact uploads, all seven exported TTFs were byte-verified. Public-output inspection found only Expo assets and the existing empty image-slot state among hidden files. The previously missing live font returned HTTP 200 after rollout.
- The EAS production profile now explicitly includes the reviewed public API/Supabase configuration. Its `sb_publishable_` client value is public configuration, not an Apple/server credential. The regression failed before repair. Server and signing secrets were not added.
- A visual check caught a semantically accessible sign-in control rendered as a transparent 24px button. Using the app's existing TouchableOpacity pattern restored the green background and touch-target size without removing button roles, busy state or handlers. The same visual assertions passed locally and on the live site after deployment.
- Full source validation passed 108 tests, type checking, focused lint, and web export. PR #194 CI/CodeQL and final-main CI `44735383837` passed. Existing lint warnings remain in `server/_core/llm.ts`.
- Live browser checks passed: Email/Password accessible labels, sign-in button role, green primary action and at least 44px target, no horizontal overflow at mobile width, create-account/sign-in mode switching, and Enter-key sign-in recovery from Discover. No page errors were observed in the final check. Backend HTTP 500 responses remain known failures despite these UI passes.
- No production account was created or authenticated for QA. No installed Android/iOS test or store submission was performed.
- Final Android workflow validation and EAS build both passed for `84306e1`; the logs confirm all three reviewed public client configuration names loaded from the production profile and `AUTO_SUBMIT=false`. The App Bundle is a Play Console candidate, not a directly installable APK or evidence of store publication. The emitted artifact URL could not be downloaded in this environment (HTTP 403); no checksum or compiled-bundle configuration inspection is claimed.

## Scope, direction and access

Continue the recorded direction: GitHub Pages for web, Supabase for Auth/data, Cloudflare for DNS/edge; retire Netlify and legacy Render only with scoped cleanup and verified replacement/rollback. The legacy runtime is an observed current route, not the future hosting recommendation. These releases do not authorize paid services, production DB mutations or an unvalidated DNS cutover.

GitHub access failed during the earlier session and was restored on resume; final PR and run verification was repeated. Five referenced private conversations still have empty previews and no available `read_thread` tool. No unseen conversation decision or newer private AI Studio/Claude source is claimed to be incorporated.

GitHub's push response also reported 98 default-branch dependency alerts (50 high, 38 moderate, 10 low). Advisory inspection through the current integration returned HTTP 403, so these reported counts have not been independently triaged for current packages or runtime exposure. Dependency security review remains an acceptance item.

## Evidence

- UI repair: https://github.com/lets-colab/LastBenchBd/pull/194
- Final web deployment: https://github.com/lets-colab/LastBenchBd/actions/runs/44735383811
- Final main CI: https://github.com/lets-colab/LastBenchBd/actions/runs/44735383837
- Final Android verification: https://github.com/lets-colab/LastBenchBd/actions/runs/44735457955
- Final Android EAS build: https://expo.dev/accounts/lastbenchbd/projects/llstbench-bd/builds/2f317dea-3f31-4428-af78-a9278b5abf60
- Android App Bundle URL emitted by EAS (download access unverified): https://expo.dev/artifacts/eas/ghWlgkf4p34AcbuSU-lyFvz3XVO19CG97fLjxqGIKMY.aab
- Fresh iOS signing failure: https://github.com/lets-colab/LastBenchBd/actions/runs/44730365665
