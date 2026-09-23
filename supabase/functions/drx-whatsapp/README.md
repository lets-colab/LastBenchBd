# DR.X WhatsApp Adapter — Last Bench

Status: release candidate, **disabled by default**.

This Edge Function connects the official Meta WhatsApp Business Platform to the restricted Last Bench agent boundary. It is transport/runtime code, not a new chatbot brain.

## Required order

1. Review and apply `drizzle/0006_drx_channel_convergence.sql`.
2. Deploy this function with JWT verification disabled only because Meta webhooks use their own challenge + HMAC authentication.
3. Configure provider/gateway secrets outside GitHub.
4. Insert the exact WhatsApp `phone_number_id` into `drx_channel_accounts` with `project_namespace='last-bench'`, `enabled=false`, `kill_switch=true`.
5. Complete Meta webhook verification.
6. Run signed sandbox fixtures while the global kill switch is ON.
7. Enable the account only for a controlled test.
8. Keep `DRX_WHATSAPP_SEND_ENABLED=false` until receive/idempotency/CRM/handoff evidence is verified.
9. Turn sends on only for an approved test contact.
10. Run the acceptance suite in the Erfan Second Brain before production promotion.

## Environment / secret contract

Never commit values.

- `DRX_WHATSAPP_GLOBAL_KILL_SWITCH` — defaults to ON when absent.
- `DRX_WHATSAPP_SEND_ENABLED` — defaults to OFF when absent.
- `DRX_GATEWAY_BASE_URL` — must be HTTPS.
- `DRX_GATEWAY_API_KEY` — DR.X Gateway API key.
- `WHATSAPP_GRAPH_API_VERSION` — explicitly configured supported Meta Graph version.
- `WHATSAPP_ACCESS_TOKEN` — optional Edge secret; otherwise Vault key `drx_whatsapp_access_token`.
- `META_APP_SECRET` — optional Edge secret; otherwise Vault key `drx_social_meta_app_secret`.
- `META_VERIFY_TOKEN` — optional Edge secret; otherwise Vault key `drx_social_meta_verify_token`.

Supabase admin credentials are supplied by the Edge runtime and must never be logged.

## Safety properties

- signed webhook verification before processing;
- exact provider account -> `last-bench` project binding;
- default-off receive/send gates;
- contact/lead consent state preserved;
- inbound WhatsApp creates or resolves a canonical `lastbench_leads` record;
- imported contacts remain `unknown` until consent evidence or user-initiated service-window evidence exists;
- exact provider message ID is the idempotency key;
- existing human-owned/blocked conversations do not silently return to AI;
- current-message lock is rechecked before send;
- high-risk requests and unsupported media go to human escalation;
- DR.X Gateway is the only AI path; the adapter contains no direct OpenAI/Anthropic fallback;
- gateway unavailable -> human queue + deterministic acknowledgement when sending is safely enabled;
- ambiguous external send failures are not auto-retried;
- outbound result state is not promoted beyond evidence exposed by Meta.

## CRM semantics

`lastbench_leads` is the canonical server-owned lead pipeline.

Homepage signups are projected into it as `opted_in` because the public form contains explicit contact consent. Spreadsheet/manual imports must enter with `contact_consent_state='unknown'` unless separate consent evidence exists.

An inbound WhatsApp message can create a service-window relationship for that conversation, but does not silently convert an unknown imported lead into permanent campaign opt-in.

## Production boundary

Do not call this production-ready because the function or migration exists. Promotion requires final deployed evidence for signature rejection, exact account mapping, duplicate delivery, consent blocking, kill switches, gateway routing, bounded CRM writes, human handoff, real sandbox send, and regression tests.
