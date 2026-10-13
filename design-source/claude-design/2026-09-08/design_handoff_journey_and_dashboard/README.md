# Handoff: Last Bench — Malaysia Journey (landing) + Student Dashboard

## Overview

Two connected designs for Last Bench, a platform guiding Bangladeshi students through
studying in Malaysia.

1. **Malaysia Experience v2** — a scroll-driven cinematic landing page. The visitor starts
   on a Dhaka street at night, lifts off, crosses a real 3D Earth to Kuala Lumpur, flies
   through the city across five chapters, and lands at a bench in KLCC Park with a sign-up
   gate into the product.
2. **Last Bench Dashboard** — the post-signup app: application tracker, 15-campus explorer
   with Street View, three AI guide chats, a community room, and a document checklist.

The landing's job is emotional and factual: make the journey felt, and state costs and
requirements honestly. The dashboard's job is operational.

---

## About the Design Files

**The files in this bundle are design references created in HTML.** They are prototypes
showing intended look and behaviour — **not production code to copy directly.**

The task is to **recreate these designs inside the target codebase's existing
environment**, using its established patterns and libraries.

The target codebase is `lets-colab/The-Last-Bench`, which is:

- **Expo + React Native** with **Expo Router** file-based routing (`app/`)
- **NativeWind / Tailwind** for styling (`tailwind.config.js`, `global.css`)
- **tRPC** for the API layer (`lib/trpc.ts`, `server/routers.ts`)
- **Drizzle ORM** against Postgres (`drizzle/schema.ts`, migrations in `drizzle/`)
- Theming through `lib/theme-provider.tsx`, `theme.config.js`, `hooks/use-colors.ts`

Map the two designs as follows:

| This design | Where it belongs in the repo |
| --- | --- |
| Malaysia Experience v2 | The **web** landing. The repo already serves `landing/index.html` + `landing/support.js` (a previously exported build of an earlier version of this same design) and mirrors it to `dist/`. This is a WebGL page — it is **web-only** and should not be ported to React Native. |
| Last Bench Dashboard | React Native screens under `app/(tabs)/` — `index.tsx` (journey/tracker), `ai-guidance.tsx` (guide chats), `community.tsx` (community room), `applications.tsx`. Campus explorer maps to `components/campus-view.tsx` / `campus-view.web.tsx`, which already exist. |

Do not port the landing's three.js scene into React Native. If a native equivalent is ever
wanted, it needs its own design pass; the value here is the web experience.

---

## Fidelity

**High-fidelity (hifi).** Final colours, typography, spacing, motion timings, and
interaction behaviour. Every value in this document is taken from the prototype source,
not approximated. Recreate the UI to match, using the codebase's existing libraries.

Two deliberate exceptions, both **placeholders awaiting real material**:

- **Founder portraits.** No approved photos exist in the repo (`assets/branding/` has no
  founder images). The design shows initial-monogram avatars and a visible note saying
  portraits are pending. Swap in real photos when approved; keep the note until then.
- **Six campus coordinates.** `server/data/malaysia-universities.json` carries no lat/lng
  field. Coordinates for UiTM, HELP, UoC, Lincoln, MSU and Limkokwing in the prototype are
  campus-vicinity approximations. UM, UKM, UPM, UTM, MMU, Taylor's, Sunway, APU and UCSI
  are accurate. Add a real `lat`/`lng`/`svHeading` field upstream before shipping pins.

---

## Screens / Views

### A. Malaysia Experience v2 — landing

One continuous scrolling document, ~7,995px tall at a 540px viewport. A single fixed
full-viewport WebGL canvas sits behind everything at `z-index: 0`; all copy sits above it
at `z-index: 2`. Section heights are in `vh` so the scroll length scales with the viewport.

Section order and heights:

| # | Section | `data-screen-label` | Height |
| --- | --- | --- | --- |
| 0 | Departure (Dhaka → Earth → KL) | `Departure — Bangladesh to Malaysia` | `min-height: 460vh` |
| — | spacer | — | `60vh` |
| 1 | Arrival card | `Hero — KL Skyline` | `min-height: 100vh` |
| — | spacer | — | `60vh` |
| 2 | Campus rail | `Above the Towers — Universities` | `min-height: 118vh` |
| — | spacer | — | `60vh` |
| 3 | KLCC Park / BEYOND lockup | `KLCC Park — Beyond` | `min-height: 112vh` |
| — | spacer | — | `70vh` |
| 4 | Sign-up (`id="signup"`) | `Take Your Seat` | — |

#### A1. Fixed top bar

- Position `fixed`, full width, `z-index: 20`, padding `16px 22px`, `pointer-events: none`
  on the bar with `pointer-events: auto` restored on each control.
- Left: logo icon `assets/logo-icon.png`, `width: 62px`, `filter: drop-shadow(0 0 8px rgba(0,200,83,.55))`.
- Right cluster: `display: flex; align-items: center; gap: 12px`, base type
  `11.5px / 500 / letter-spacing .2em / rgba(242,247,243,.65)`.
