# LastBench — A World You Can Become Part Of
## Cinematic experience blueprint and design review
**Date:** 25 October 2026 · Asia/Dhaka  
**Status:** PROPOSED DESIGN / SOURCE REVIEW COMPLETE / IMPLEMENTATION AND RELEASE NOT VERIFIED  
**Scope:** LastBench entry, Malaysia experience and Claude student portal, CLASS[Λ] Skill Laboratory, co.lab, public people/work directories, founder interaction, Dr. X and Co.MPASS.

This document records the user's current direction and a concrete recommended design. It does not change canonical repositories, deploy a website, certify a production service, or award a numerical score.

## 1. Decision

Proceed with a **cinematic arrival hub connecting three distinct worlds**, with accessible direct routes and calm operational workspaces.

The visitor should feel: **I can see a future here; I understand where I belong; I can take one real step now.**

The film is the connective storytelling layer. Real people, useful work and clear choices make the experience credible. Motion introduces a place, a change or an action; it never becomes the task.

### Current user decisions that supersede earlier wording

- Public CLASS[Λ] descriptor becomes **Skill Laboratory**. The existing canonical sources still say Human Lab; implementation must reconcile that deliberately rather than claim it already happened.
- Dr. X is experienced as a **personal AI assistant**, with public assistance separated from authenticated personal context.
- Co.MPASS is designed as a **multi-agent business intelligence framework and workspace**. This is a product requirement, not proof that working agents are deployed.
- The entry, CLASS[Λ] and co.lab need business-relevant cinematic worlds.
- Endings offer a relevant next chapter and a clear return to the hub.
- Add founder profiles, creator and ambassador directories, student/product showcases, investor discovery, event work and ProjectX industry examples.
- Preserve the recovered Claude student dashboard/mobile designs as the portal references.

### Approaches considered

| Approach | Strength | Consequence | Decision |
|---|---|---|---|
| Fully free-roaming 3D world | Maximum exploration | Navigation, motion comfort, device performance and accessibility become much harder; slow for returning users | Do not use as the default |
| Film/video chapters with conventional navigation | Strong visual realism and predictable playback | Less spatial agency; interaction can feel detached | Use for demanding establishing shots |
| Guided hybrid: interactive 3D hub/objects + authored film-quality chapters + normal semantic navigation | Strong immersion with reliable task access and performance tiers | Requires careful transitions and honest fallbacks | **Recommended design**, subject to visual selection and implementation validation |

Do not rewrite the current application framework merely to obtain a visual effect. Preserve working authentication, forms, data ownership, approved pricing and existing routes wherever verified.

## 2. Evidence and review limits

### Material inspected

- User-supplied entry screenshot: provided screenshot (private source retained by the owner).
- Current public LastBench entry page observed in the browser on 25 October 2026.
- Actual bytes of the latest matching saved archive, **LASTBENCH 3D-handoff(1).zip**: 46 files; ZIP integrity passed.
- Claude desktop `lastbench-3d/project/Last Bench Dashboard.dc.html`.
- Claude mobile `lastbench-3d/project/Last Bench Mobile App.dc.html`.
- Original Malaysia journey and both handoff README documents.
- Current repository brand blueprint, website blueprint, experience constitution and design tokens retrieved during this conversation.
- CLASS[Λ] current design snapshot and co.lab canonical brand blueprint.
- Primary documentation for God's Eye View, Google mapping and phone orientation.

Archive SHA-256: `a32f08f516cb36c8963a356a55304843c72843be460118c2513e11502879ae97`.

### What this review establishes

The entry screenshot and current entry observation support a visual/structural critique. The two Claude files support a **source and design-intent review**, including their navigation, sample-data labels and prototype dependencies.

The cloud browser could not reach the local Claude reference preview. The two dashboard designs therefore have **not** received a fresh rendered desktop/mobile comparison, keyboard audit, screen-reader audit, authentication test or backend test in this review. Do not represent them as having passed those checks.

### Review verdict

**10.5/10 acceptance: NOT ESTABLISHED.** The existing entry does not meet the newly requested cinematic experience. The recovered dashboards are useful design references, not evidence of a complete working login product.

