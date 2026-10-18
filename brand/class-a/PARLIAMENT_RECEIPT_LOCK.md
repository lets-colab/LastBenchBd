# CLASS[Λ] — LOCKED Parliament-Themed Payment Receipt

**Owner approval:** 11 October 2026. **Status:** DESIGN LOCKED / PRODUCTION RENDERER NOT YET IMPLEMENTED.
**Receipt-specific precedence:** This lock controls CLASS[Λ] payment-receipt PDF/poster previews, rendering and issuance. The 18 October 2026 general outbound email design lock in BRAND_BLUEPRINT.md controls the *email body*, not the receipt artwork. General guidance must never override this more specific earlier user approval.

## Canonical approved visual evidence

- Source artifact: `Bangladesh Night Payment Receipt Poster.png`, approved 11 October 2026; 1024 × 1536 PNG, SHA-256 `a6e71a9d5478c0de667dceadc4ff9cb4de950df4813f1efbfc5705c69c4fca0b`.
- Source provenance: owner-controlled ChatGPT Library artifact `libfile_4d840e948fb48191bb149891991eae37`. Private design proof: `LastBench_CLASSA_Locked_Design_Internal_Proof.pdf` (Library artifact `libfile_028dc1321e40819194a4de18d602808d`).
- **Privacy:** Original reference contains a former student's identifying information and transaction details. DO NOT embed it as a full background in a new student's receipt; do not put the original personalized image in this public repository. Construct an unpersonalized asset only after private information is removed and inspect the resulting asset for hidden PII.
- The source is a visual reference, not a payment source or authorization to copy former learner details or bypass finance verification.

## Required appearance — not optional

1. Cinematic night imagery of **Bangladesh National Parliament / Jatiya Sangsad Bhaban**, with warm illuminated facade, water reflections, trees and green-accented bench foreground. Preserve the actual approved scene composition; no generic abstract green PDF, no substitute building imagery.
2. Header: approved LAST BENCH bench/arrow mark on the **left**, wordmark on the **right**, with no divider between them; approved tagline. Do not redraw/approximate any logo. Approved CLASS[Λ] identity and AI skills tagline.
3. Upper-right hand-lettered phrase: **From Bangladesh to a Bigger Tomorrow** with green underline.
4. Main heading **Payment Receipt**, white PAYMENT + green RECEIPT, and restrained subtitle for CLASS[Λ] AI Course.
5. Large light/very pale green rounded data card: receipt number, issue date, STUDENT INFORMATION (name, email, registration ID), and COURSE DETAILS (program, accurate mode, verified batch information, organizer).
6. Large deep green rounded PAYMENT DETAILS card: prominent brand-green gross amount, amount in words, transaction reference, transaction date/time including timezone, verified reference/charge only where established, and precisely qualified payment status.
7. Confirmation strip: white/light field with green icon; wording must reflect authoritative registration/payment status, never infer admission from a payment.
8. Lower band: darker lower-left city/trees with **Thank you for being part of Last Bench.** in white handwritten lettering, building/water on right, mission copy, green accent line, and dark footer/contact strip. Preserve the owner's instruction for a **darker lower section/lower-left**.
9. Brand palette **green / black / white**, cinematic Bangladesh setting, matching proportions and balance of approved visual. No visual redesign, no divider added to the header, and no unapproved typography/layout change.

## Dynamic information and financial safeguards

- The original reference is for a different student. **Never reuse its receipt number, date, identity, email, batch date, reference, status, or transaction ID.** Every value must be loaded from the relevant authorized student registration and payment record.
- Gross learner payment is distinct from commission expense. Example: Ashek registration 25 has founder-attested BDT 5,000 course receipt and separate BDT 1,000 commission to Erfan, yielding BDT 4,000 after commission; a student receipt must show **BDT 5,000 gross** and no student discount/refund. Example data are *not* template constants.
- Preserve the `status=verified`, recipient validation, payment reference uniqueness, retry/idempotency, transport, and sent-state checks. The finance contract may require independent provider reconciliation even after founder attestation. A mockup cannot claim it was issued.
- No false 'received and verified' or 'registration now confirmed' text if the authoritative records do not permit those claims. No inferred seat acceptance, schedule, bank reconciliation, fees, recipient phone, or charge.
- No transmission or official receipt numbering until records and PDF artwork pass the real financial/visual/send approval gates.

## Release rule — FAIL CLOSED

The existing `class-a-payment-receipt-worker` currently generates a generic white/green PDF and does not render the approved Parliament design. It MUST NOT issue or email that incorrect PDF. The runtime `PARLIAMENT_RECEIPT_RENDERER_APPROVED` gate remains **false** until all of the following are independently verified:

1. A reusable, PII-free, rights-cleared Parliament/bench background and exact **canonical** Last Bench and CLASS[Λ] logo assets are pinned/validated (fingerprints checked).
2. Renderer creates **data-driven** receipts in the approved locked composition, using learner/transaction fields without flattening former learner PII into the background.
3. Test a representative non-sensitive preview against the 11 October image **visually**, field-by-field, on common PDF viewers and mobile; explicit owner review of exact layout.
4. Prove a verified-payment-only send with correct recipient, real transaction, unique receipt number, attachment, sender, delivery receipt, and no duplicate send. Finance and admission remain distinct.
5. Only then update the hard-coded worker approval gate in a reviewed code change alongside updated tests and signed-off artifacts. Do not toggle an environment variable or skip visual review to circumvent the lock.

**Operational truth:** This file is a durable design contract and fail-closed control. It does **not** claim the new PDF renderer, provider reconciliation, or deployment is finished.


## Non-issuable synthetic layout proof — 19 October 2026

**Development only; still NOT approved for receipts.** The reusable script `scripts/class_a_receipt_design_proof.py` takes **only** an externally supplied privately sanitized Parliament preview with exact SHA-256 `a016f74abf76b2a1d54aeee113ef9c279a8bd21fc231f6b870dbcf326161a60d`. The private image file is deliberately **not** committed. This source checksum is *not* the original owner's source fingerprint above; it covers only the sanitized derivative.

The script overlays fictional learner and registration fields on a separate central region; its header and footer are byte-identical to the sanitized reference and visibly include an immutable `SAMPLE · NOT VALID` marker. Local visual smoke tests generated two different synthetic PNG/PDF variants and compared unchanged header/footer regions; the central fields differed as expected. The proof uses Pillow and local DejaVu fonts. Only two enumerated, wholly fictional fixtures (`alpha` and `beta`) are accepted; there is no free-form learner name, email, registration-ID, payment or transaction input. The script rejects unknown fixtures, wrong reference hash, non-PNG output paths and mismatched dimensions.

**Scope boundary:** The proof is a flattened image PDF, not a searchable/accessibility-reviewed/data-authoritative invoice or receipt. It does not establish artwork rights, an independently reconstructed transparent logo/Parliament art package, real payment validation, live email delivery, finance reconciliation, or user acceptance of the final official PDF. It is not loaded by the Supabase worker. The hard-coded `PARLIAMENT_RECEIPT_RENDERER_APPROVED = false` remains mandatory.

Before production, obtain rights clearance for the original scenic artwork, extract/recreate legally sourced PII-free background assets while using only canonical approved logo files, implement a selectable-text, data-driven official receipt renderer with mandatory transaction validation and safe idempotency, compare it field-by-field with the owner-approved composition, obtain explicit owner sign-off, and test authenticated provider delivery. Do not use a prior student's customized screenshot or change the gate because this proof exists.
