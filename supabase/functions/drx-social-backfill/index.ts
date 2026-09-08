import { createClient } from 'npm:@supabase/supabase-js@2.115.0'

const PRIVATE_REPLY_WINDOW_HOURS = 167
const RECENT_COMMENT_SAFETY_MINUTES = 15
const MAX_MEDIA_CHOICES = 50
const MAX_COMMENT_PAGES = 10
const MAX_COMMENTS_SCANNED = 1000
const MAX_SENDS_PER_RUN = 25

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'pragma': 'no-cache',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
}

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-content-type-options': 'nosniff',
}

type Media = {
  id: string
  caption?: string
  timestamp?: string
  permalink?: string
  media_type?: string
}

type InstagramComment = {
  id: string
  text?: string
  timestamp?: string
  username?: string
}

type RuntimeConfig = {
  api_base: string
  api_version: string
  configured_at: string | null
}

type Account = {
  account_id: string
  username: string | null
  project_namespace: string
}

type Campaign = {
  campaign_id: string
  account_id: string
  project_namespace: string
  keyword: string
  first_message: string
  template_version: string
}

type BackfillContext = {
  runtime: RuntimeConfig
  account: Account
  campaign: Campaign
  accessToken: string
}

type CandidateScan = {
  media: Media
  totalScanned: number
  keywordMatches: number
  outsideWindow: number
  tooRecent: number
  alreadyInLedger: number
  candidates: InstagramComment[]
  truncated: boolean
}

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const secretJson = Deno.env.get('SUPABASE_SECRET_KEYS')
  const legacySecret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const secret = secretJson ? JSON.parse(secretJson)['default'] : legacySecret
  if (!url || !secret) throw new Error('supabase_admin_credentials_missing')
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function getSecret(db: ReturnType<typeof adminClient>, name: string) {
  const { data, error } = await db.rpc('drx_social_get_secret', { p_name: name })
  if (error) throw new Error(`secret_read:${name}`)
  return data as string | null
}

async function validSetupToken(db: ReturnType<typeof adminClient>, token: string) {
  if (!token) return false
  const tokenHash = await sha256Hex(token)
  const { data, error } = await db
    .from('drx_social_setup_tokens')
    .select('expires_at,used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error || !data || data.used_at) return false
  return new Date(data.expires_at).getTime() > Date.now()
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] as string)
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

function graphUrl(base: string, version: string, path: string, params: Record<string, string>) {
  const normalizedBase = base.replace(/\/$/, '')
  const url = new URL(`${normalizedBase}/${encodeURIComponent(version)}/${path.replace(/^\//, '')}`)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return url
}

async function graphGet(
  url: URL,
  accessToken: string,
  allowedOrigin: string,
): Promise<Record<string, unknown>> {
  if (url.origin !== allowedOrigin) throw new Error('graph_pagination_origin_rejected')
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) {
    const error = payload.error as Record<string, unknown> | undefined
    const code = typeof error?.code === 'number' ? `meta_${error.code}` : `meta_http_${response.status}`
    throw new Error(code)
  }
  return payload
}

async function listMedia(context: BackfillContext) {
  const allowedOrigin = new URL(context.runtime.api_base).origin
  const initialUrl = graphUrl(
    context.runtime.api_base,
    context.runtime.api_version,
    `${encodeURIComponent(context.account.account_id)}/media`,
    {
      fields: 'id,caption,timestamp,permalink,media_type',
      limit: String(MAX_MEDIA_CHOICES),
    },
  )
  const payload = await graphGet(initialUrl, context.accessToken, allowedOrigin)
  return ((payload.data ?? []) as Media[]).filter((item) => item?.id).slice(0, MAX_MEDIA_CHOICES)
}

