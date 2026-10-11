#!/usr/bin/env python3
"""Fail-closed source regression checks for CLASS[Λ] receipt worker.
Run: python3 scripts/verify_class_a_receipt_safety.py
This is static coverage, not a live provider delivery test.
"""
from pathlib import Path

source = Path("supabase/functions/class-a-payment-receipt-worker/index.ts").read_text(encoding="utf-8")
checks = {
    "only verified payments": '.eq("status","verified")',
    "only unsent receipts": '.in("receipt_status",["pending","failed"])',
    "claim uses unsent filter": '.in("receipt_status",["pending","failed"])\n      .select("id")',
    "no transport means no sending": 'blocked:"missing_email_transport"',
    "requires canonical logo": 'canonical_brand_logo_unavailable',
    "requires genuine course registration": 'ineligible_course_registration',
    "email includes PDF attachment": 'attachments:[{filename:',
    "provider receipt persisted": 'receipt_external_ref:ref',
    "provider ID required": 'provider_receipt_id_missing_delivery_uncertain',
    "ambiguous delivery never retried": 'receipt_status:uncertain?"processing":"failed"',
    "sent record checked": 'if(recordError||!recorded)',
    "failures recorded": 'event_type:"receipt_failed"',
}
for label, needle in checks.items():
    if needle not in source:
        raise SystemExit(f"FAIL: {label}")
print(f"PASS: {len(checks)} receipt source invariants (static only)")
