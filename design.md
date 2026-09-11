# Last Bench — Product & Experience Design Constitution

> Read `PRODUCT.md`, `FOUNDATION_LOCK.md`, the canonical brand system, and this document together. If they conflict, current verified business/product truth and locked brand assets win over older mockups or historical design notes.

## 1. Product identity

**Category:** Student Accelerator · technology-enabled journey platform  
**Launch corridor:** Bangladesh → Malaysia  
**Current public promise:** **Helping Bangladeshi students study, settle and succeed in Malaysia.**

Last Bench is not positioned as a traditional education consultancy. It should feel like a transparent, human-supported journey system that makes a life-changing process visible, understandable and trackable.

The wider blueprint has three engines, but they are deliberately sequenced:

1. **Last Bench — Trust / Mobility**: direction, university selection, admissions, visa guidance, pre-departure, arrival, settlement and community.
2. **CLASS[Λ] — Capability**: AI, content, branding, attention and proof-of-work.
3. **co.lab — Ownership**: venture validation, automation and market launch.

The main Last Bench website must lead with the mobility promise. CLASS[Λ] and co.lab are progression wings, not competing primary CTAs for a student who arrived to understand Malaysia study options.

---

## 2. Design principles

| Principle | Meaning | Experience rule |
|---|---|---|
| **Clarity first** | A student should always understand where they are and what comes next. | Show current stage, next milestone, accountable owner and evidence. |
| **Truth builds trust** | Never make an uncertain process look guaranteed. | Label what is verified, what can change and what requires official confirmation. |
| **Outcomes over admissions** | Admission is not the finish line. | Design through pre-departure, arrival, settlement and community. |
| **Community before consultancy** | The relationship should compound rather than end at transaction. | Make belonging, peer support and post-arrival continuity visible. |
| **Technology serves humans** | AI and automation support judgment; they do not fabricate certainty. | Escalate high-stakes choices to humans and show reasoning/evidence. |
| **Mobile first** | The primary audience often uses mid-range Android phones and variable connections. | Large touch targets, progressive enhancement, restrained payloads, graceful fallback. |
| **One journey, one truth** | Website, Journey OS, operations and partner channels must not tell different stories. | Use the same stage vocabulary and verified data contract everywhere. |

---

## 3. Canonical mobility journey

The public website and Journey OS share one six-stage model:

| Stage | Student question | Core output |
|---|---|---|
| **01 Discover** | What is realistic for me? | Goals, profile, budget, intake and constraints |
| **02 Match** | Which options fit? | Realistic courses and institutions |
| **03 Apply** | What must be submitted? | Documents, application and offer workflow |
| **04 Secure** | What must be confirmed? | Visa/EMGS, payments and financial readiness |
| **05 Prepare** | Am I ready to leave? | Travel, documentation and pre-departure checklist |
| **06 Arrive** | What happens after landing? | Settlement, community and first practical steps |

**System rule:** every person has a current stage, next milestone, accountable owner and verified proof/evidence.

Do not create a second competing stage taxonomy in marketing copy, dashboards, AI prompts or partner tools without an explicit migration plan.

---

## 4. Current support systems

The current mobility experience may describe these public support areas:

- Malaysia university selection based on profile, course, budget and intake.
- Admissions/application support and required documentation.
- Visa/EMGS process guidance and document preparation.
- Scholarship, rebate or funding-route verification where currently available.
- Pre-departure preparation.
- Practical settlement and community support after arrival.

### Trust language

Use wording such as:

- “current options”
- “subject to university eligibility and approval”
- “verify the latest requirement”
- “guidance and document support”

Avoid wording that implies:

- guaranteed visa approval
- guaranteed scholarship percentage
- guaranteed admission
- permanent/unchanging tuition or intake data
- a formal university partnership merely because a university appears in an explorer or comparison surface

---

## 5. Website information architecture

The public homepage should perform one job: turn uncertainty into the next credible action.

### Homepage sequence

1. **Emotional truth** — Bangladesh → Malaysia; the starting point is not the ceiling.
2. **Product truth** — Last Bench is the student accelerator supporting Study → Settle → Succeed.
3. **Journey clarity** — Discover → Match → Apply → Secure → Prepare → Arrive.
4. **Explore** — compare/research Malaysian university options with an explicit verification/partnership disclosure.
5. **Convert** — Start My Journey / Take Your Seat.
6. **Continue** — existing users open the Journey OS to track their progress.
7. **Beyond arrival** — Settle → Belong → Progress → Return.
8. **Secondary partner path** — tutors, coaching/IELTS centers, counsellors and education partners may enquire without turning the student homepage into an agent-recruitment page.

### CTA hierarchy

**Primary:** Start My Journey  
**Secondary:** Open Journey OS / Track My Journey  
**Tertiary:** Talk to a human / partner enquiry  
**Progression-only:** CLASS[Λ], then co.lab when an active handoff is relevant.

The main mobility hero must not lead with CLASS[Λ] or co.lab.

