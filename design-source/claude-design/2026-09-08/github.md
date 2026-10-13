repo: lets-colab/The-Last-Bench
branch: main
path: (whole repo — read-only source material)

## Last sync
date: 2026-08-22T23:50:24Z

### Updated in this project
- Built `Last Bench Mobile App.dc.html` and then rebuilt its navigation against the repo after a review caught it: the first pass invented a 5-tab IA (Journey/Campuses/Guides/Room/File) from memory. `app/(tabs)/_layout.tsx` is now the source: Home, Applications, Universities, AI Guides, Profile.
- Tab bar matched to the shipped definition — `tabBarActiveTintColor: colors.primary` / `tabBarInactiveTintColor: colors.muted`, height `56 + 12` on web, `paddingTop: 8`, `borderTopWidth: 0.5`, labels `11px/600` with `marginTop: 4`. The invented 3px green indicator strip is gone (Expo `Tabs` renders no such element).
- Icons now use the real Material Icons glyphs that `components/ui/icon-symbol.tsx` maps the SF Symbol names to: `house.fill`→home, `paperplane.fill`→send, `graduationcap.fill`→school, `bubble.left.and.bubble.right.fill`→chat, `person.fill`→person. This also fixes two hand-drawn tab glyphs that were near-identical house outlines.
- Community and Documents moved OFF the tab bar to respect `options={{ href: null }}` on `community`, `messages` and `discover` — both are now deep-linked sheets from Profile → Quick Access.
- App chrome colours rebased on `theme.config.js` (light scheme) via a new `ds/app-theme.css`: background `#FAFAF8`, surface `#ffffff`, border `#E6F2E9`, primary `#00C853`, muted `#6B6F76`. This reverted a previous-turn inversion of mine (sage ground / warm-white cards) that had drifted away from the app's real mapping.
- Applications screen added, previously missing entirely: the 12-status config and `STATUS_ORDER` progress maths are lifted verbatim from `app/(tabs)/applications.tsx`. Its `acceptanceRate` / `visaSuccessRate` stat slots are deliberately NOT populated — inventing those numbers would break the no-fabricated-visa-figures rule, so the card carries a line saying they appear only when a university supplies verified numbers.
- Profile screen added from `app/(tabs)/profile.tsx` (avatar, quick stats, Quick Access, Study Profile, Preferences toggle, version + motto footer).

## Screen map
| Project screen | Built from (repo) |
| --- | --- |
| Malaysia Experience v2.dc.html | `design-system/tokens.json` (colors, type, voice line), `content/CONTENT_OS.md` + `PRODUCT.md` + `AGENTS.md` (brand idea, voice, what not to say), `server/data/malaysia-universities.json` (15 campuses), `assets/branding/*` + `design-system/logo.svg` (Λ wordmark device), `landing/index.html` (previously deployed build of this same landing) |
| Last Bench Mobile App.dc.html | `app/(tabs)/_layout.tsx` (tab IA, titles, tint tokens, bar metrics, `href: null` hiding), `components/ui/icon-symbol.tsx` (SF Symbol → Material Icons mapping), `components/haptic-tab.tsx`, `hooks/use-colors.ts` + `lib/_core/theme.ts` + `theme.config.js` (light-scheme palette), `app/(tabs)/applications.tsx` (status config, progress order, card layout), `app/(tabs)/profile.tsx` (header, quick stats, sections), `server/data/malaysia-universities.json` (15 campuses) |
| Last Bench Dashboard.dc.html | `app/(tabs)/index.tsx`, `app/(tabs)/applications.tsx`, `app/(tabs)/ai-guidance.tsx`, `app/(tabs)/community.tsx`, `drizzle/schema.ts` + `drizzle/0002_ai_guide_personas.sql` (tracker/chat/persona/community shapes) |

