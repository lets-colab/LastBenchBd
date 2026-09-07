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
