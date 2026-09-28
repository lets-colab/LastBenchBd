# Last Bench mobile store release

Status: PREPARED / BLOCKED — no signed build, store submission or public listing verified.

Request: publish the existing Last Bench app on Google Play and Apple's App Store, synchronized with the existing platform.

## Release baseline — 28 September 2026

Inspected source: `73a9d0ee64521bf715343cc1546ca75572ee805d` in `lets-colab/LastBenchBd`.

- Existing Expo 54 / React Native app shares `app/`, `lib/`, `shared/` and the Render API with the web app.
- Existing identity is `com.app.lastbenchmobile` on both platforms. Preserve it until actual store records establish whether it is already registered or released.
- Native authentication uses Supabase sessions in Expo SecureStore. This is source evidence, not a successful device login test.
- No `eas.json` existed at inspection. The new production profile copies the public API and Supabase configuration from the canonical GitHub Pages workflow. `mobile:preflight` detects configuration drift. EAS runs this check and the existing brand check after dependency installation, refusing a build while configuration blockers remain.
- App display name is now `Last Bench`. `lastbench` is the primary URL scheme; `manuslastbenchmobile` is retained for compatibility with installed links. No verified universal/app-link association is claimed.
- Google Play opened a signed-out account chooser. App Store Connect opened its login screen. Membership, app records, signing assets and publishing permissions have not been verified.
- No Expo or store publishing credential was present in the checked execution environment.
- Configured app and adaptive foreground icons are 1408 × 768, not square. They are not certified as approved mobile exports. Do not ship them or invent replacement artwork.
- Repository foundation records still leave authenticated journeys and document uploads uncertified. A source search found no account-deletion flow or privacy screen; a full store privacy audit remains required.

## Validation during preparation

- Live `https://api.lastbenchbd.com/api/health` returned `ok: true`, auth/storage configured and `aiConfigured: false` with `degraded: true`. Core API reachability is verified; Dr. X AI availability and authenticated data synchronization are not.
- TypeScript completed successfully.
- Canonical repository logo fingerprint checks passed; this does not certify the separate native icon exports.
- `mobile:preflight` correctly refused release configuration because Expo ownership/project binding and square mobile assets are missing.
- `expo install --check` reported native dependency drift, notably `react-native-gesture-handler` 3.2.1 versus Expo's expected ~2.28.0, plus Expo/Constants/navigation version differences. Resolve and device-test this before store builds; it is not fixed in this preparation branch.

## Prepared build path

1. Sign into the existing Last Bench Expo account and inspect its projects before creating anything. Bind the actual owner using `EXPO_ACCOUNT_OWNER` and its exact UUID using `EAS_PROJECT_ID` in the build environment. These identifiers are configuration, not credentials. Do not invent them.
2. Verify Google Play / Apple app records and signing ownership against `com.app.lastbenchmobile` before the first build. Reuse signing credentials for any existing application.
3. Resolve the latest approved logo and make reviewed platform icon/splash exports without redrawing or recoloring it. Meet the stores' format requirements while preserving the artwork.
4. Install the pinned package manager/dependencies and run:

   ```sh
   pnpm install --frozen-lockfile
   pnpm mobile:preflight
   pnpm design:check
   pnpm check
   pnpm test
   ```

5. Verify the current Expo/native dependency compatibility and current Android/iOS submission requirements before signing. Export success alone does not certify a native compilation.
6. With approved signing access and available build quota, build the exact reviewed commit:

   ```sh
   eas build --platform all --profile production
   ```

7. Install via Google Play internal testing and TestFlight. Verify sign-in, restart/refresh, user-scoped API access, sanitized application updates, offline/error handling, logout invalidation and same-user web/mobile data consistency. Certify upload authorization if uploads are exposed. Keep staff-only data protected.
8. Prepare actual device screenshots, truthful descriptions, age/content ratings, privacy disclosures, a reachable privacy policy and account-deletion flow, review access, support details and any applicable account testing requirements. Do not advertise unfinished capabilities.
9. Submit the exact tested build IDs. The Android submission profile targets an internal **draft**. Apple upload alone does not submit for App Review. Complete each console's release/review steps after the device gates pass.
10. Verify store status and actual public listing URLs after approval. Only then report published.

## Synchronization boundary

Both mobile platforms use the same existing API and Supabase project as the web deployment. Server-side data updates should appear when clients fetch fresh data; this must be tested on a real account. Native UI updates still require an app release. No over-the-air update service or new database was introduced. Slack, HubSpot and Notion synchronization is not established by this configuration.

## Protected invariants and rollback

Preserve existing routes, roles, authorization, database schema, canonical logo assets and application IDs. Do not merge this draft until blockers are resolved. No live site, API, database, signing identity or store listing is changed by this branch. Reverting its commit removes the preparation.

## References checked

- https://docs.expo.dev/build/eas-json/
- https://docs.expo.dev/submit/android/
- https://docs.expo.dev/submit/ios/
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app
