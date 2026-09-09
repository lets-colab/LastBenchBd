repo: lets-colab/The-Last-Bench
branch: main
path: (whole repo — read-only source material)

## Last sync
date: 2026-08-19T21:18:04Z

### Updated in this project
- No upstream changes: the repo tree resolves to `b98b24a4a0c3`, identical to the hash recorded at the previous two syncs, so neither screen needed rebuilding.
- Ran the `## Known regression risk` audit after last turn's large landing rewrite (real-Earth globe, 11px type floor, campus rail). All contracts hold: 13 of 13 rotated Λ spans carry `aria-hidden="true"`, 11 `aria-label`s intact, radio still resolves through the four RadioBrowser mirrors, and the single `<iframe>` is the campus Street View card.
- Confirmed the only broadcaster reference is an outbound `<a href>` to syok.my / hitz.com.my / bfm.my in the fallback panel — a link to their own site, not a hardcoded stream URL and not a framed broadcaster page. Compliant; noted here so future audits don't misread the grep hit.
- Verified the pinned map-data chain is unmodified: d3 7.9.0 and topojson-client 3.1.0 with their exact integrity hashes, and the version-pinned `world-atlas@2.0.2/countries-110m.json`. Brand fonts intact, no banned substitutions (Anton/Inter/Roboto), zero labels under 11px.

## Screen map
| Project screen | Built from (repo) |
| --- | --- |
| Malaysia Experience v2.dc.html | `design-system/tokens.json` (colors, type, voice line), `content/CONTENT_OS.md` + `PRODUCT.md` + `AGENTS.md` (brand idea, voice, what not to say), `server/data/malaysia-universities.json` (15 campuses), `assets/branding/*` + `design-system/logo.svg` (Λ wordmark device), `landing/index.html` (previously deployed build of this same landing) |
| Last Bench Dashboard.dc.html | `app/(tabs)/index.tsx`, `app/(tabs)/applications.tsx`, `app/(tabs)/ai-guidance.tsx`, `app/(tabs)/community.tsx`, `drizzle/schema.ts` + `drizzle/0002_ai_guide_personas.sql` (tracker/chat/persona/community shapes) |

## Known regression risk
The Λ-for-A device and the compliant radio chain have now been lost twice to between-turn rewrites of `Malaysia Experience v2.dc.html`. Both are brand/compliance requirements, not styling preferences — audit them after any rewrite:
- `rotate(180deg)` span count in the template should be 13 (some sit inside sc-if branches, so a live DOM count of ~9-10 is normal).
- Every rotated span carries `aria-hidden="true"`; every containing lockup carries an `aria-label` with the true string.
- Radio must resolve stations through the RadioBrowser directory, never hardcoded broadcaster stream URLs, and must never iframe a broadcaster's site. Outbound `<a href>` links to syok.my / hitz.com.my / bfm.my in the fallback panel are fine and expected — do not strip them when a grep for broadcaster names hits.
- The globe's geography must come from the pinned `world-atlas@2.0.2` TopoJSON via d3-geo, with the d3/topojson integrity hashes unaltered. Never hand-draw coastlines; if the fetch fails the correct behaviour is an ocean-only globe.
- No text below 11px anywhere in the landing, and the campus list stays a single scroll rail — a full-viewport grid there hides the flight over the towers.

## Sync history
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
- No commit sha recorded: `github_get_tree` resolves a tree hash (`b98b24a4a0c3`), not a commit, so syncs compare tree/blob hashes rather than `github_compare`.
