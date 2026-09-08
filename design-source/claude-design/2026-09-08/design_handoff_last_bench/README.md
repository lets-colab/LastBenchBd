# Handoff: Last Bench — Cinematic Malaysia Experience + Student Dashboard

## Overview
Two connected surfaces for **The Last Bench** (`lets-colab/The-Last-Bench`) — a transparent student accelerator guiding students from Bangladesh into Malaysian universities:

1. **Malaysia Experience v2** — a scroll-driven cinematic landing: a WebGL flight over Kuala Lumpur (Three.js) through five chapters, ending at a clean, unobstructed bench in KLCC Park. Entry gate (language + optional live radio), 15 university campuses with Street View 360, founder mandates, sign-up.
2. **Last Bench Dashboard** — the post-signup app prototype: journey tracker, university discovery with Street View campus visits, live Claude-backed AI guide chats, community feed, document tracker.

## About the Design Files
These files are **design references created in HTML** — working prototypes showing intended look and behavior, NOT production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (the repo is an Expo/React Native app; the landing is web — Next.js/React recommended) using its established patterns. The `.dc.html` files open directly in a browser (keep `support.js`, `image-slot.js` and `assets/` beside them).

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy and interactions are final design intent. Recreate pixel-perfectly.

## Brand rules (non-negotiable)
- **Λ replaces the letter A in all display type.** Implemented as a 180°-rotated `V` in the same font with `translateY(0.052em)` so it sits on the baseline and matches weight/cap-height exactly — do NOT substitute a Greek lambda glyph from another family. Every rotated `V` is `aria-hidden="true"` and the containing element carries an `aria-label` with the true string (e.g. `aria-label="LAST BENCH"`) so screen readers and find-in-page get real words.
- **Fonts are fixed by `design-system/tokens.json`:** display **General Sans** (Fontshare, 400–700), body/UI **Sora** (Google Fonts), Bangla **Hind Siliguri** (Google Fonts). Never substitute Anton, Inter or Roboto.
- **Voice:** short declarative pairs with full stops as beats. Exactly one phrase per headline turns brand green.
- **No invented facts.** Never state fees, visa/acceptance rates, processing times, partners, testimonials or guarantees that are not in the repo dataset. All numbers carry the "planning estimates, not quotes or guarantees" disclaimer.

## Design Tokens
- Landing base background: `#070b16`; dashboard base: `#04140B`
- Panel surface: `rgba(5,16,10,.55–.82)` + `backdrop-filter: blur(10–16px)`, border `1px solid rgba(0,200,83,.22–.4)`, radius 14–24px
- Primary green `#00C853`; bright green (accents/glows) `#00E676`; amber (pending/secondary) `#FFB300`
- Body text `#F2F7F3`, dimmed `rgba(242,247,243,.42–.85)`; text on green fill `#04140b`
- Kickers/labels: 9–11px, weight 600, letter-spacing .18–.3em, uppercase
- Display headings: weight 700, letter-spacing `-.02em`, `clamp()`-scaled
- Pills/buttons: radius 999px; primary = green fill + `box-shadow: 0 0 34px rgba(0,200,83,.5)`
- Focus ring: `2px solid #00E676`, offset 2px, on every interactive element
- Minimum touch target: 44px (48–52px on primary CTAs)

## Screens / Views

### 0. Entry gate (landing, before anything else)
Full-screen overlay on `#040a08` with radial green/amber washes. Centered: the Last Bench favicon inside two counter-rotating rings (1.15s clockwise, 2.4s counter), `LΛST BENCH` wordmark, heading, sub. Card contains: **language choice** (English / বাংলা, 48px targets) and an **optional live-radio toggle** (off by default), then "Enter the experience". Scrolls internally on short viewports; body scroll is locked until entry.
- **Audio is strictly opt-in.** Nothing plays before the user acts.

