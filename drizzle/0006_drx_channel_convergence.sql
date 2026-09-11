-- DR.X channel convergence foundation
-- Additive only. Does not alter existing product/auth tables.
-- All tables are server-owned and default-deny under RLS.

BEGIN;

CREATE TABLE IF NOT EXISTS public.drx_channel_accounts (
  account_key text PRIMARY KEY,
  transport text NOT NULL CHECK (transport IN ('whatsapp','instagram','web','app','messenger')),
  provider_account_id text NOT NULL,
  project_namespace text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  kill_switch boolean NOT NULL DEFAULT true,
  human_owner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transport, provider_account_id)
);

CREATE TABLE IF NOT EXISTS public.drx_channel_contacts (
  contact_key text PRIMARY KEY,
  project_namespace text NOT NULL,
  transport text NOT NULL CHECK (transport IN ('whatsapp','instagram','web','app','messenger')),
  provider_contact_id text NOT NULL,
  phone_e164 text,
  display_name text,
  consent_state text NOT NULL DEFAULT 'unknown'
    CHECK (consent_state IN ('opted_in','service_window','unknown','opted_out')),
  opt_in_source text,
  opt_in_at timestamptz,
  opted_out_at timestamptz,
  last_inbound_at timestamptz,
  service_window_expires_at timestamptz,
  human_owner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_namespace, transport, provider_contact_id)
);

CREATE TABLE IF NOT EXISTS public.drx_channel_conversations (
  conversation_key text PRIMARY KEY,
  project_namespace text NOT NULL,
  transport text NOT NULL CHECK (transport IN ('whatsapp','instagram','web','app','messenger')),
  account_key text NOT NULL REFERENCES public.drx_channel_accounts(account_key) ON DELETE RESTRICT,
  contact_key text NOT NULL REFERENCES public.drx_channel_contacts(contact_key) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','human','closed','blocked')),
  latest_inbound_provider_id text,
  latest_outbound_provider_id text,
  latest_inbound_at timestamptz,
  latest_outbound_at timestamptz,
  lock_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_key, contact_key)
);

CREATE TABLE IF NOT EXISTS public.drx_channel_messages (
  message_key text PRIMARY KEY,
  conversation_key text NOT NULL REFERENCES public.drx_channel_conversations(conversation_key) ON DELETE RESTRICT,
  transport text NOT NULL CHECK (transport IN ('whatsapp','instagram','web','app','messenger')),
  provider_message_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  message_type text NOT NULL DEFAULT 'text',
  body_text text,
  body_hash text NOT NULL,
  provider_timestamp timestamptz,
  state text NOT NULL DEFAULT 'received'
    CHECK (state IN ('received','processing','processed','blocked','queued_human','send_claimed','sent','failed')),
  failure_code text,
  gateway_evidence_id text,
  route_provider text,
  trace jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transport, provider_message_id)
);

CREATE TABLE IF NOT EXISTS public.drx_channel_escalations (
  escalation_id text PRIMARY KEY,
  project_namespace text NOT NULL,
  conversation_key text NOT NULL REFERENCES public.drx_channel_conversations(conversation_key) ON DELETE RESTRICT,
  contact_key text NOT NULL REFERENCES public.drx_channel_contacts(contact_key) ON DELETE RESTRICT,
  reason text NOT NULL,
  summary text NOT NULL,
  last_inbound_message_key text REFERENCES public.drx_channel_messages(message_key) ON DELETE RESTRICT,
  recommended_owner text,
  priority text NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine','soon','urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','claimed','resolved','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Explicitly default-deny public access. Edge/server runtimes use privileged server credentials.
ALTER TABLE public.drx_channel_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drx_channel_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drx_channel_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drx_channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drx_channel_escalations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.drx_channel_accounts FROM anon, authenticated;
REVOKE ALL ON TABLE public.drx_channel_contacts FROM anon, authenticated;
REVOKE ALL ON TABLE public.drx_channel_conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.drx_channel_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.drx_channel_escalations FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_drx_channel_contact_lookup
  ON public.drx_channel_contacts(project_namespace, transport, provider_contact_id);
CREATE INDEX IF NOT EXISTS idx_drx_channel_conversation_contact
  ON public.drx_channel_conversations(contact_key, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_drx_channel_message_conversation
  ON public.drx_channel_messages(conversation_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drx_channel_escalation_status
  ON public.drx_channel_escalations(status, priority, created_at);

-- Address the two performance-advisor opportunities already recorded in MIGRATION_STATUS.md.
CREATE INDEX IF NOT EXISTS idx_drx_social_inbound_campaign_id
  ON public.drx_social_inbound_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_drx_social_send_campaign_id
  ON public.drx_social_send_ledger(campaign_id);

COMMIT;
