# Co.mpass Navigator

Build a functional cinematic UI/UX prototype for “Co.mpass”, a Founder/Company Intelligence interface.

VISUAL SOURCE OF TRUTH: Follow the approved first brand board: premium monochrome/off-white, near-black, graphite, mist and glass; architectural negative space; minimal geometric/Swiss typography; futuristic, cinematic and classy, never neon/cyberpunk. Canonical brand: Co.mpass. Master line: “INTELLIGENCE · CLARIFY · PROGRESS”. Secondary concept: “Different paths. One direction.” The canonical mark is a symmetrical two-path form that curves inward and converges into one upward arrow. Treat that convergence geometry as the proprietary visual/motion grammar. Do not casually redesign the logo.

PRODUCT ROLE: Co.mpass is the visual navigation/intelligence layer for a founder/company ecosystem. DR.X AI is embedded as the Founder AI/intelligence layer. It is not generic project management.

INFORMATION ARCHITECTURE / ROUTES:
Cinematic Entry → ROOM → MAP → FOCUS → DETOUR → TIME MACHINE → MEMORY → DR.X AI.
ROOM = current state / Company Pulse.
MAP = interactive 3D ecosystem graph showing two principal origins: CLASS[Λ] for human capability and co.lab for business building; their intelligence converges through Co.mpass toward DR.X. Include Last Bench and incubated/accelerated ventures as contextual nodes, not as the definition of “ventures”.
FOCUS = max 3 founder priorities/decisions.
DETOUR = blockers, anomalies, risks, changed assumptions.
TIME MACHINE = evidence-backed history using PLANNED → BUILT → TESTED → LIVE → PROVEN.
MEMORY = governed company knowledge, decisions and sources.
DR.X AI = persistent contextual intelligence/command surface with prompts like “What changed?”, “What needs my decision?”, “Show evidence.” Prototype answers must be visibly labeled SIMULATED/DEMO.

CINEMATIC EXPERIENCE: Mirror the outcome capability of the prior Last Bench cinematic 3D/motion experience: scroll-driven scenes, meaningful depth/parallax, real 3D convergence paths, controlled camera transitions, glass surfaces, light/shadow, and responsive motion. Opening sequence: two paths exist independently → approach → converge into the arrow → resolve into Co.mpass + master line → camera advances into ROOM. Locked motion grammar: SEPARATE → APPROACH → CONVERGE → CLARIFY → ADVANCE. Include prefers-reduced-motion and a graceful non-WebGL fallback.

TECH CHOICE: TypeScript + React. Use Three.js through React Three Fiber/Drei for true 3D, GSAP ScrollTrigger for choreographed scroll/camera sequences, and Motion only for UI micro-interactions; avoid overlapping animation ownership. Use Tailwind/shadcn only as underlying primitives and restyle fully. Lazy-load 3D and optimize mobile.

DESIGN SYSTEM: Build semantic tokens for brand colors, type hierarchy, spacing/grid, glass material, radii, shadows, depth and motion. Reusable components: NavigationRail, IntelligenceCard, EvidenceBadge, Metric, PathNode, CommandBar, DRXPanel, TimelineEvent, DecisionCard. Evidence states must remain explicit: ACTUAL, VERIFIED, HISTORICAL, SIMULATED, INFERRED, PLANNED, UNVERIFIED.

UX: Desktop-first immersive spatial interface, responsive tablet/mobile. Navigation should feel like moving through an intelligence environment, not changing dashboard tabs. Keep surfaces radically clear despite deep underlying intelligence. Build enough realistic demo data to prove interactions without representing demo content as live company truth.

QUALITY REGRESSION RULE: The approved first brand direction is the baseline. Do not add visual clutter in the name of completeness. Precision > decoration. Complex intelligence underneath; radical clarity on the surface.

Build the complete first prototype and wire all routes/interactions. Do not publish/deploy.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://co-mpass-navigator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3fb74c1a-fa48-43d0-b8e3-8a6461b2820e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```