async function fetchComments(context: BackfillContext, mediaId: string) {
  const allowedOrigin = new URL(context.runtime.api_base).origin
  let nextUrl: URL | null = graphUrl(
    context.runtime.api_base,
    context.runtime.api_version,
    `${encodeURIComponent(mediaId)}/comments`,
    { fields: 'id,text,timestamp,username', limit: '100' },
  )
  const comments: InstagramComment[] = []
  let pageCount = 0
  let truncated = false

  while (nextUrl && pageCount < MAX_COMMENT_PAGES && comments.length < MAX_COMMENTS_SCANNED) {
    const payload = await graphGet(nextUrl, context.accessToken, allowedOrigin)
    const page = ((payload.data ?? []) as InstagramComment[]).filter((item) => item?.id)
    comments.push(...page.slice(0, MAX_COMMENTS_SCANNED - comments.length))
    pageCount += 1

    const paging = payload.paging as Record<string, unknown> | undefined
    const next = typeof paging?.next === 'string' ? paging.next : null
    if (!next) {
      nextUrl = null
    } else {
      const candidate = new URL(next)
      if (candidate.origin !== allowedOrigin) throw new Error('graph_pagination_origin_rejected')
      nextUrl = candidate
    }
  }

  if (nextUrl || comments.length >= MAX_COMMENTS_SCANNED) truncated = true
  return { comments, truncated }
}

async function loadContext(db: ReturnType<typeof adminClient>): Promise<BackfillContext> {
  const [{ data: runtime, error: runtimeError }, { data: accounts, error: accountError }, accessToken] = await Promise.all([
    db.from('drx_social_runtime_config').select('api_base,api_version,configured_at').eq('id', 1).single(),
    db.from('drx_social_accounts').select('account_id,username,project_namespace').limit(1),
    getSecret(db, 'drx_social_meta_access_token'),
  ])

  if (runtimeError || !runtime?.configured_at || accountError || !accounts?.length || !accessToken) {
    throw new Error('meta_authorization_not_configured')
  }

  const account = accounts[0] as Account
  const { data: campaigns, error: campaignError } = await db
    .from('drx_social_campaigns')
    .select('campaign_id,account_id,project_namespace,keyword,first_message,template_version')
    .eq('account_id', account.account_id)
    .eq('project_namespace', account.project_namespace)
    .order('created_at', { ascending: true })
    .limit(1)

  if (campaignError || !campaigns?.length) throw new Error('campaign_not_configured')

  return {
    runtime: runtime as RuntimeConfig,
    account,
    campaign: campaigns[0] as Campaign,
    accessToken,
  }
}

async function loadExistingEventKeys(
  db: ReturnType<typeof adminClient>,
  eventKeys: string[],
) {
  const existing = new Set<string>()
  for (let offset = 0; offset < eventKeys.length; offset += 100) {
    const chunk = eventKeys.slice(offset, offset + 100)
    if (!chunk.length) continue
    const { data, error } = await db
      .from('drx_social_send_ledger')
      .select('event_key')
      .in('event_key', chunk)
    if (error) throw new Error('ledger_read_failed')
    for (const row of data ?? []) existing.add(String(row.event_key))
  }
  return existing
}

async function scanCandidates(
  db: ReturnType<typeof adminClient>,
  context: BackfillContext,
  mediaId: string,
  lookbackHours: number,
): Promise<CandidateScan> {
  const media = (await listMedia(context)).find((item) => item.id === mediaId)
  if (!media) throw new Error('selected_media_not_accessible')

  const { comments, truncated } = await fetchComments(context, mediaId)
  const normalizedKeyword = context.campaign.keyword.trim().toLocaleLowerCase()
  const now = Date.now()
  const earliestEligible = now - lookbackHours * 60 * 60 * 1000
  const latestEligible = now - RECENT_COMMENT_SAFETY_MINUTES * 60 * 1000
  let keywordMatches = 0
  let outsideWindow = 0
  let tooRecent = 0
  const eligible: InstagramComment[] = []

  for (const comment of comments) {
    if (String(comment.text ?? '').trim().toLocaleLowerCase() !== normalizedKeyword) continue
    keywordMatches += 1
    const timestamp = new Date(String(comment.timestamp ?? '')).getTime()
    if (!Number.isFinite(timestamp) || timestamp < earliestEligible) {
      outsideWindow += 1
      continue
    }
    if (timestamp > latestEligible) {
      tooRecent += 1
      continue
    }
    eligible.push(comment)
  }

  const existing = await loadExistingEventKeys(
    db,
    eligible.map((comment) => `instagram:comment:${comment.id}`),
  )
  const candidates = eligible.filter((comment) => !existing.has(`instagram:comment:${comment.id}`))

  return {
    media,
    totalScanned: comments.length,
    keywordMatches,
    outsideWindow,
    tooRecent,
    alreadyInLedger: eligible.length - candidates.length,
    candidates,
    truncated,
  }
}