- Controls, all `min-height: 36px`, `border-radius: 999px`:
  - **Radio toggle** — `background: rgba(5,16,10,…)`, `1px solid rgba(255,255,255,.22)`.
    Shows a 3-bar animated equaliser (`height: 14px`, `gap: 2px`) when playing.
  - **Language** — cycles EN / বাংলা. `padding: 0 13px`.
  - **Radio-blocked notice** (conditional) — `1px solid rgba(255,179,0,.5)`, amber text.
  - **`TAKE YOUR SEAT`** — anchor to `#signup`. `background: #00C853`, `color: #04140b`,
    `padding: 0 16px`, `font-size: 11.5px`, `font-weight: 600`, `letter-spacing: .12em`,
    `white-space: nowrap`, `flex: none`, `box-shadow: 0 6px 22px rgba(0,200,83,.32)`.
    Hover `background: #00E676`. Label becomes `JOIN` under 760px width.
  - **Chapter readout** (≥760px only) — e.g. `00 — DHAKA · DEPARTURE`, `white-space: nowrap`.

#### A2. Departure

A second WebGL canvas (separate renderer) fills the sticky viewport for this section only,
cross-faded out by opacity as the section ends.

Copy beats, both driven by the same scroll clock as the camera (`e` = eased scroll progress
through the section, 0→1):

1. **Opening headline** — visible from `e = 0`, fades out across `e` 0.10 → 0.20.
   - Kicker: `LEG 00 — DEPARTURE`, `11px / 600 / .3em / #00E676`, `margin-bottom: 18px`.
   - `<h1>`: `IT STARTS IN BANGLADESH.` / `IT DOESN'T END THERE.` — General Sans 700,
     `clamp(30px, 5.4vw, 78px)`, `line-height: 1.04`, `letter-spacing: -.025em`,
     `max-width: 16ch`, `text-wrap: balance`, `text-shadow: 0 8px 60px rgba(0,0,0,.9)`.
     Second line `color: #00C853`.
   - Body: `15.5px`, `line-height: 1.68`, `rgba(242,247,243,.85)`, `text-wrap: pretty`.
   - **Veil** (required for legibility over the street): the whole block carries
     `padding: clamp(22px,4vh,46px) clamp(20px,4vw,54px)` and
     `background: radial-gradient(ellipse 82% 116% at 50% 46%, rgba(2,9,5,.80) 0%, rgba(2,9,5,.56) 44%, rgba(2,9,5,.18) 72%, transparent 88%)`.
2. **Brand line** — fades in `e` 0.15 → 0.24, out `e` 0.36 → 0.45, with a
   `translateY(14px) → 0` lift. Absolutely centred, `width: min(760px, 88vw)`.
   - Kicker `THE LAST BENCH`, `11.5px / 600 / .3em / #00E676`.
   - Copy, **verbatim from `design-system/tokens.json` — do not reword**:
     `Your grades don't define your benchmark.` / `The future you build does.`
     General Sans 700, `clamp(24px, 3.6vw, 50px)`, `line-height: 1.14`, second line `#00C853`.
   - Same veil treatment, `ellipse 80% 118% at 50% 50%`.
3. **Route instrument**, pinned `bottom: 34px`, `display: flex`, `gap: clamp(12px,3vw,34px)`, wrapping:
   - `DHAKA` / `23.81°N 90.41°E` — city `15px / 700`, coords `11px / 600 / .16em / rgba(242,247,243,.45)`.
   - Centre: live km readout `11px / 600 / .16em / #00E676`, `white-space: nowrap`,
     `min-width: min(210px, 42vw)`; progress track `height: 2px`,
     `background: rgba(255,255,255,.14)`, fill `#00C853` with `box-shadow: 0 0 10px #00C853`;
     caption `≈ 4H 30M NONSTOP`, `11px`, `white-space: nowrap`.
   - `KUALA LUMPUR` / `3.14°N 101.69°E`.

#### A3. Arrival card

Centred, `gap: 15px`, `max-width: 660px`.

- `ARRIVED · 3.14°N 101.69°E` — `11.5px / 600 / .3em / #00E676`.
- `Admission is only the beginning.` — **verbatim from `content/CONTENT_OS.md`**.
  General Sans 600, `clamp(21px, 2.8vw, 36px)`, `line-height: 1.22`, `letter-spacing: -.012em`.
- Bottom scroll cue at `bottom: 54px`: label `11px / 600 / .28em / rgba(242,247,243,.6)`
  plus a 14×22 chevron SVG in `#00C853`, animated `lbBob 2.4s ease-in-out infinite`.

#### A4. Campus rail — the section most likely to be got wrong

**Constraint: this section must not wall off the WebGL city behind it.** An earlier version
used a 15-card auto-fit grid; it covered the entire viewport during the flight over the
towers and destroyed the experience. It is now a single horizontal rail covering ~35% of the
viewport, leaving the upper two-thirds as open sky. Preserve that property.

- Section: `min-height: 118vh`, `display: flex; align-items: center`, `padding: 80px 0`
  (no horizontal padding — the rail bleeds to the edges).
- Header block: `max-width: 660px`, `margin: 0 auto 30px`, `padding: 0 22px`.
  - Kicker `11px / 600 / .3em / #00E676`.
  - `<h2>` `FIFTEEN CΛMPUSES.` / `ONE HONEST LIST.` — General Sans 700,
    `clamp(30px, 4.4vw, 58px)`, `line-height: 1.06`, `letter-spacing: -.02em`,
    second line `#00C853`.
  - Sub: `15.5px`, `line-height: 1.68`, `rgba(242,247,243,.85)`.