---

## 6. Journey OS

The Journey OS is the operational product layer behind the promise. Student, family, counselor and operations should converge on the same next step, owner, status and evidence.

### Student home

Prioritize:

- current journey stage
- next milestone
- blocking requirements
- accountable human/team owner
- last verified update
- evidence/documents attached to the milestone
- quick action to resolve the next blocker

Avoid dashboard vanity metrics that do not help the student decide or act.

### Application management

Each application should expose:

- university + programme
- current stage
- required documents
- verified submission/offer/visa evidence
- last update source and timestamp
- mentor/operations owner
- next action

### Document system

Private student documents belong in the approved authenticated storage path. UI must communicate upload state, access boundaries and verification state clearly. Never expose private URLs or student PII in public surfaces or logs.

---

## 7. Bench AI

Bench AI is a guidance layer, not an admissions oracle.

It may:

- explain the six-stage journey
- help structure a university shortlist
- compare profile, budget and intake constraints
- explain common process concepts
- identify missing questions/documents
- route to the Journey OS
- escalate to a human

It must not invent:

- current fee amounts
- visa probability
- scholarship percentages
- entry requirements
- university partnership status
- application status

High-stakes guidance should identify what requires current official verification and where human judgment is needed.

---

## 8. University explorer

The university explorer is a **research and orientation surface** unless a specific relationship is separately verified.

Each university card or detail should distinguish:

- relatively stable descriptive data (name, location, institution type)
- programme discovery data
- volatile data requiring verification (fees, intakes, English requirements, scholarships, admissions criteria)
- Last Bench relationship status, only when a verified partner record exists

Never infer “partner university” from inclusion in the dataset.

Longer term, replace duplicated hard-coded marketing data with a single versioned university data service carrying source, `verified_at`, volatility and relationship-status fields.

---

## 9. Beyond arrival

Admission is only the beginning. The post-arrival experience follows:

**SETTLE → BELONG → PROGRESS → RETURN**

- **Settle:** practical first steps and local orientation.
- **Belong:** peer support, events and trusted community.
- **Progress:** relevant capability pathways when active.
- **Return:** stories, referrals, mentoring and opportunity.

Community after arrival is part of the current Last Bench promise. Progression into CLASS[Λ] or co.lab must be shown as an available/active next pathway, not as a guaranteed outcome of mobility.

---

## 10. Partner experience

Tutors, coaching/IELTS centers, counsellors and education partners can be a distribution/referral channel, but the public student experience stays student-first.

Partner tooling can include:

- onboarding and verification
- referral attribution
- referred-student visibility subject to consent/privacy rules
- approved campaign/offer material
- commission status under a current signed commercial model
- payout workflow with auditable status

Do not expose a fixed commission model publicly unless the current agreement and eligibility rules are verified and approved for publication.

---

## 11. Brand system — fixed

### Canonical colors

| Token | Value | Use |
|---|---|---|
| Brand Green | `#00C853` | progress, primary CTA, brand signal |
| Brand Green Dark/Bright | `#00E676` | active accents, focus, luminous progress |
| Charcoal | `#111111` | structural dark |
| Warm White | `#FAFAF8` | trust/light surfaces |
| Sage Green | `#E6F2E9` | supporting light surface |
| Gray | `#6B6F76` | secondary copy |
| Soft Gray | `#A1A1AA` | tertiary copy |

The historical teal palette (`#0a7ea4`) is **not** the current Last Bench brand palette and must not be reintroduced as a primary identity color.

### Typography

- Display: approved General Sans / cinematic display treatment from the canonical Last Bench system.
- Body: Sora.
- Bangla: use a legible approved Bangla fallback/treatment without changing the Latin brand marks.

### Logo

Canonical logo files under `assets/branding/` are immutable assets. Never approximate, redraw, trace, recolor or generate a substitute bench/tick mark.

### Visual law

**Dark for emotion. White for trust. Green for progress.**

Avoid generic education-agency stock photography, trust-badge clutter, WhatsApp-button spam, generic SaaS card grids and charity/pity framing.

---

## 12. Accessibility and resilience

- Minimum 44×44px interactive targets.
- Visible keyboard focus.
- Do not use color as the sole state indicator.
- WCAG AA contrast for functional/body text.
- Respect `prefers-reduced-motion`.
- Core conversion and journey explanation must remain understandable if 3D/WebGL fails.
- Avoid making a user wait for decorative assets before they can understand or act.
- Preserve usable behavior on narrow Android viewports and variable connections.

---

## 13. Evidence-driven product rule

The blueprint’s north star is not traffic or applications alone. The product should measure **people reaching the next meaningful stage with verified evidence and accountable ownership**.

For every new feature ask:

1. What journey stage does this serve?
2. What is the next meaningful action?
3. Who owns the outcome?
4. What evidence proves it happened?
5. Does the user need this now, or is it future-blueprint complexity?

If those answers are unclear, do not add the feature to the primary student journey yet.