async function sendPrivateReply(
  db: ReturnType<typeof adminClient>,
  context: BackfillContext,
  mediaId: string,
  comment: InstagramComment,
) {
  const eventKey = `instagram:comment:${comment.id}`
  const commentHash = await sha256Hex(String(comment.text ?? ''))
  const timestamp = new Date(String(comment.timestamp ?? ''))
  const providerTimestamp = Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : null

  const { error: eventError } = await db.from('drx_social_inbound_events').insert({
    event_key: eventKey,
    transport: 'instagram_backfill',
    event_type: 'comment',
    account_id: context.account.account_id,
    project_namespace: context.account.project_namespace,
    media_id: mediaId,
    comment_id: comment.id,
    comment_text_hash: commentHash,
    campaign_id: context.campaign.campaign_id,
    status: 'send_attempted',
    provider_timestamp: providerTimestamp,
  })

  if (eventError) {
    if ((eventError as { code?: string }).code === '23505') return { status: 'duplicate' as const }
    throw new Error('event_insert_failed')
  }

  const { error: ledgerError } = await db.from('drx_social_send_ledger').insert({
    event_key: eventKey,
    campaign_id: context.campaign.campaign_id,
    template_version: context.campaign.template_version,
    status: 'attempting',
  })
  if (ledgerError) throw new Error('ledger_insert_failed')

  const endpoint = graphUrl(
    context.runtime.api_base,
    context.runtime.api_version,
    `${encodeURIComponent(context.account.account_id)}/messages`,
    {},
  )
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${context.accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      recipient: { comment_id: comment.id },
      message: { text: context.campaign.first_message },
    }),
  })
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>

  if (!response.ok) {
    const metaError = payload.error as Record<string, unknown> | undefined
    const code = typeof metaError?.code === 'number' ? `meta_${metaError.code}` : `meta_http_${response.status}`
    await Promise.all([
      db.from('drx_social_inbound_events').update({
        status: 'send_failed',
        failure_code: code,
        updated_at: new Date().toISOString(),
      }).eq('event_key', eventKey),
      db.from('drx_social_send_ledger').update({
        status: 'failed',
        failure_code: code,
        updated_at: new Date().toISOString(),
      }).eq('event_key', eventKey),
    ])
    return { status: 'failed' as const, code }
  }

  await Promise.all([
    db.from('drx_social_inbound_events').update({
      status: 'sent',
      updated_at: new Date().toISOString(),
    }).eq('event_key', eventKey),
    db.from('drx_social_send_ledger').update({
      status: 'sent',
      provider_message_id: typeof payload.message_id === 'string' ? payload.message_id : null,
      provider_recipient_id: typeof payload.recipient_id === 'string' ? payload.recipient_id : null,
      updated_at: new Date().toISOString(),
    }).eq('event_key', eventKey),
  ])
  return { status: 'sent' as const }
}

function pageShell(title: string, body: string) {
  return `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><style>
:root{color-scheme:dark}body{font-family:system-ui,-apple-system,sans-serif;background:#090909;color:#f5f5f5;margin:0;padding:24px}main{max-width:760px;margin:auto}.card{background:#151515;border:1px solid #2b2b2b;border-radius:18px;padding:22px;margin:14px 0}h1{font-size:28px;margin:0 0 8px}h2{font-size:18px;margin-top:0}.muted{color:#aaa;line-height:1.55}.ok{color:#86efac}.warn{color:#fde68a}.error{color:#fca5a5}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px}.metric{background:#0b0b0b;border-radius:12px;padding:14px}.metric b{display:block;font-size:24px;margin-top:4px}label{display:block;margin:14px 0 6px;font-weight:700}select,input{width:100%;box-sizing:border-box;background:#0b0b0b;color:white;border:1px solid #3b3b3b;border-radius:10px;padding:12px;font-size:16px}button{margin-top:18px;background:white;color:black;border:0;border-radius:999px;padding:13px 20px;font-size:16px;font-weight:800;cursor:pointer}button.danger{background:#f59e0b}.small{font-size:13px}.code{word-break:break-all;background:#0b0b0b;padding:12px;border-radius:10px}</style></head>
<body><main>${body}</main></body></html>`
}