- **Rail container**: `display: flex; gap: 14px; overflow-x: auto;`
  `scroll-snap-type: x mandatory; padding: 6px 22px 16px;`
  `-webkit-overflow-scrolling: touch; scrollbar-width: thin;`
  `scrollbar-color: rgba(0,200,83,.5) transparent;`
  and an edge fade on both sides:
  `mask-image: linear-gradient(90deg, transparent 0, #000 26px, #000 calc(100% - 26px), transparent 100%)`
  (plus the `-webkit-` prefix).
- **Campus card** (×15): `flex: 0 0 clamp(238px, 25vw, 278px)`, `scroll-snap-align: center`,
  `min-height: 206px`, `padding: 18px`, `border-radius: 16px`, `gap: 10px`,
  `background: rgba(4,14,9,.82)`, `border: 1px solid rgba(0,200,83,.26)`,
  `backdrop-filter: blur(9px)`, `box-sizing: border-box`,
  `transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s ease, box-shadow .3s ease`.
  - Hover: `border-color: rgba(0,230,118,.65)`, `transform: translateY(-4px)`,
    `box-shadow: 0 18px 44px rgba(0,0,0,.5)`.
  - `role="button"`, `tabIndex="0"`, `aria-label` carrying the full campus summary,
    keyboard activation on Enter/Space, `onMouseEnter` preloads the Street View pane.
  - Row 1: short name `20px / 700 / #00E676` + type badge `11px / 600 / .14em / rgba(242,247,243,.5)`.
  - Row 2: full name `13px / 600 / #fff / line-height 1.35`; city `12.5px / rgba(242,247,243,.6)`.
  - Row 3 (`border-top: 1px solid rgba(255,255,255,.1)`, `padding-top: 10px`, `margin-top: auto`):
    three stats — label `11px / 600 / .1em / rgba(242,247,243,.5)`, value `13px / 600`.
    `TOTAL / YR` (`#fff`), `IELTS` (`#00E676`), `INTAKES` (`#fff`).
  - Row 4: `VISIT CAMPUS` `11px / 600 / .18em / #00E676` + 10×9 arrow SVG.
- Footer row under the rail: `max-width: 1180px`, `margin: 6px auto 0`, `padding: 0 22px`,
  `display: flex; justify-content: space-between; flex-wrap: wrap; gap: 18px`.
  - Left: the data disclaimer, `11.5px`, `line-height: 1.6`, `rgba(242,247,243,.5)`,
    `max-width: 620px`.
  - Right: `15 CAMPUSES · SCROLL` + 15×9 arrow, `11px / 600 / .16em / #00E676`,
    `white-space: nowrap`. Count is derived from the dataset length, not hardcoded.

#### A5. Campus Street View overlay

Opens full-screen when a card is activated.

- Scrim: `linear-gradient(180deg, rgba(0,0,0,.5) 0%, transparent 24%, transparent 44%, rgba(0,0,0,.94) 100%)`.
- Text pane anchored `bottom: 0`, `padding: 0 clamp(18px,4vw,56px) clamp(24px,5vh,52px)`,
  `overflow-y: auto`, fades/lifts in with
  `transition: opacity .85s ease .2s, transform .85s cubic-bezier(.2,.7,.2,1) .2s`.
- `ARRIVED` label `11px / 600 / .4em / #00E676`; campus name `clamp(24px,4.4vw,58px) / 700`;
  location line `12.5px / .14em / rgba(242,247,243,.62)`.
- **Street View**: a single `<iframe title="Campus Street View 360" allow="accelerometer; gyroscope">`,
  `border-radius: 8px`, src pattern:
  `https://maps.google.com/maps?layer=c&cbll=<lat>,<lng>&cbp=12,<heading>,,0,0&output=svembed`.
  Hint `11px / .2em`; `OFFICIAL DETAILS ↗` link `11px / .14em / #00E676`.
- Stats grid `1fr 1fr`, `gap: 12px 16px`, fifth item spans `1 / -1`.
- Close button: `min-height: 48px`, `background: rgba(255,255,255,.07)`,
  `1px solid rgba(255,255,255,.32)`.

#### A6. KLCC Park — BEYOND lockup

- Section `min-height: 112vh`, content top-aligned with `padding: 14vh 22px 0` so the
  bench in the 3D scene below stays unobstructed.
- Kicker `04 — KLCC PARK, 7:03 AM`, `11px / 600 / .3em / #FFB300`.
- Kinetic `<h2>`: `BEYOND` on line 1; line 2 cycles through
  `MΛRKS.` → `GRΛDES.` → `LIMITS.` → `BORDERS.` → `YOURSELF.` in `#00C853`,
  each entering on `beyondFlip .6s cubic-bezier(.2,.8,.2,1)`, inside a fixed
  `min-height: clamp(150px, 22vw, 230px)` box with `perspective: 640px` on the parent
  so the cycle doesn't reflow the page.
- Resolves to `CREΛTING Λ LΛSTING BENCHMΛRK.` on
  `beyondResolve .9s cubic-bezier(.16,1,.3,1)`.