| Step / surface | Health from available evidence | Finding | Required enhancement |
|---|---|---|---|
| 01 Entry / choose path | Structurally clear; cinematic brief not met | Strong headline, recognizable palette and three clear entry choices; the supplied frame presents flat cards rather than an explorable world | Make each choice a visible portal with spatial depth and a preview of its destination; retain direct links |
| 02 Entry on the supplied phone screenshot | Readability risk | Three columns and very small supporting text are visible in the supplied capture; actual CSS viewport/zoom is unknown | Test real 320/360/390/430px layouts; present one readable focused portal on phones |
| 03 Claude desktop dashboard | Source-reviewed; runtime unverified | Strong five-view structure, sample-data honesty and source visual language; a fixed 232px sidebar is desktop-specific | Keep desktop composition, unify state semantics and route to dedicated mobile composition at narrow sizes |
| 04 Claude mobile app | Source-reviewed; runtime unverified | Existing Home / Applications / Universities / AI Guides / Profile navigation and English/Bangla strings | Preserve navigation; prioritize next action, thumb access and meaningful empty/error states |
| 05 Student entry/authentication | Not established | Landing links to “Enter your dashboard”; dashboard sample uses local display context and prototype-host AI | Separate an actual authenticated session from local name/language storage; verify identity, access controls and returning-user flow |
| 06 Journey taxonomy | Source drift identified | Desktop sample includes five illustrative pipeline items; current service constitution specifies six journey stages | Use Discover → Match → Apply → Secure → Prepare → Arrive; document tasks sit under stages |
| 07 Guides/community/documents | Design exists; backend unverified | AI uses prototype-host `window.claude.complete`; sample student data and preview community behavior remain | Implement governed production services with clear loading, failure, moderation and document permission states |

A screenshot alone cannot establish WCAG compliance, touch-target measurements, GPU performance or correct data isolation.

## 3. The first scene: the LastBench arrival hub

### Art direction

A believable architectural threshold at blue hour: a grounded bench in the foreground, fine contour lines in the floor, restrained green wayfinding and three large apertures opening into different worlds. Materials are tactile stone, smoked glass and quiet brushed metal. The brand leads; the architecture supports it.

The camera sits at a comfortable standing eye level. There is a slight perspective response to dragging or pointing, with no weapon, crosshair, forced mouse lock, head bob or requirement to learn game controls.

**Headline:** FROM WHERE YOU ARE. TO WHAT YOU CAN BUILD.  
**Short invitation:** Choose where your next chapter begins.  
**Three destinations:** Study & Move · Learn & Build · Build & Grow.

Use an exact approved LastBench logo as a separate UI layer. Never bake an invented mark into the generated environment.

### First viewport wireframe

| Layer | Desktop | Phone |
|---|---|---|
| Header | Exact parent mark; Explore / People / Work; sign in; sound off | Parent mark; menu; sign in |
| Environment | Three portals visible in one coherent architectural space | One selected portal dominates, with clear previous/next controls and a three-item text selector |
| Message | Short editorial headline on a stable readable plane | Headline and relevant outcome visible without waiting for 3D |
| Selection | Hover/focus highlights a portal; click/tap selects | Swipe or tap selects; buttons provide the same functionality |
| Selected state | Outcome, short preview and one ENTER action | Stable bottom action area; at least 48px primary touch target |
| Escape routes | Skip animation / View all paths / Return to hub | Same routes in thumb reach; no gesture-only action |

Portal previews stay quiet until selected. Do not run three heavy animated worlds at once.

### Entry choreography

1. A meaningful headline and route controls render first on a still establishing frame.
2. Optional 1–2-second environmental reveal: light, floor contours, subtle depth.
3. Selecting a portal changes lighting and the destination preview while the action stays stable.
4. ENTER moves through the aperture in an interruptible transition, then reveals the destination title.
5. The browser URL and history reflect the actual destination. Back returns to the prior meaningful state.
6. Returning visitors can bypass the introduction and reopen their saved workspace.

The hub is a real route selector, not a mandatory splash screen.