### 1. Malaysia Experience (landing)
Fixed full-viewport Three.js canvas; DOM sections scroll above it (z-index 2). Scroll progress `p` (0–1) drives a keyframed camera flight. Chapters: **01 Kuala Lumpur** (monsoon rain, skyline) → **02 Jalan Alor** (night market, neon) → **03 Above the Towers** (452m, university grid) → **04 KLCC Park** (pre-dawn → warm daylight, kinetic lockup) → **05 Take your seat**.
- **HUD**: logo-icon + `LΛST BENCH`; right: sound/radio pill and chapter label (hidden under 760px); 2px green scroll-progress line.
- **Camera**: keyframed path; pointer / device-tilt adds damped look-around (smoothed at `dt*3.5`, recenters on mouseleave/blur).
- **Radio (live)**: queries the RadioBrowser directory (4 mirrors, 6s timeout each) for online Malaysian stations, prefers majors (HITZ, ERA, Fly, Hot, MY, BFM, Sinar…), tries up to 12 HTTPS streams in turn with `hls.js` for `.m3u8`, and shows the real station name in the HUD. Falls back to **synthesized WebAudio ambience** (brown-noise city hum, band-passed rain tied to rain intensity, market murmur peaking at p≈0.32, 52Hz drone, bird chirps after p>0.78) only if every stream fails — and labels itself honestly as AMBIENCE, never as a live station.
- **Universities**: all 15 campuses from `server/data/malaysia-universities.json`. Card shows short name, type, city, total/yr (USD), IELTS, intakes. Click/Enter → **fast-travel**: full-screen warp overlay (radial speed lines, sonar rings) → arrival panel with campus image, name, **Google Street View 360 iframe** (`https://maps.google.com/maps?layer=c&cbll=<lat>,<lng>&cbp=12,<heading>,,0,0&output=svembed`), stats (USD + BDT, IELTS, EMGS category, processing weeks, grade requirement), program line, and an "official details" link out. Escape closes.
- **Act 4 — kinetic brand lockup**: `BEYOND` stays fixed while `MΛRKS → GRΛDES → LIMITS → BORDERS → YOURSELF` morph one at a time (1.45s dwell, 3D flip on the x-axis), then resolve to `CREΛTING Λ LΛSTING BENCHMΛRK.` and loop. Reduced-motion slows dwell to 2s and drops the transforms. There is **no rotating wordmark and no spinning bench**.
- **Act 4 bench**: the bench is empty and unobstructed by design — a warm seat glow marks the place kept for the visitor. A single small pin link opens the real KLCC Park location (`3.1553° N, 101.7145° E`). No map, no mirror box.
- **Act 5 founders + sign-up**: three founder cards (3:4 portrait in a 2px green→amber gradient ring, name, short role). Click/Enter → modal with portrait, full title, **"ACCOUNTABLE FOR"** mandate list, one summary line, and a note that the portrait is a placeholder. Founders: **Sayem Ahmed** (Co-founder & CEO — vision/capital, academic partnerships, public trust), **Fahim Shahbaz Mahmud** (Co-founder & COO — journey operations, guidance quality, process), **Erfan Uddin** (Co-founder & CBIO — community/cohorts, new capability, platform expansion). They are **not** presented as AI agents on the landing.
- Founder photos use `<image-slot>` placeholders (`founder-sayem`, `founder-fahim`, `founder-erfan`) — swap for approved photos in production.

### 2. Dashboard (post-signup app)
232px sticky sidebar + fluid main column, radial green/amber glows on `#04140B`. Header carries a persistent amber **DESIGN PREVIEW** pill — every number in this surface is sample data.
- **Sidebar**: logo, 5 nav items (My Journey, Universities, AI Guides, Community, Documents) — active: green tint + green border; student card; link back to the landing.
- **Header per view**: green kicker, display title (e.g. `SELAMAT DATANG, ADIBA.`), sub written to state plainly that it is a preview.
- **My Journey**: pipeline card with progress bar and 5 stage tiles (done=green, active=amber, future=grey); stat cards; tracker feed.
- **Universities**: all 15 campuses, matched by fit rather than a fabricated score; `Campus 360°` opens an inline Street View panel; `Ask Fahim why` jumps to the Fahim chat and sends the question.
- **AI Guides**: 3 guide cards + chat panel. **Chats are wired to the real Claude API** via `window.claude.complete({system, messages, max_tokens: 400})` with per-guide system prompts and the last 8 turns of history. Loading shows a typing indicator; failure renders an explicit error bubble — canned replies are never presented as live responses. Opening messages state that this is a design preview with no real student file.
- **Community**: pinned banner + JOIN THE ROOM toggle; post cards with helpful/reply counts.
- **Documents**: rows toggle done/pending; dashed drop-zone hint.