- Map pin link: outbound to `https://www.google.com/maps/search/?api=1&query=3.1553,101.7145`,
  `min-height: 44px`, `border-radius: 999px`, `1px solid rgba(0,200,83,.4)`,
  `backdrop-filter: blur(8px)`, `color: #00E676`.

#### A7. Sign-up (`#signup`)

Founder cards (monogram avatars, name `13.5px / 600`, role `11px / 600 / .16em / #00E676`)
and the sign-up form. Content is pushed to the bottom edge so the bench stays visible.
Under a 700px-tall viewport the whole finale collapses to a slim bar with a single
`Take your seat` button.

Footer: `margin-top: 36px`, centred, `gap: clamp(12px,3vw,24px)`,
`11.5px / .14em / rgba(242,247,243,.45)`, wrapping.

---

### B. Last Bench Dashboard

Single-page app shell with a left sidebar and five views switched by `state.view`.

Views: `journey` (default) · `unis` · `guides` · `community` · `docs`.

#### B1. Journey / tracker

Five-stage vertical timeline. Each stage: title `#fff`, meta line, and a status dot —
`#00E676` for the three completed stages, `#FFB300` for the current stage,
`rgba(255,255,255,.5)` for the future stage. Stage titles inherit the dot colour when
current.

Stages, in order: `Documents Received` · `Profile Reviewed` · `University Shortlist` ·
`Application Submitted` · (final stage pending).

#### B2. Campus explorer

Same 15-campus dataset as the landing, with a `uniFilter` state (`all` / by type) and a
Street View pane per campus (`state.sv` holds the open key). Section kicker reads
`DISCOVER — FIFTEEN CAMPUSES`; derive the count from the dataset so it can't go stale.

#### B3. AI guide chats

Three personas selected by `state.chat`: `sayem` · `fahim` · `erfan`.

- Each has its own system prompt and its own opening message. The opening messages state
  plainly that this is a design preview with no real file or profile loaded — keep that
  honesty in production until real data is wired.
- Sends the last **8** non-error messages as history, `max_tokens: 400`.
- `state.typing` drives a typing indicator; failures append a message tagged `SYSTEM`
  rather than failing silently.

**Production note:** the prototype calls `window.claude.complete`, which only exists in the
prototype host. In the app this must become a server-side route — add a tRPC procedure in
`server/routers.ts` that holds the Anthropic key server-side and enforces per-user rate
limits. Never ship an API key to the client. The persona keys already match the
`ai_guide` enum in `drizzle/0002_ai_guide_personas.sql` (`sayem`, `fahim`, `erfan`), so the
column can store which guide a thread belongs to.

#### B4. Community room

- **Composer**: 34px circular monogram avatar (`#7CFFB2` on `#04140b`), a `<textarea>`
  (`min-height: 54px`, `resize: vertical`, `border-radius: 12px`,
  `border: 1px solid rgba(0,200,83,.22)`, `background: rgba(0,0,0,.32)`, `13.5px / 1.55`,
  focus `border-color: #00E676`), Enter-to-post / Shift+Enter for newline, and a `POST`
  button (`min-height: 44px`, `border-radius: 999px`) that is `#00C853` on `#04140b` when
  the draft is non-empty and `rgba(0,200,83,.16)` on `rgba(242,247,243,.38)` when empty.
- A caption states posts stay on the device in preview.
- **Post card**: `border: 1px solid rgba(0,200,83,.28)`, `border-radius: 18px`,
  `padding: 16px 18px`, `background: rgba(5,16,10,.7)`, entering on
  `lbFadeUp .5s ease both`.
- **Actions**: two pill buttons, `min-height: 44px`, `border-radius: 999px`,
  `1px solid rgba(255,255,255,.14)` at rest → `rgba(0,200,83,.5)` when active,
  `11px / 600 / .12em`. `▲ N HELPFUL` toggles; `N REPLIES` opens the reply field.
  Active colour `#00E676`.
- **Reply thread**: `padding-left: 15px`, `border-left: 2px solid rgba(0,200,83,.3)`,
  author `11px / 600 / .12em / #00E676`, body `13px / 1.58 / rgba(242,247,243,.82)`.
- **Reply field**: pill input `min-height: 44px`, `min-width: 170px`, plus a `REPLY`
  button `rgba(0,200,83,.18)` fill with `1px solid rgba(0,200,83,.45)`.
- Seeded posts are labelled `Sample post`, and one `PINNED`. Replace with real threads;
  keep the labels while the data is illustrative.

#### B5. Documents

Six-item checklist with working done/pending toggles. Items and their meta strings are
illustrative preview data, not real records:
`SSC & HSC Transcripts` · `Passport — valid 18+ months` · `Statement of Purpose` ·
`Recommendation Letter` · `IELTS Result` · `Financial Statement`.

---

## Interactions & Behavior

### Landing

- **Scroll drives everything.** One `requestAnimationFrame` loop reads scroll position,
  derives a normalised progress `p`, and updates camera, fog, grade, copy opacity, and the
  chapter readout. Nothing is time-driven except idle motion (drift, bob, flicker).