## 4. Three worlds, one story grammar

| World | Visitor intent | Signature setting | Transformation | Primary outcome |
|---|---|---|---|---|
| Malaysia / Education & Mobility | Explore a credible student future | Realistic Dhaka-to-Kuala Lumpur journey; campus and arrival views | Distance becomes a supported path | Explore fit / begin an application / return to journey |
| CLASS[Λ] Skill Laboratory | Become capable and build something | Near-black skills laboratory; metallic 20; orbital capability system; project workstations | An idea becomes tested proof and a product | Start learning / build / show evidence |
| co.lab Business Laboratory | Build, showcase or grow a business | White-glass creative laboratory; blueprint layers, production spaces and living network | Individual efforts become systems and growth | Explore work / propose a project / apply to collaborate |

Shared grammar: **ARRIVE → UNDERSTAND → EXPLORE → ACT → CONTINUE**.

Shared controls: chapter position, back, skip motion, sound off/on, plain route menu, contextual Dr. X help. Shared controls do not impose one palette or typographic identity across the three brands.

## 5. Malaysia: realistic journey and campus discovery

### Narrative chapters

**Dhaka / possibility → departure → Earth / distance → Kuala Lumpur / arrival → campus choice → KLCC Park / your seat → your student journey.**

Preserve the original horizontal campus rail and visible city. The campus overlay should complement the world rather than cover it with a wall of cards. Keep the finale bench unobstructed.

### How to remove the cartoon feeling

- Ground buildings and streets in verified geography and believable scale.
- Use physically plausible lighting/materials, correct perspective, restrained saturation and photographic exposure.
- Give wet roads, glass, foliage and daylight subtle variation instead of exaggerated gloss/glow.
- Use limited, intentional atmospheric depth and a stable lens; remove excessive bloom, speed lines and weightless camera movement.
- Blend licensed real footage or carefully produced renders with interactive 3D at demanding transitions.
- Use photogrammetry or available photorealistic tiles where exact local coverage and provider terms support them.
- Place readable text in stable UI layers, never as tiny objects users must chase through the scene.
- Clearly label reconstructed/illustrative scenes; realistic appearance does not establish current real-world conditions.

### Campus explorer modes

| Mode | What it means | Truth label / failure behavior |
|---|---|---|
| Aerial 3D | Available terrain/building imagery rendered interactively | Source attribution; coverage/date when available; no live claim |
| Street / 360° | Existing street imagery or authorized campus panoramas | Captured imagery; show date when available |
| Official tour | Authorized university tour or media | Official source and date |
| Live camera | A specifically authorized, functioning campus feed | LIVE only with source, last refresh and a working freshness check |
| Unavailable | No usable coverage/permission/feed | Say unavailable; offer other modes and official information |

Offer “Look around with phone” on supported devices after a deliberate tap. Include recenter, pause, sensitivity, drag-to-look and turn-off controls. Device motion rotates the viewpoint; it does not make historical imagery live and does not require the student's physical location.

### God's Eye View decision

The likely matching upstream project is [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view). It combines a globe, third-party imagery and public-data layers. Its documented public-camera sources do not establish live coverage for the Malaysian campuses in our dataset.

**Recommendation:** evaluate selected mapping/storytelling components; do not replace Street View wholesale or present the full OSINT interface to students. The relevant benefit is seamless geographic exploration. Campus-specific coverage, imagery terms, operating cost and mobile performance remain separate gates.

[Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles-overview) supports geographic storytelling. [Google's coverage tool](https://developers.google.com/maps/documentation/javascript/3d/coverage) must be checked per location. [Street View already supports device-motion viewing](https://developers.google.com/maps/documentation/javascript/streetview#motion_tracking_on_mobile_devices). [Orientation permissions](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static) vary by browser and require secure contexts and, where applicable, user activation.

## 6. Claude student portal: preserve and enhance both compositions

The cinematic journey ends in a useful workspace. Keep continuity in the brand, then reduce camera movement and visual noise when a student is managing applications or documents.

### Desktop wireframe

- 232px reference sidebar remains the wide-screen starting point: **My Journey · Universities · AI Guides · Community · Documents**.
- Header: current stage, actual student identity, latest update and a clear account menu.
- Main priority: **one next meaningful action**, due date if known, accountable person and evidence.
- Secondary: six-stage journey timeline, open applications, requested documents and campus shortlist.
- Right/secondary panel only where space permits: help, upcoming verified activity and relevant updates.
- Display UNKNOWN / awaiting review / action needed honestly; do not substitute reassuring green success.

### Mobile wireframe

Preserve **Home · Applications · Universities · AI Guides · Profile**.

- Home: next action first, current stage second, recent verified update third.
- Applications: stage, institution, owner, next milestone and supporting evidence.
- Universities: readable shortlist, compare where feasible, campus modes, official information.
- AI Guides: clearly AI-assisted guidance, approved source context, escalation.
- Profile: identity, language, accessibility, privacy, Community and Documents quick access.
- Forms use visible labels, clear validation and preserved drafts; upload confirmation reflects actual server state.
- Community supports report/block/moderation paths before public member interaction is enabled.
- Documents require private storage and verified ownership/role controls.
- Each important task works without cinematic assets or gyroscope permissions.

### Required operational states

Loading, first-time empty, no applications, waiting for a human, failed upload, retry, lost network, expired session, access denied, stale information, AI unavailable, unavailable campus coverage and success with a real receipt.

Keep a source-preview label while mock records are present. Removing the label is not how a prototype becomes production.

## 7. CLASS[Λ]: the Skill Laboratory

### Visual direction

Near-black/graphite world, strong white editorial type, neutral metallic silver, dimensional **20** and thin orbital structures. Preserve the approved CLASS[Λ] identity. Do not import LastBench green-card styling or co.lab's white-glass environment.

### Cinematic story

| Chapter | Scene | User learns / does |
|---|---|---|
| Enter | Approved reel with immediate skip and sound by gesture; transition into the metallic 20 | Understand the promise and choose free/paid entry |
| Command | A quiet command station where a goal becomes a structured instruction | Learn to direct AI |
| Research | Evidence surfaces connect to an answer; sources remain readable | Learn to test an assumption |
| Build | A product assembles through actual work samples | See that learning produces working output |
| Create | The work gains identity, content and presentation | Make the result understandable |
| Sell | A customer's problem and offer become clear | Understand a market and commercial hypothesis |
| Operate | A team/workflow system resolves into a usable business surface | Understand repeatable execution |
| Proof | Student/product exhibition | Inspect what was built and its evidence |
| Continue | Relevant co.lab incubation or collaboration door | Apply for review; no automatic certification or investment |

The sequence can use existing approved program language where it differs, with a documented content decision rather than silent remapping.

### Student and product showcase

This is a searchable exhibition of **consenting student builders and their products**, with an accessible list view beneath the cinematic presentation.

Product detail: problem, intended users, proposed solution, student/team, industry, stage, screenshots, safe live demo, repository link where approved, dated evidence, what help is sought and contact/request-introduction action.

Distinguish **idea / prototype / tested / deployed / operating / proven**. Each stage needs its own evidence. Never infer traction from a live URL or rank student eligibility using sensitive personal information.

Default student records are private. Publish a separate approved profile projection. Do not expose grades, admissions documents, private chats, contact details or internal assessments.

Investor discovery is an opt-in product showcase and introduction workflow. Incubation, certification, funding and commercial claims remain separate decisions.

### Authenticated CLASS workspace

Keep learning and product evidence separate from Malaysia admissions. Recommended structure: **Home · Learn · Projects · Evidence · Profile**. Additional instructor tools require role access. This is a proposed structure in this blueprint, not a claim of current implementation.

## 8. co.lab: a living Business Laboratory

### Visual direction

Warm-white glass, graphite structure, believable refraction/reflection, precise blueprint overlays and restrained **Electric Blue #2D7CFF**. Space Grotesk for primary typography; JetBrains Mono for small technical notation. No dark neon surveillance chamber, stock-photo agency wall or endless floating cards.

### Cinematic story

1. **Enter the Lab:** independent fragments of a business are visible through glass.
2. **Collaboration:** positioning, identity and intent align in an experiment chamber.
3. **Connection:** the camera passes through connected systems and operating rails.
4. **Community:** relationships create a living network.
5. **Four Doors:** Ventures · Projects · Services · Community become actionable choices.
6. **Work & Evidence:** real work plays as case chapters with explicit roles and outcomes.
7. **Launch Chamber:** propose a project, join a network or apply to build/grow.
8. **Continue:** explore a relevant creator, project, student product or CLASS pathway.

### Event portfolio

Include the requested **Partylab, Redsea, Formula 1 and Neo** as content candidates in the editorial inventory. The user identifies them as work associated with co.lab; this review has not independently established the exact event names, contracting entity, role, dates, rights or results.

Do not infer an official Formula 1 partnership from a related event name.

Each published event needs: exact title/date/location, owner/client, co.lab or founder's precise contribution, original permitted photos/reel, collaborator credits, verified deliverables and outcomes, and what a prospective client can ask for next.

A founder's earlier work may be shown with accurate attribution; it must not automatically become a co.lab company case study.

### ProjectX showcase

ProjectX stays one product/program within **Projects**, with an industry-led website showcase.

Filters: industry, project type and evidence-backed delivery state. Details: client-approved name, problem, scope, role, design approach, launch date if verified, safe preview/live link and proof. Mark concepts and independent demonstrations honestly.

Do not embed arbitrary customer pages directly. Use approved thumbnails and safe external previews; separate untrusted embedded content and do not present illustrative concepts as commissioned work.

## 9. Company profile and founder selection

The parent brand needs a cinematic company profile that explains its belief, work and people without exposing internal operating machinery.

### Founder scene

A circular, physically grounded selection platform. The current founder appears in a standing pose. A horizontal swipe, arrow button or keyboard action rotates the selection to another founder. Names and roles stay on a stable plane while the environment transitions.

Use real approved full-body photography, authorized video cutouts or consented 3D captures. A holographic treatment can add controlled edge light, depth and a base reflection. It must preserve identity and never fabricate a standing body/face or imply a volumetric capture that was not made.

Fallback: an approved real portrait with the same profile structure. Missing media remains a named asset requirement.

### Profile content and interaction

- Sayem Ahmed — Co-founder & CEO.
- Fahim Shahbaz Mahmud — Co-founder & COO.
- Erfan Uddin — Co-founder & CBIO; also known as Dr. X.
- Current approved mandate, short biography, verified work, approved social links and “Ask about [name]'s work.”
- Label the chat **AI assistant using approved profile information**. Its responses are not personal statements or authorization from the founder.
- Allow suggested questions, cited answers, uncertainty and contact/escalation.
- Voice is opt-in with text fallback, stop/mute and clear listening state.
- No request can reach unrestricted founder memory or private internal communications.

The game-character interaction is a browsing metaphor, not a fictional persona.

## 10. People and community directories

Use one governed profile record per person, with scoped public projections and contextual directory views. Do not maintain contradictory duplicate records across brands.

| Directory | Fields visible by approval | Useful action |
|---|---|---|
| Creators / influencers | Verified name/handle, category, language, permitted work, location at suitable granularity, association status, availability | Request collaboration / view relevant work |
| Campus ambassadors / presidents | Institution, chapter, role, term dates, verified status, approved activities and contact route | Meet the chapter / apply / partner |
| CLASS students / builders | Approved profile, cohort where appropriate, interests, products and evidence | Explore product / request introduction |
| Products / ventures | Problem, users, industry, stage, demo, evidence, team and needs | Explore / apply to incubate / request intro |
| Founders | Approved identity, role, mandate and work | Learn / ask AI-assisted questions / contact |

Do not invent roster members, follower counts, availability, chapter presidents or titles. Show unknown/awaiting verification honestly. A private directory is not implicitly authorized for public release.

Search/filter/list modes must remain useful when 3D is off. Avoid turning real people into noisy floating portrait particles.

## 11. Dr. X and Co.MPASS intelligence workspaces

### Dr. X

A persistent personal assistant reached through a calm “Ask Dr. X” control, not an interrupting pop-up.

Public mode: explains the ecosystem, approved founder profiles, available paths and published work. Authenticated mode: uses only that person's authorized workspace context. Personal preferences and memory require clear user control; public context never inherits private founder memory.

Show sources where material, uncertainty, tool/action state and escalation. Voice is optional. State plainly when the AI is unavailable.

### Co.MPASS

A business intelligence workspace designed around cooperating agents. Possible roles: research, operations, growth, finance and review. These are proposed roles until connected runtimes and permissions are verified.

The primary screen shows:
- one current business priority;
- relevant evidence and freshness;
- which agent is working and what it is authorized to do;
- suggested next action, accountable human and approval boundary;
- NOW / NEXT / PARKED;
- actual versus target/forecast/unknown;
- run history, failed/degraded states and outcome receipts.

An animated constellation can explain agent relationships. It must not imply agents are executing because dots are moving. Display connected, running, waiting, failed and unconfigured states from actual backend evidence.

Use role-based access. A public demo receives synthetic or approved public data with an explicit label. Real operations and private evidence stay in authenticated workspaces.

## 12. Proposed sitemap

These are logical destinations and example route patterns, not a claim that endpoints currently exist. Preserve/redirect existing routes deliberately during implementation.

| Parent | Destinations |
|---|---|
| **LastBench / Arrival** | Portal hub · Explore all paths · Continue journey · Sign in |
| **Company** | Belief and business profile · How the ecosystem works · Founders · Founder detail · Partnerships · Contact |
| **Education & Mobility** | Malaysia cinematic journey · Universities · Campus explorer · Six-stage service explanation · Apply · Student sign in |
| **Student workspace** | Home/Journey · Applications · Universities · AI Guides · Profile · Community · Documents |
| **CLASS[Λ] Skill Laboratory** | Cinematic entry · Free masterclass · Venture Builder · Learning journey · Student builders · Product showcase · Product detail · Instructor/reviewer area |
| **CLASS workspace** | Home · Learn · Projects · Evidence · Profile |
| **co.lab** | Cinematic lab · Ventures · Projects · Services · Community · Work/case studies · Event archive · Event detail · ProjectX industry showcase · Project detail |
| **People** | Creators/influencers · Campus chapters/ambassadors/presidents · Approved student builders · Profile detail |
| **Intelligence** | Public Dr. X assistance · Authenticated personal assistant · Co.MPASS demo · Authenticated business workspace |
| **Trust / utility** | Accessibility · Privacy · Terms · Consent controls · Report content · Search · Error/offline/unavailable pages |

Ownership: events and commercial casework under co.lab Work; ProjectX under Projects; creators/ambassadors under scoped community views; CLASS products under the Skill Laboratory with an approved co.lab incubation handoff.

## 13. Continuation without a forced funnel

Never auto-redirect at a chapter ending. Offer one relevant “Continue your story” action, plus stay/back/hub choices.

| Completed context | Relevant continuation | Condition |
|---|---|---|
| Malaysia exploration | Start/continue application | Current supported intake/service path |
| Arrival/student community | Explore skills / meet an approved campus chapter | Available program and opt-in interest |
| CLASS learning/project | Share evidence / submit for review | Work and consent requirements met |
| Venture-ready project | Apply to co.lab Ventures | Explicit review; no automatic certification/funding |
| co.lab event | Meet credited creators / propose a similar project | Published association and permitted work |
| ProjectX website case | Explore same industry / request a project | Honest delivery state and contact route |
| Founder profile | Relevant lab or contact route | Approved public scope |
| Any world | Return to hub / save place / ask Dr. X | No forced account or memory enrollment |

Deep links, browser back and normal menus must work independently of story progress. Carry only permitted preferences/context between namespaces.

## 14. Motion, sound and responsive system

### Motion grammar

**Reveal → select → approach → cross → settle → act → continue.**

Proposed timings: 120–220ms for small feedback; 350–700ms for section transitions; up to 1.2s for optional portal travel. These are design targets to test, not measured outcomes.

- One controlled camera transition at a time.
- Text reaches a stable readable position before action.
- No forced scrolling, uncontrolled zoom, continuous camera roll, looping head bob or scroll traps.
- Reduced motion uses cuts, opacity and unchanged layout.
- Every gesture has visible control/keyboard equivalents.
- Do not make a user finish a movie to find the CTA.
- Sound off by default; user gesture enables it; captions/transcripts for meaningful media.
- Pause unnecessary rendering when hidden or outside view.

### Responsive tiers

1. **Full:** supported capable desktop/tablet — high-quality interactive environments.
2. **Balanced:** target mid-range Android — reduced scene complexity and resolution; selected portal only.
3. **Light:** slower networks, save-data preference or weak GPU — optimized stills/film snippets, readable direct routes.
4. **Reduced-motion / no-WebGL:** static composition with all core routes and tasks preserved.

Detect capability and user preference; do not assume every phone can handle the same scene. Students should not pay a usability penalty for a less capable device.

### Proposed performance acceptance targets

- Core Web Vitals at p75: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, with field evidence when available.
- Route choice and critical copy available before heavy scene downloads.
- Operational dashboard controls remain responsive with 3D paused.
- Target stable ≥30fps on the defined reference mid-range Android for the balanced cinematic tier; record actual device, browser, scene and measurement.
- Progressive loading, capped render resolution and one active heavy renderer.
- Do not claim these numbers were achieved by this document.

## 15. Data, assets and evidence contracts

| Record | Required evidence and controls |
|---|---|
| Founder | Exact approved identity media, biography/mandate owner, likeness/voice permission, public context boundaries |
| Creator/ambassador/student | Consent, owner, verification state, permitted fields, removal/update workflow |
| Product | Problem, stage, dated proof, rights, team and safe links |
| Event/case | Exact client/event attribution, role, dates, licensed media and verified results |
| Campus | Official location, source, imagery/tour coverage, capture date if available, feed rights/freshness |
| Agent/run | Configured capability, identity/role, scope, state, sources, action/approval log and receipt |

Required assets: approved standing founder media; event reels/stills and role evidence; current creator/chapter roster; opted-in student products; approved campus panoramas/coverage; exact logos; final portal environment art; audio rights/captions.

No invented people, awards, success rates, partner logos, live signals, traction or metrics may be used to fill an empty layout.

Preserve unchanged source archives and original assets. Implementation begins on an isolated branch with recoverable checkpoints. Do not replace live routes or publish directories as part of merely approving this design.

## 16. Acceptance gate

10.5/10 is a threshold, not a design score. Every applicable critical check needs fresh final-state evidence.

| Gate | Evidence required | Current status |
|---|---|---|
| Cinematic entry | Rendered mobile/desktop hub; all three portals and direct routes usable | NOT BUILT IN THIS TURN |
| Distinct worlds | Malaysia, CLASS and co.lab scene comparisons against selected visual targets | PENDING |
| Claude fidelity | Original vs final screenshots at matching viewport/state; functional navigation preserved | PENDING RENDERED REVIEW |
| Student login | Real sign-in/session expiry, privacy, tenant/role isolation and returning-user test | UNVERIFIED |
| Journey integrity | Six stages; actual next action, owner and evidence; honest empty/stale states | SOURCE DRIFT TO RESOLVE |
| Founder experience | Exact approved likeness, accessible selector and clearly labelled AI profile interaction | ASSET/IMPLEMENTATION PENDING |
| Directory integrity | Approved roster, consent, search/filter, detail view, no private-record leakage | PENDING |
| Work/events/ProjectX | Accurate role and delivery-state evidence, media rights and safe links | CONTENT VERIFICATION PENDING |
| Campus explorer | Per-campus coverage, tilt opt-in, drag fallback, no false LIVE label | FEASIBILITY PARTLY VERIFIED; INTEGRATION PENDING |
| Intelligence truth | Public/private context boundary; actual run states, failure and approval tests | PENDING |
| Accessibility | Keyboard/screen reader, 200% zoom, contrast, 44px targets, reduced motion | UNTESTED |
| Resilience/performance | Specified phone tests, network/GPU failure, CWV, no blocked task | UNTESTED |
| Story continuity | No forced redirect; deep links/back/hub preserved; no loop trap | PENDING |
| Brand fidelity | Exact assets, palette/type boundaries, current labels and brand checks | PENDING FINAL ARTIFACT |
| Production release | Reviewed change, authorized publication, actual live route and backend smoke checks | NOT REQUESTED / NOT PERFORMED |

Release fails if any critical gate fails or lacks evidence. A build, a screenshot, a successful deployment or a more ambitious specification cannot substitute for the other gates.

## 17. Recommended execution order

Three independent arrival-hub visual concepts were generated in this conversation, grounded in the supplied entry screenshot. Their selection order is the order displayed in chat. They are illustrative design proposals, not rendered implementations, verified geography, exact logo masters or performance evidence. No concept has been selected for implementation yet.

### Builder-check decisions — explicit provisional defaults

A fresh architecture reviewer identified three choices that matter before implementation. These defaults keep the first release within existing authority; they are recommendations, not prior user approvals:

1. **Co.MPASS audience:** first authenticated release is LastBench internal-team use. External businesses receive only an approved synthetic/public demonstration. Customer workspaces and multi-tenant onboarding require a separately approved scope and isolation design.
2. **Accounts:** preserve each verified existing authentication system initially. A shared public profile record does not grant cross-workspace access. Do not migrate accounts or silently merge identities; approve any shared sign-in/linking contract after documenting current providers, roles and recovery behavior.
3. **Spending:** no new paid mapping, AI or media-provider commitment is authorized by this design review. Use existing verified entitlements only within their known limits; keep paid modes off/unconfigured until an actual usage estimate, budget and owner approval exist. No budget is inferred from a free trial or a business subscription.

No further founder decision is required to review this specification. These defaults must be confirmed or changed before the dependent implementation slice.

**NOW:** select and approve one arrival-hub visual direction; define the target phone and build a single verified vertical slice: hub → Malaysia portal → return. Preserve the current site and Claude sources.

**NEXT:** CLASS and co.lab worlds; then the real student portal/authentication and founder selector with approved media.

**PARKED UNTIL THEIR DEPENDENCIES ARE READY:** public people/product rosters, event attribution, live campus feeds and actual Co.MPASS agent operations. Their sitemap and requirements are defined here, so they are not forgotten or duplicated.

Each slice must finish its relevant runtime, visual, navigation, evidence and resilience checks before expanding scope.

## 18. Source register

- Latest matching saved Claude handoff (private source retained by the owner).
- [Original Malaysia / student handoff](https://github.com/lets-colab/LastBenchBd/blob/main/design-source/claude-design/2026-09-08/design_handoff_journey_and_dashboard/README.md).
- [Claude desktop reference](https://github.com/lets-colab/LastBenchBd/blob/main/design-source/claude-design/2026-09-08/Last%20Bench%20Dashboard.dc.html).
- [Claude mobile reference](https://github.com/lets-colab/LastBenchBd/blob/main/design-source/claude-design/2026-09-08/Last%20Bench%20Mobile%20App.dc.html).
- [LastBench website blueprint](https://github.com/lets-colab/LastBenchBd/blob/main/SITE_BLUEPRINT.md).
- [LastBench experience constitution](https://github.com/lets-colab/LastBenchBd/blob/main/design.md).
- [LastBench brand blueprint](https://github.com/lets-colab/LastBenchBd/blob/main/brand/last-bench/BRAND_BLUEPRINT.md).
- [LastBench design tokens](https://github.com/lets-colab/LastBenchBd/blob/main/design-system/tokens.json).
- CLASS current visual source (private source retained by the owner).
- [co.lab brand blueprint](https://github.com/lets-colab/letscolab/blob/main/brand/BRAND_BLUEPRINT.md).
- Recovered 3D decisions (private source retained by the owner).

Current explicit user directions outrank older wording in these references. External mapping capability claims were checked against primary sources on 25 October 2026; campus-specific coverage and production fitness are not established.