## Interactions & Behavior
- Scroll → `p` drives camera keyframes, sky/fog interpolation, chapter label and audio mix. Section reveals fade up 30px over 1s.
- Hovers: cards lift `translateY(-4–5px)`, border brightens to `#00E676` (.3–.35s).
- Keyboard: every card is `role="button" tabIndex="0"` and responds to Enter/Space; Escape closes fast-travel and the founder modal; focus-visible ring is defined globally.
- `prefers-reduced-motion`: camera sway/bob/parallax zero out, animation durations collapse to ~0, lockup dwell lengthens.
- Street View iframes need no API key (`output=svembed`) but do need network.

## Mobile & resilience
- Breakpoint at **760px** (narrow) and **700px viewport height** (short), both tracked in state via a resize listener.
- Narrow: single-column grids, letterbox bars and chapter label dropped, Street View panel 220px, founder cards one-third width, camera FOV widened to 68°.
- Short: finale collapses to a slim bottom bar — founder cards shrink to 74px with the role line dropped, the sign-up card is replaced by a single CTA that expands the form on tap, top spacer tightens. The centre band stays clear of the bench.
- Mid-range Android: antialiasing off and pixel ratio capped at 1.5 under 760px; building count, tree count, rain particles and star count all reduced.
- **WebGL failure** falls back to a static layered gradient — the page never blanks.
- **Audio failure** falls back to synthesized ambience, then to silence, always honestly labelled.

## State Management
Landing: `p` (scroll), `mouse/mouseS`, `entered`, `lang`, `introRadio`, `radio` (`off|tuning|live|ambience`), `station`, `travelActive`, `warpLines`, `founder`, `joined`, `beyondStep`, `webglFailed`, `vw/vh`, `formOpen`.
Dashboard: `view`, `chat`, `msgs{guide:[]}`, `draft`, `typing`, `sv`, `joined`, `docs[]`.
Production needs: auth/signup, student profile, application pipeline API, document upload + verification, Claude-backed chat with the three guide personas, community feed API.

## Tweakable props (landing)
Declared as root Design Component props, surfaced as a Tweaks panel:
- `atmosphere` — Monsoon / Clear Night / Heavy Rain (rain density, fog depth, star field, road wetness, haze)
- `grade` — Emerald Night / Amber Monsoon / Cobalt Night (relights hemisphere, moon, dawn, lanterns, seat glow, fog/background tint)
- `cameraFeel` — Cinematic Drift / Handheld / Locked Off (sway, bob, parallax, letterbox bars, grain amount, jitter)

## Assets
- `assets/logo-icon.png`, `assets/logo-full.png` — real Last Bench logos (icon gets a green drop-shadow glow).
- Fonts: General Sans (Fontshare) + Sora, Hind Siliguri (Google Fonts).
- Unsplash campus photography in fast-travel — replace with real campus photos.
- Founder portraits: **pending from client** (Sayem Ahmed, Fahim Shahbaz Mahmud, Erfan Uddin) — placeholders until approved photos arrive.
- Street View coordinates for UiTM, HELP, UoC, Lincoln, MSU and Limkokwing are campus-vicinity approximations; the repo dataset carries no lat/lng field. Replace with exact pins.

## Files
- `Malaysia Experience v2.dc.html` — landing experience (template + logic in one file)
- `Last Bench Dashboard.dc.html` — dashboard app
- `support.js` — prototype runtime (reference only, do not ship)
- `image-slot.js` — photo placeholder component (design-time only)
- `assets/` — logos
