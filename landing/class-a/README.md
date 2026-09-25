# CLASS[Λ] signup funnel

Three date-free conversion routes share one cinematic design, motion and registration system:

- `/class-a/` — entry hub for choosing the free masterclass or full course.
- `/class-a/masterclass.html` — free CLASS[Λ] Masterclass / Class 0 registration.
- `/class-a/course.html` — paid 20-Class One-Person Venture Builder registration.

## Product contract

- Masterclass is explicitly **FREE** and requests no payment.
- Full course is **৳5,000** and captures an application only; payment is handled separately.
- The full course presents all 20 classes and all 20 proof-of-work outputs.
- All pages cross-link through the same `CLASS[Λ] · ACQUIRE. APPLY. ADVANCE.` system.
- No dates are hardcoded.
- Motion is lightweight, progressively enhanced and disabled for reduced-motion users.
- Both registration forms use the same Supabase table and RLS-protected insert route.
- Static Netlify form markup remains present as a no-JavaScript fallback and deploy-time form declaration.

## Data contract

Table: `public.class_a_registrations`

- Masterclass `program`: `masterclass`
- Full course `program`: `course`
- Source values: `class-a-cinematic-masterclass`, `class-a-cinematic-course`

The browser uses the project’s publishable key. RLS permits validated inserts for `anon` and `authenticated` while preventing public row reads.

These files are copied into the production artifact by `scripts/build-site.mjs`.


## Cinematic masterclass contract

The free masterclass route uses the approved builders reel as Scene 01.

- `ENTER EXPERIENCE` starts the source reel immediately with sound after the user gesture.
- Desktop/laptop playback is edge-to-edge full-screen; mobile remains full-screen.
- The reel is intentionally cut at the final CLASS[Λ] lockup (`26.88s`), before the Last Bench end card in the source media.
- The exact locked CLASS[Λ] logo asset holds briefly on black, then the live website is revealed.
- Last Bench ownership appears only after the cinematic handoff, as secondary ecosystem attribution.
- The conversion hierarchy is: cinematic intro → outcome hero → six-part operating journey → final seat CTA → registration.
- The duplicated six-card manifesto was removed; the full 20-class program is a secondary footer route, not a competing hero action.


## Impeccable quality floor

The CLASS[Λ] web system uses the repository Impeccable detector as a bounded visual-quality gate. The current masterclass, course, hub, and staff check-in surfaces are expected to remain free of detector findings for: overused typography, undersized functional text, excessive tracking, decorative grid fields, green ambient glow, low-contrast text, and layout-triggering width animation. Protected brand assets remain deterministic and unchanged.