- **Departure camera** is one continuous move, not a cut. Both a street-level pose and an
  orbital pose are computed every frame and cross-faded across `e` 0.30 → 0.46. Altitude
  interpolates in **log space** through the keyframes
  `[0, 4.6] [0.30, 5.2] [0.38, 60] [0.46, 900] [0.56, 7000] [0.68, 21000] [0.80, 21000] [0.90, 5200] [0.96, 700] [1.0, 90]`
  (units = km, camera height above the surface), which is what makes it read as a steady
  exponential zoom. Largest single-frame move is ~2.4% of camera distance.
- **Camera up-vector must be orthogonalised against the view axis every frame**, with a
  fallback if the remainder degenerates. Looking straight down at the planet makes a radial
  up-vector degenerate and the horizon visibly rolls. Verified at 90.0° across the shot.
- **Earth crossing** is a slerp of the surface direction from Dhaka to KL across
  `e` 0.50 → 0.93; the km counter and progress bar track that crossing (so the number holds
  during the climb and counts down during the crossing — this is intentional and truthful).
- **Reveal on scroll**: elements marked `data-reveal` fade and lift in when they enter the
  viewport, via IntersectionObserver.
- **Campus card** → opens the Street View overlay; hover preloads it. Escape and the close
  button dismiss.
- **Reduced motion**: `prefers-reduced-motion` clamps the render tier and disables sway,
  bob and jitter.
- **No WebGL**: falls back to a static gradient background; all copy stays readable.

### Motion values

| Purpose | Value |
| --- | --- |
| Card hover | `.3s cubic-bezier(.2,.7,.2,1)` |
| Overlay text in | `opacity .85s ease .2s, transform .85s cubic-bezier(.2,.7,.2,1) .2s` |
| BEYOND word flip | `.6s cubic-bezier(.2,.8,.2,1)` |
| BEYOND resolve | `.9s cubic-bezier(.16,1,.3,1)` |
| Post enter | `lbFadeUp .5s ease` |
| Scroll cue bob | `lbBob 2.4s ease-in-out infinite` |
| Film grain | `lbGrain .45s steps(N) infinite` |
| Cold open | `coldOpen 1.2s ease` |

### Radio (landing)

Region-aware, and **opt-in — never autoplay**.

- Stations resolve through the **RadioBrowser directory** (four mirrors, `hidebroken=true`,
  `order=votes&reverse=true&limit=160`, filtered by `countrycode`). **Never hardcode a
  broadcaster's stream URL, and never iframe a broadcaster's site.**
- Two regions, switched by which leg of the journey the scroll is on:
  - `bd` (Dhaka): weights Radio Foorti 9000, Radio Today 8000, ABC Radio 7000,
    Dhaka FM / Bhumi 6000, others 5000, Betar/Bangla 3500; +1200 if the listing's language
    matches Bengali.
  - `my` (Kuala Lumpur): **HITZ FM 20000** — deliberately far above everything else, since
    HITZ is the requested English KL station — then Fly FM 8000, Mix FM 7000, Lite FM 6500,
    BFM 6000, TraXX 5000, Kiss/Hot FM 2500; +1200 for English-language listings.
  - Final score = weight + the directory's vote count.
- Crossing the border retunes the dial, but only if the listener already opted in.
- Label shows station + city + state, e.g. `HITZ FM · KUALA LUMPUR · LIVE`.
- **Known limitation, must be solved server-side:** all three tested HITZ endpoints fail
  from a browser — the SYOK HLS stream and `HITZ_FMAAC.aac` time out, and the MP3 relay
  returns a decode error. Astro Radio does not send CORS headers for third-party sites and
  geo-fences to Malaysia. So in practice most visitors see the amber
  `HITZ FM BLOCKED HERE · AMBIENCE` state with synthesized ambience and an outbound link.
  To make live audio actually play in-page, proxy the stream through the project's own
  server (`server/`) so CORS originates from your domain — or obtain a licensed/embed URL
  from Astro Radio. Do not claim a stream is HITZ unless it is verifiably live.
- Fallback is a synthesized ambience bed (WebAudio), which is robust and should be kept.

### Globe geography — non-negotiable

Coastlines come from real data. **Never hand-draw them.**

- Load only via these exact pinned, hash-verified tags:
  - `https://unpkg.com/d3@7.9.0/dist/d3.min.js`
    `integrity="sha384-CjloA8y00+1SDAUkjs099PVfnY2KmDC2BZnws9kh8D/lX1s46w6EPhpXdqMfjK6i"`
  - `https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js`
    `integrity="sha384-Ukv1p/xTma6P4/2bY5KzWBw+ydSpXmhCMtyciIQVDJ1RmOxtCYNMF1uXT9T63H67"`
- Geometry: `https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json`
  (Natural Earth, public domain, version-pinned), converted with
  `topojson.feature(topology, topology.objects.countries)`.
- Rasterised with `d3.geoEquirectangular().translate([W/2, H/2]).scale(W / (2 * Math.PI))`
  onto an offscreen canvas (4096×2048 desktop, 2048×1024 small), used as the sphere's day
  texture; a half-res copy is the land mask.
- **If the fetch fails, the correct behaviour is an ocean-only globe** — never invented
  continents.
