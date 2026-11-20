# Last Bench release verification — 20 November 2026

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

## Evidence

- UI repair: https://github.com/lets-colab/LastBenchBd/pull/194
- Final web deployment: https://github.com/lets-colab/LastBenchBd/actions/runs/44735383811
- Final main CI: https://github.com/lets-colab/LastBenchBd/actions/runs/44735383837
- Final Android verification: https://github.com/lets-colab/LastBenchBd/actions/runs/44735457955
- Final Android EAS build: https://expo.dev/accounts/lastbenchbd/projects/llstbench-bd/builds/2f317dea-3f31-4428-af78-a9278b5abf60
- Android App Bundle URL emitted by EAS (download access unverified): https://expo.dev/artifacts/eas/ghWlgkf4p34AcbuSU-lyFvz3XVO19CG97fLjxqGIKMY.aab
- Fresh iOS signing failure: https://github.com/lets-colab/LastBenchBd/actions/runs/44730365665