function mediaLabel(media: Media) {
  const date = media.timestamp ? new Date(media.timestamp).toISOString().slice(0, 10) : 'unknown date'
  const caption = String(media.caption ?? '').replace(/\s+/g, ' ').trim().slice(0, 90)
  return `${date} · ${media.media_type ?? 'media'} · ${caption || 'No caption'}`
}

function setupPage(setupToken: string, context: BackfillContext, media: Media[], message = '') {
  const options = media.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(mediaLabel(item))}</option>`).join('')
  const notice = message ? `<div class="card warn">${escapeHtml(message)}</div>` : ''
  return pageShell('DR.X Old-comment Backfill', `
<h1>DR.X Old-comment Backfill</h1>
<p class="muted">Preview-first recovery for comments that existed before the live automation. No DM is sent from this screen.</p>
${notice}
<div class="card"><h2>Connected account</h2><p class="ok"><b>@${escapeHtml(context.account.username ?? 'connected')}</b></p><p>Trigger keyword: <b>${escapeHtml(context.campaign.keyword)}</b></p><p class="muted small">Only exact keyword matches are considered. Comments from the last ${RECENT_COMMENT_SAFETY_MINUTES} minutes are excluded to avoid overlapping with the live automation.</p></div>
<form class="card" method="post">
<input type="hidden" name="action" value="preview">
<input type="hidden" name="setup_token" value="${escapeHtml(setupToken)}">
<h2>1. Select the Reel or post</h2>
<label>Instagram media</label><select name="media_id" required>${options}</select>
<label>Look back (hours)</label><input name="lookback_hours" type="number" min="1" max="${PRIVATE_REPLY_WINDOW_HOURS}" value="${PRIVATE_REPLY_WINDOW_HOURS}" required>
<label>Maximum DMs in one approved run</label><input name="send_limit" type="number" min="1" max="${MAX_SENDS_PER_RUN}" value="${MAX_SENDS_PER_RUN}" required>
<button type="submit">Preview eligible comments</button>
</form>
<div class="card"><h2>Safety rules</h2><p class="muted">This scanner never sends during preview, never sends twice from our ledger, never targets comments outside the private-reply window, and never sends more than ${MAX_SENDS_PER_RUN} DMs per approved run. Meta may still reject a comment already handled by another tool such as ManyChat; that rejection is recorded, not retried automatically.</p></div>
`)
}

function previewPage(
  setupToken: string,
  context: BackfillContext,
  scan: CandidateScan,
  lookbackHours: number,
  sendLimit: number,
) {
  const planned = Math.min(sendLimit, scan.candidates.length)
  return pageShell('Backfill preview', `
<h1>Backfill preview</h1><p class="muted">This is a dry run. Nothing has been sent.</p>
<div class="card"><h2>${escapeHtml(mediaLabel(scan.media))}</h2>
<div class="grid">
<div class="metric">Comments scanned<b>${scan.totalScanned}</b></div>
<div class="metric">Keyword matches<b>${scan.keywordMatches}</b></div>
<div class="metric">Eligible candidates<b>${scan.candidates.length}</b></div>
<div class="metric">Already in our ledger<b>${scan.alreadyInLedger}</b></div>
<div class="metric">Outside time window<b>${scan.outsideWindow}</b></div>
<div class="metric">Too recent / live lane<b>${scan.tooRecent}</b></div>
</div>
${scan.truncated ? '<p class="warn">The scan hit its 1,000-comment safety ceiling. Run the eligible batch, then rescan.</p>' : ''}
</div>
<div class="card"><h2>2. Execution gate</h2>
<p><b>${planned}</b> DM${planned === 1 ? '' : 's'} would be attempted now.</p>
<p class="muted">“Eligible” means inside the time window, exact keyword match, and absent from our own send ledger. Meta is the final authority and can reject comments already privately replied to elsewhere.</p>
<form method="post">
<input type="hidden" name="action" value="execute">
<input type="hidden" name="setup_token" value="${escapeHtml(setupToken)}">
<input type="hidden" name="media_id" value="${escapeHtml(scan.media.id)}">
<input type="hidden" name="lookback_hours" value="${lookbackHours}">
<input type="hidden" name="send_limit" value="${sendLimit}">
<input type="hidden" name="confirm" value="SEND_ELIGIBLE_BACKFILL">
<button class="danger" type="submit" ${planned === 0 ? 'disabled' : ''}>Send to ${planned} eligible comment${planned === 1 ? '' : 's'}</button>
</form></div>
`)
}

function resultsPage(scan: CandidateScan, results: Array<{ status: string; code?: string }>) {
  const sent = results.filter((item) => item.status === 'sent').length
  const failed = results.filter((item) => item.status === 'failed').length
  const duplicate = results.filter((item) => item.status === 'duplicate').length
  const failureCodes = [...new Set(results.flatMap((item) => item.code ? [item.code] : []))]
  return pageShell('Backfill complete', `