- Earth is a 6,371-unit sphere (1 unit = 1 km) sharing one coordinate space with the Dhaka
  street, whose ground point sits at the origin. A basis rotation maps
  `geoVec(23.8103, 90.4125)` → the street's up-direction and `geoVec(3.1390, 101.6869)` →
  the far end of the arc, so the map is geographically aligned to the scene.
- Sphere UV convention: `u = (lng + 180) / 360`, `v = (90 - lat) / 180`.
- Sun is placed so Dhaka is in night and KL sits on the dawn terminator, matching the
  7:03 AM KLCC arrival: scene-space direction `(0.462, -0.35, -0.815)` normalised.
- Shading: day/night mix through a `smoothstep(-0.16, 0.26, N·L)` terminator, warm scatter
  through the limb, specular restricted to ocean via the land mask, Fresnel atmosphere rim,
  plus a separate cloud shell (procedural periodic fBm banded to real atmospheric belts —
  ITCZ, subtropical highs, mid-latitude storm belts) lit by the real directional sun so it
  darkens on the night side.

---

## State Management

### Landing

| State | Purpose |
| --- | --- |
| `lang` | `en` \| `bn`. Persisted to `localStorage` under `lb_lang`. |
| `radio` | `off` \| `tuning` \| `live` \| `ambience` |
| `station`, `stationCity` | Current station label and city |
| `hitzBlocked` | Shows the amber fallback notice |
| `radioPanel` | Fallback panel open |
| `travelActive`, `sv` | Street View overlay open + which campus |
| `webglFailed` | Switches to the non-WebGL gradient fallback |
| `wide`, `vh` | Viewport-derived layout flags (letterbox, chapter readout, finale collapse) |
| `reducedMotion` | From `prefers-reduced-motion` |

Non-React per-frame values (camera, fog, progress, chapter text) are written directly to
refs, not to state — putting them in state would re-render every frame.

**Important:** wrap the scene init in a `try/catch` that **logs the real error** before
falling back to `webglFailed`. Swallowing it silently hides regressions — a
temporal-dead-zone `ReferenceError` once blanked the entire journey with no console output.

### Dashboard

| State | Purpose |
| --- | --- |
| `view` | `journey` \| `unis` \| `guides` \| `community` \| `docs` |
| `chat` | Active guide: `sayem` \| `fahim` \| `erfan` |
| `msgs` | Per-persona message arrays (`who`: `ai` \| `you` \| `error`) |
| `draft`, `typing` | Composer text and in-flight indicator |
| `posts` | Community posts, each with `replies[]`, `likes`, `liked`, `seed` |
| `postDraft`, `openReply`, `replyDraft` | Community composer + reply state |
| `docs` | Six-item checklist with `done` flags |
| `sv`, `uniFilter` | Campus explorer |
| `joined` | Community join state |