## Known regression risk
The Λ-for-A device and the compliant radio chain have now been lost twice to between-turn rewrites of `Malaysia Experience v2.dc.html`. Both are brand/compliance requirements, not styling preferences — audit them after any rewrite:
- `rotate(180deg)` span count in the template should be 13 (some sit inside sc-if branches, so a live DOM count of ~9-10 is normal).
- Every rotated span carries `aria-hidden="true"`; every containing lockup carries an `aria-label` with the true string.
- Radio must resolve stations through the RadioBrowser directory, never hardcoded broadcaster stream URLs, and must never iframe a broadcaster's site. Outbound `<a href>` links to syok.my / hitz.com.my / bfm.my in the fallback panel are fine and expected — do not strip them when a grep for broadcaster names hits.
- The globe's geography must come from the pinned `world-atlas@2.0.2` TopoJSON via d3-geo, with the d3/topojson integrity hashes unaltered. Never hand-draw coastlines; if the fetch fails the correct behaviour is an ocean-only globe.
- No text below 11px anywhere in the landing, and the campus list stays a single scroll rail — a full-viewport grid there hides the flight over the towers.
- `Last Bench Mobile App.dc.html` must keep the five shipped tabs from `app/(tabs)/_layout.tsx` (Home, Applications, Universities, AI Guides, Profile) with `colors.primary` as the active tint. Community, Messages and Discover are `href: null` in the real app — never promote them to tabs. There is no `documents.tsx` in `app/`, so the document checklist is a Profile sheet by decision, not by discovery.
- App-chrome colour comes from `theme.config.js` via `ds/app-theme.css` (background #FAFAF8, surface #ffffff, border #E6F2E9). Do not re-invert ground and surface: pure white IS the app's surface token, even though the landing never uses it.

## Sync history
- 2026-08-19T21:18:04Z — no upstream changes; brand/compliance regression audit after the landing rewrite.
- 2026-08-19T21:10:33Z — no upstream changes; globe rebuilt on real Natural Earth geometry, 11px type floor applied, campus grid became a scroll rail.
- 2026-08-19T10:25:27Z — no upstream changes; brand/compliance regression audit, rotated-Λ span count revised to 13.
- 2026-08-16T19:24:06Z — no upstream changes; Dhaka departure scene built, repo voice lines placed verbatim, duplicate KL headline and 90vh gap cut, night grade/fog fixed.
- 2026-08-14T13:35:24Z — no upstream changes; dashboard discover kicker corrected to fifteen campuses; landing render-tick syntax error fixed.
- 2026-08-13T08:55:50Z — no upstream changes; landing ground chapters rebuilt on real Street View panoramas, LOOK AROUND lever added, HITZ FM fallback panel finished.
- 2026-08-13T01:07:20Z — no upstream changes; fixed stale "FIVE CAMPUSES" kicker on the dashboard and a duplicate `const d` syntax fault in the landing render tick.
- 2026-08-10T12:49:31Z — no upstream changes; founder figures rebuilt in the KLCC Park scene, city traffic and pedestrians added, radio locked to HITZ FM only, dashboard aligned to brand tokens with all 15 campuses.
- 2026-08-10T03:23:15Z — bench finale map removed in favour of a pin link (3.1553° N, 101.7145° E); live Google embeds restricted to university cards; founders reduced to names, titles and mandates.
- 2026-08-04T21:28:47Z — brand fonts (General Sans + Sora) and Λ device applied; university section rebuilt from `server/data/malaysia-universities.json` (15 campuses); founder cards reduced to verified titles and mandates.

## Notes
- `landing/` and `dist/` in the repo are a previously exported build of this landing design. Treat the DC files in this project as the source of truth going forward; re-export to `landing/` when publishing.
- Brand tokens define **General Sans** (Fontshare) and **Sora** (Google Fonts). Do not substitute Anton, Inter, or Roboto.
- Brand colors in use: #00C853 brandGreen, #00E676 on dark, #111111 charcoal, #FAFAF8 warmWhite, #E6F2E9 sageGreen, #6B6F76 gray.
- Voice rule from tokens.json: short declarative pairs with full stops as beats; exactly one phrase per headline turns brand green.
- Λ-for-A is rendered as a rotated in-family `V`, `aria-hidden`, with an `aria-label` carrying the true string on each lockup. Keep both halves of that contract when editing display type.
- Still not in the repo, so still placeholders here: approved founder portraits (no photos under `assets/`), and exact Street View coordinates — the dataset carries no lat/lng field, so UiTM, HELP, UoC, Lincoln, MSU and Limkokwing pins remain campus-vicinity approximations.
- `app/` has no `documents` route and `profile.tsx`'s header uses `bg-gradient-to-b from-primary to-blue-600` — blue-600 is not in the brand kit, so the mobile design uses a flat brand-green header instead. Worth resolving upstream.
- No commit sha recorded: `github_get_tree` resolves a tree hash (`b98b24a4a0c3`), not a commit, so syncs compare tree/blob hashes rather than `github_compare`.