<h1>Backfill run complete</h1>
<div class="card"><div class="grid">
<div class="metric">Sent<b>${sent}</b></div>
<div class="metric">Rejected by Meta<b>${failed}</b></div>
<div class="metric">Deduplicated<b>${duplicate}</b></div>
<div class="metric">Remaining preview candidates<b>${Math.max(0, scan.candidates.length - results.length)}</b></div>
</div>
${failureCodes.length ? `<p class="warn small">Recorded provider codes: ${escapeHtml(failureCodes.join(', '))}</p>` : ''}
</div>
<div class="card"><p class="ok"><b>No automatic retry is running.</b></p><p class="muted">Every attempted comment is now recorded in the DR.X ledger. Open a fresh short-lived setup link to scan another Reel or post.</p></div>
`)
}

Deno.serve(async (request: Request) => {
  const db = adminClient()
  const url = new URL(request.url)

  try {
    if (request.method === 'GET' && url.searchParams.has('setup')) {
      const setupToken = url.searchParams.get('setup') ?? ''
      if (!await validSetupToken(db, setupToken)) {
        return new Response('Setup link is invalid, expired, or already used.', { status: 403 })
      }
      const context = await loadContext(db)
      const media = await listMedia(context)
      if (!media.length) return new Response(setupPage(setupToken, context, [], 'No accessible Instagram media was returned.'), { headers: htmlHeaders })
      return new Response(setupPage(setupToken, context, media), { headers: htmlHeaders })
    }

    if (request.method === 'POST' && (request.headers.get('content-type') ?? '').includes('application/x-www-form-urlencoded')) {
      const form = await request.formData()
      const setupToken = String(form.get('setup_token') ?? '')
      if (!await validSetupToken(db, setupToken)) return new Response('Setup token invalid or expired.', { status: 403 })

      const action = String(form.get('action') ?? '')
      const mediaId = String(form.get('media_id') ?? '').trim()
      const lookbackHours = clampInteger(form.get('lookback_hours'), PRIVATE_REPLY_WINDOW_HOURS, 1, PRIVATE_REPLY_WINDOW_HOURS)
      const sendLimit = clampInteger(form.get('send_limit'), MAX_SENDS_PER_RUN, 1, MAX_SENDS_PER_RUN)
      if (!mediaId) return new Response('Missing media selection.', { status: 400 })

      const context = await loadContext(db)
      const scan = await scanCandidates(db, context, mediaId, lookbackHours)

      if (action === 'preview') {
        return new Response(previewPage(setupToken, context, scan, lookbackHours, sendLimit), { headers: htmlHeaders })
      }

      if (action === 'execute') {
        if (String(form.get('confirm') ?? '') !== 'SEND_ELIGIBLE_BACKFILL') {
          return new Response('Execution confirmation missing.', { status: 409 })
        }
        const selected = scan.candidates.slice(0, sendLimit)
        const results: Array<{ status: string; code?: string }> = []
        for (const comment of selected) {
          results.push(await sendPrivateReply(db, context, mediaId, comment))
        }
        return new Response(resultsPage(scan, results), { headers: htmlHeaders })
      }

      return new Response('Unknown action.', { status: 400 })
    }

    return new Response(JSON.stringify({
      status: 'ok',
      service: 'drx-social-backfill',
      mode: 'preview_first',
      max_sends_per_run: MAX_SENDS_PER_RUN,
    }), { headers: jsonHeaders })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'internal_error'
    console.error('drx_social_backfill_error', code)
    const status = code === 'meta_authorization_not_configured' ? 409 : 500
    return new Response(JSON.stringify({ error: code }), { status, headers: jsonHeaders })
  }
})

