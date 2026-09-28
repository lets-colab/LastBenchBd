# CLASS[Λ] signup funnel

Three date-free conversion routes share one cinematic design, motion and registration system:

- `/class-a/` — entry hub for choosing the free masterclass or full course.
- `/class-a/masterclass.html` — free CLASS[Λ] Masterclass / Class 0 invitation and registration.
- `/class-a/pass.html` — private-code attendee surface for schedule, Calendar, Meet entry and live attendance proof.
- `/class-a/live-control.html` — staff-only live control for issuing temporary BUILD attendance codes.
- `/class-a/checkin.html` — retained legacy/manual staff check-in fallback.
- `/class-a/course.html` — paid 20-Class One-Person Venture Builder registration.

## Product contract

- Masterclass is explicitly **FREE** and requests no payment.
- Full course is **৳5,000** and captures an application only; payment is handled separately.
- The full course presents all 20 classes and all 20 proof-of-work outputs.
- All pages cross-link through the same `CLASS[Λ] · ACQUIRE. APPLY. ADVANCE.` system.
- No dates are hardcoded.
- Motion is lightweight, progressively enhanced and disabled for reduced-motion users.
- Person/program identity remains in `public.class_a_registrations`; recurring live-masterclass participation uses a separate session-enrollment layer.
- The online masterclass registers through a controlled Supabase RPC; the paid-course form keeps its existing registration route.
- Static Netlify form markup remains present as a no-JavaScript fallback and deploy-time form declaration.

## Data contract

Table: `public.class_a_registrations`

- Masterclass `program`: `masterclass`
- Full course `program`: `course`
- Source values include historical cinematic sources, `class-a-cinematic-course`, and the current online masterclass source `class-a-online-masterclass-v1`.
- `record_kind`: `genuine` | `test` | `internal_test`
- Only `record_kind='genuine'` belongs in learner/lead, CRM-linkage, confirmation and attendance KPI populations.
- `test` and `internal_test` rows remain in Supabase for auditability but are excluded from learner/lead metrics and CRM creation.
- Each Supabase registration ID remains an event identity. CRM person identity is deduplicated by normalized email, so repeat registrations may point to one HubSpot contact.

The browser uses the project’s publishable key. RLS permits validated inserts for `anon` and `authenticated` while preventing public row reads. Public form submissions default to `record_kind='genuine'`; known test/internal verification submissions must be reclassified in the canonical Supabase row rather than deleted or hidden in a parallel ledger.

These files are copied into the production artifact by `scripts/build-site.mjs`.


## Cinematic masterclass contract

The free masterclass route uses the approved builders reel as Scene 01.

- `ACCEPT INVITATION` starts the source reel immediately with sound after the user gesture.
- Desktop/laptop playback is edge-to-edge full-screen; mobile remains full-screen.
- The reel is intentionally cut at the final CLASS[Λ] lockup (`26.88s`), before the Last Bench end card in the source media.
- The exact locked CLASS[Λ] logo asset holds briefly on black, then the live website is revealed.
- Last Bench ownership appears only after the cinematic handoff, as secondary ecosystem attribution.
- The conversion hierarchy is: 0.01% invitation → cinematic intro → outcome hero → six-part operating journey → invitation acceptance → registration → personal pass.
- The duplicated six-card manifesto was removed; the full 20-class program is a secondary footer route, not a competing hero action.


## Impeccable quality floor

The CLASS[Λ] web system uses the repository Impeccable detector as a bounded visual-quality gate. The current masterclass, course, hub, and staff check-in surfaces are expected to remain free of detector findings for: overused typography, undersized functional text, excessive tracking, decorative grid fields, green ambient glow, low-contrast text, and layout-triggering width animation. Protected brand assets remain deterministic and unchanged.

Regression tests in `tests/class-a-funnel.test.ts` lock the cinematic hierarchy and the known Impeccable quality regressions before release.

Production smoke fingerprints track the distilled CLASS[Λ] copy and staff check-in hierarchy so post-deploy verification tests the current interface rather than superseded wording.


## Online masterclass operating contract

The free masterclass is now modeled as a recurring online session rather than a one-time physical check-in.

Canonical data:
- `public.class_a_sessions` — session schedule, Google Meet URL, recording/transcript references and analysis state.
- `public.class_a_session_enrollments` — one person's enrollment in one live session, recording-consent evidence, the short-lived WhatsApp-follow unlock gate and (after release) their hashed personal pass.
- `public.class_a_session_attendance_evidence` — evidence ledger for `portal_open`, `join_click`, `live_code`, future Meet reports and staff evidence.
- `public.class_a_session_notifications` — outbox for confirmation, calendar, 24-hour reminder, 6-hour reminder, room-open and post-class follow-up.
- `public.class_a_live_checkin_codes` — short-lived instructor BUILD codes.

Consent law:
- Online enrollment requires explicit acceptance that the live session may be recorded/transcribed for learning and quality improvement.
- That acceptance is stored as `recording_consent_at` on the session enrollment.
- Recording/transcription acceptance does **not** grant permission to publish the attendee's image, voice, words or testimonial for marketing.

WhatsApp follow gate:
- Registration reserves the session enrollment but the gated registration RPC does **not** return a pass code.
- The attendee opens the official <CLASS[Λ]> | LEARN AI WhatsApp Channel, then returns and explicitly self-attests that they followed it.
- WhatsApp does not expose a per-person follow callback to this site, so `channel_follow_self_attested_at` is self-attested evidence, not verified WhatsApp platform evidence.
- Only the one-time unlock RPC releases a fresh personal pass code after that self-attestation.
- Unlock tokens are hashed at rest and expire after 30 minutes.

Evidence law:
- Opening a pass is not attendance.
- Clicking Join is not attendance.
- Verified online attendance requires the attendee's private pass plus a currently valid live BUILD code, or a future trusted Meet/staff evidence source.
- Historical September attendance is never backfilled or inferred from registration.

Session activation:
- The seeded `class-0-online-next` session stays `planning` until a real date/time and Google Meet URL are set.
- Scheduling the session automatically calculates pending 24-hour, 6-hour, 15-minute room-open and post-class notification due times.
- The notification table is an outbox, not proof that a WhatsApp/email/calendar message was delivered. Delivery workers must write delivery evidence back before a notification becomes `sent`.

Public browser access is capability-bounded through reviewed RPCs; the underlying session, enrollment, attendance-evidence and notification tables remain direct-read/write denied to `anon` and `authenticated`.