`studentName` resolves as `props.studentName ?? saved.name ?? 'Adiba Rahman'`, read from
`localStorage` key `lb_student_name` (written by the landing's sign-up). Sidebar, greeting,
composer avatar and post attribution must all use this single resolver and one shared
initials derivation, or a three-word name diverges between them.

### Data to persist server-side

- Student profile, target university, journey stage
- Document checklist state
- Community posts and replies (currently device-local in the prototype)
- Chat threads per `ai_guide` persona

---

## Design Tokens

Source of truth: `design-system/tokens.json` in the repo. Do not introduce new brand
colours or substitute fonts.

### Colors

| Token | Value | Use |
| --- | --- | --- |
| brandGreen | `#00C853` | Primary CTA fill, one accent phrase per headline |
| brandGreen on dark | `#00E676` | Accent text, active borders, stat highlights |
| charcoal | `#111111` | Brand neutral |
| warmWhite | `#FAFAF8` | Brand light ground |
| sageGreen | `#E6F2E9` | Brand light tint |
| gray | `#6B6F76` | Brand muted |
| Scene ink | `#04140b` | Text on green fills; deep ground |
| Scene panel | `rgba(4,14,9,.82)` / `rgba(5,16,10,.7)` | Card grounds |
| Body text | `#F2F7F3` → `rgba(242,247,243,.85)` | Primary copy |
| Muted text | `rgba(242,247,243,.6)` / `.5` / `.42` | Meta, captions, disclaimers |
| Amber | `#FFB300` | Current-stage marker, dawn accent, blocked-radio notice |
| Lantern | `#FF4D2E` | Scene accent (Emerald Night grade) |
| Hairline | `rgba(255,255,255,.1)` → `.22` → `.32` | Dividers, control borders |
| Green hairline | `rgba(0,200,83,.22)` → `.26` → `.28` → `.4` | Card and panel borders |

### Typography

- **Display / UI**: **General Sans** (Fontshare, weights 400–700), with Sora as fallback.
- **Secondary UI / mono-ish labels**: **Sora** (Google Fonts, 400–600).
- **Bangla**: **Hind Siliguri** (Google Fonts, 400–700).
- **Never substitute Anton, Inter, or Roboto.**

| Role | Spec |
| --- | --- |
| h1 (departure) | General Sans 700, `clamp(30px, 5.4vw, 78px)`, lh 1.04, ls -.025em |
| h2 (section) | General Sans 700, `clamp(30px, 4.4vw, 58px)`, lh 1.06, ls -.02em |
| h2 (BEYOND) | General Sans 700, `clamp(28px, 5vw, 68px)`, lh 1.04, ls -.025em |
| Brand line | General Sans 700, `clamp(24px, 3.6vw, 50px)`, lh 1.14, ls -.02em |
| Arrival line | General Sans 600, `clamp(21px, 2.8vw, 36px)`, lh 1.22, ls -.012em |
| Body | 15.5px, lh 1.68, `text-wrap: pretty` |
| Card body | 13–13.5px, lh 1.35–1.58 |
| Stat value | General Sans 600, 13px |
| Label / kicker | 11px, weight 600, ls .1em–.4em, uppercase |
| Bangla headline | Hind Siliguri 700, `clamp(28px, 4vw, 52px)`, lh 1.14–1.34 |

**Typography floor: nothing below 11px anywhere.** An earlier version had 29 labels between
8px and 10.5px. Verified zero elements under 11px and zero clipped text.

### Spacing, radius, hit targets

- Spacing rhythm: `6 · 8 · 10 · 12 · 14 · 16 · 18 · 22 · 26 · 30 · 36`px;
  section padding `80px` block, `22px` inline; fluid variants use
  `clamp(18px, 4vw, 56px)`.
- Radius: `8px` (media) · `12px` (textarea) · `14px` · `16px` (campus card) ·
  `18px` (post card) · `999px` (pills).
- **Hit targets: 44px minimum** on every interactive control; `48px` on overlay close
  buttons; `36px` on the top-bar pills (desktop chrome only — raise to 44px if these ever
  become primary mobile controls).

### Shadows

- Card hover: `0 18px 44px rgba(0,0,0,.5)`
- CTA: `0 6px 22px rgba(0,200,83,.32)`
- Text on scene: `0 8px 60px rgba(0,0,0,.9)` (display), `0 6px 44px rgba(0,0,0,.92)`
  (mid), `0 2px 16px rgba(0,0,0,.85)` (body)
- Progress fill glow: `0 0 10px #00C853`

---

## The Λ device — a brand contract, not decoration

Every display **A** is rendered as a rotated in-family **V** to make the Λ mark. It must
ship with its accessibility half intact:

```html
<span aria-label="Fifteen campuses. One honest list.">
  FIFTEEN <span style="white-space:nowrap;">C<span aria-hidden="true"
    style="display:inline-block;line-height:1;transform:translateY(0.052em) rotate(180deg);"
  >V</span>MPUSES.</span>
</span>
```

Rules:
- Every rotated span carries `aria-hidden="true"`.
- Every containing lockup carries an `aria-label` with the true, readable string.
- Wrap the affected word in `white-space: nowrap` so the glyph can't break across lines.
- The prototype has **13** rotated spans, all compliant. This device has been lost twice to
  rewrites — audit it after any refactor.

---

## Localization

Full EN / বাংলা parity through a single `I18N` object keyed by `en` / `bn`; every visible
string comes from it. Bangla uses Hind Siliguri, its own type scale (slightly smaller with
taller line-height), and Bangla numerals via `toLocaleString('bn-BD')`. Language choice
persists to `localStorage` under `lb_lang` and is switchable at any time from the top bar.

---

## Content honesty rules — carry these into production

These come from `PRODUCT.md`, `AGENTS.md` and `content/CONTENT_OS.md` in the repo, and the
design follows them deliberately:

- All 15 campuses' costs are labelled **"Last Bench's own planning estimates"** for
  Bangladeshi students covering tuition and living costs. They are **not quotes and not
  guarantees**; the copy tells the reader to confirm current fees directly. Keep that
  disclaimer adjacent to the figures.
- **No fabricated fees, visa guarantees, testimonials, or success statistics.**
- Founders appear as **verified roles and mandates only** (CEO, COO, CBIO), with a visible
  note that portraits are pending.
- Sample community posts and preview documents are **labelled as samples**.
- The AI guides state that no real file or profile is loaded yet.
- The `last bench` idea is framed as **pride, not sympathy** — never charity or pity. The
  brand line is a claim about the future, not a plea about the past.
- Radio never claims to be HITZ FM unless a stream is verifiably live.

---

## Tweakable props

Exposed as design-time props with defaults; useful as feature flags or a debug panel.

**Landing** (all `section: "World"`):

| Prop | Options | Default |
| --- | --- | --- |
| `atmosphere` | Monsoon · Clear Night · Heavy Rain | Monsoon |
| `grade` | Emerald Night · Amber Monsoon · Cobalt Night | Emerald Night |
| `cameraFeel` | Cinematic Drift · Handheld · Locked Off | Cinematic Drift |
| `renderQuality` | Cinematic · Balanced · Performance | Cinematic |

Preset tables, verbatim:

```js
ATMOS = {
  'Monsoon':     { rain: 1.0, fogMul: 1.0,  star: 1.0,  wet: 0.16, haze: 1.0 },
  'Clear Night': { rain: 0.0, fogMul: 1.45, star: 1.45, wet: 0.05, haze: 0.6 },
  'Heavy Rain':  { rain: 2.0, fogMul: 0.68, star: 0.35, wet: 0.30, haze: 1.5 },
};
GRADES = {
  'Emerald Night': { hemi: 0x6a8fc0, moon: 0xbcd2ff, tint: 0x0e2a1c, dawn: '#FFB300', lantern: '#FF4D2E', seat: '#00E676' },
  'Amber Monsoon': { hemi: 0xc0895a, moon: 0xffd2a4, tint: 0x2a1d10, dawn: '#FF7A18', lantern: '#FFB300', seat: '#FFC246' },
  'Cobalt Night':  { hemi: 0x5a7ec8, moon: 0xa8c8ff, tint: 0x101c34, dawn: '#7AA8FF', lantern: '#00E5FF', seat: '#6FE3FF' },
};
FEELS = {
  'Cinematic Drift': { sway: 1.0, bob: 1.0, par: 1.0, bars: true,  grain: 0.08, jitter: 0 },
  'Handheld':        { sway: 2.1, bob: 2.0, par: 1.5, bars: true,  grain: 0.15, jitter: 1 },
  'Locked Off':      { sway: 0.0, bob: 0.0, par: 0.3, bars: false, grain: 0.03, jitter: 0 },
};
```

`renderQuality` maps to tiers `Cinematic: 2`, `Balanced: 1`, `Performance: 0`, and is
**auto-clamped to ≤1 on viewports under 760px and whenever `prefers-reduced-motion` is
set**. Tier ≥2 enables soft shadow maps; tier ≥1 enables the PMREM environment map.

**Dashboard**: `studentName` (default `Adiba Rahman`), `targetUni` (default
`Universiti Malaya`), both `section: "Student"`.

---

## Responsive behaviour

- Breakpoint at **760px** (`small` / `narrow`) — reduces WebGL geometry, particle counts and
  pixel ratio; drops the letterbox bars and chapter readout; shortens the CTA to `JOIN`;
  collapses grids to one column.
- Viewports **shorter than 700px** collapse the finale to a slim bar with a single
  `Take your seat` button, so the bench is never hidden.
- Pixel ratio capped at `min(devicePixelRatio, 1.5)` on small, `2` otherwise.
- **The WebGL canvas must size from its mount element's `clientWidth/clientHeight`, not
  from `window.innerWidth/innerHeight`** — the window is wider than the mount by the
  scrollbar, which made the canvas overflow and render at the wrong aspect ratio.

---

## Assets

| Asset | Source | Notes |
| --- | --- | --- |
| `assets/logo-icon.png` | Repo `assets/branding/` | Bench + rising arrow mark. Also the 3D bench model's reference. |
| `design-system/logo.svg` | Repo | Wordmark |
| Fonts | Fontshare (General Sans), Google Fonts (Sora, Hind Siliguri) | Loaded via `<link>`; self-host for production |
| three.js r158 | cdnjs | **Deprecated build** — `three.min.js` is removed in r160. Migrate to the ES module build. |
| hls.js v1 | jsDelivr | Radio HLS playback |
| d3 7.9.0 + topojson-client 3.1.0 | unpkg, pinned + integrity | Globe geography only |
| `world-atlas@2.0.2/countries-110m.json` | jsDelivr, pinned | Natural Earth, public domain |
| Street View | Google Maps `output=svembed` iframes | Campus cards only |
| Founder portraits | **Missing** | Monogram placeholders until approved photos land in `assets/` |
| Earth day / night / mask / cloud textures | Generated at runtime | No image files needed |

There are **no** Anthropic brand assets in this design. All branding is Last Bench's own.

---

## Files

| File | What it is |
| --- | --- |
| `Malaysia Experience v2.dc.html` | The landing design — full source, template + logic |
| `Last Bench Dashboard.dc.html` | The dashboard design — full source, template + logic |
| `support.js` | Runtime that renders the two files. **Not part of the design** — do not port it; it exists only so the prototypes open in a browser. |
| `assets/logo-icon.png` | Logo mark used by both |
| `github.md` | Sync record tying each screen to the repo files it was built from, plus the regression-risk checklist |

Open either `.dc.html` directly in a browser to see the design running.

---

## Regression checklist

Re-verify after any significant refactor. Each item below has been broken at least once.

- [ ] 13 rotated Λ spans, every one `aria-hidden`, every lockup `aria-label`led
- [ ] Radio resolves only through the RadioBrowser directory; no hardcoded broadcaster
      stream URLs; no broadcaster site in an iframe (outbound `<a href>` links to
      syok.my / hitz.com.my / bfm.my are fine and expected)
- [ ] Globe geography from the pinned TopoJSON with integrity hashes unaltered; ocean-only
      globe on fetch failure; no hand-drawn coastlines
- [ ] No text below 11px; no clipped or wrapping labels in the top bar or route instrument
- [ ] Campus list stays a single scroll rail — a full-viewport grid there hides the flight
- [ ] Scene init `catch` logs the real error before falling back to `webglFailed`
- [ ] Canvas sizes from its mount box, not the window
- [ ] Camera up-vector orthogonalised against the view axis (90.0° throughout)
- [ ] One name resolver and one initials derivation across the dashboard
- [ ] Cost figures still carry the "planning estimates, not quotes" disclaimer
- [ ] Brand fonts intact; no Anton / Inter / Roboto substitution
