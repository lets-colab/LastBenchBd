#!/usr/bin/env python3
"""Fail-closed source regression checks for CLASS[Λ] receipt worker.
Run: python3 scripts/verify_class_a_receipt_safety.py
This is static coverage, not a live provider delivery test.
"""
from pathlib import Path

source = Path("supabase/functions/class-a-payment-receipt-worker/index.ts").read_text(encoding="utf-8")
checks = {
    "specific Parliament design hard gate": 'const PARLIAMENT_RECEIPT_RENDERER_APPROVED = false;',
    "worker blocks wrong receipt PDF": 'blocked:"parliament_receipt_template_not_implemented"',
    "worker links receipt visual contract": 'PARLIAMENT_RECEIPT_LOCK.md',
    "worker gate before payment claiming": 'if (!PARLIAMENT_RECEIPT_RENDERER_APPROVED)',
    "only verified payments": '.eq("status","verified")',
    "only unsent receipts": '.in("receipt_status",["pending","failed"])',
    "claim uses unsent filter": '.in("receipt_status",["pending","failed"])\n      .select("id")',
    "no transport means no sending": 'blocked:"missing_email_transport"',
    "requires canonical logo": 'canonical_brand_logo_unavailable',
    "requires genuine course registration": 'ineligible_course_registration',
    "email includes PDF attachment": 'attachments:[{filename:',
    "provider receipt persisted": 'receipt_external_ref:ref',
    "branded receipt header": 'OFFICIAL PAYMENT RECEIPT',
    "data driven receipt rows": '["RECEIPT NUMBER",input.receiptNumber]',
    "no synthetic signatures": 'No signature or seal implied.',
    "long fields fail closed": 'receipt_field_too_long:',
    "provider ID required": 'provider_receipt_id_missing_delivery_uncertain',
    "ambiguous delivery never retried": 'receipt_status:uncertain?"processing":"failed"',
    "sent record checked": 'if(recordError||!recorded)',
    "failures recorded": 'event_type:"receipt_failed"',
}
for label, needle in checks.items():
    if needle not in source:
        raise SystemExit(f"FAIL: {label}")
print(f"PASS: {len(checks)} receipt source invariants (static only)")

# Receipt-specific visual lock must override generic email branding.
brand = Path("brand/class-a/BRAND_BLUEPRINT.md").read_text(encoding="utf-8")
receipt_lock = Path("brand/class-a/PARLIAMENT_RECEIPT_LOCK.md").read_text(encoding="utf-8")
for label,haystack,needle in [
    ("email blueprint receipt override",brand,"PARLIAMENT_RECEIPT_LOCK.md"),
    ("locked Parliament building",receipt_lock,"Jatiya Sangsad Bhaban"),
    ("owner approved source fingerprint",receipt_lock,"a6e71a9d5478c0de667dceadc4ff9cb4de950df4813f1efbfc5705c69c4fca0b"),
    ("do not reuse learner PII",receipt_lock,"Never reuse its receipt number"),
    ("renderer still blocked pending visual QA",receipt_lock,"PARLIAMENT_RECEIPT_RENDERER_APPROVED"),
]:
    if needle.casefold() not in haystack.casefold():
        raise SystemExit(f"FAIL: {label}")
print("PASS: receipt-specific Parliament design lock and fail-closed gate")
