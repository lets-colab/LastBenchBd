import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const secretMap = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const ADMIN_KEY = secretMap.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!ADMIN_KEY) throw new Error("Missing Supabase secret key");
const db = createClient(SUPABASE_URL, ADMIN_KEY, { auth: { persistSession: false } });

const ALLOWED = new Set(["joining", "reschedule", "previous_attendee"]);
const CORS = {
  "access-control-allow-origin": "https://lastbenchbd.com",
  "access-control-allow-methods": "POST, OPTIONS, GET",
  "access-control-allow-headers": "content-type",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, "content-type": "application/json; charset=utf-8" } });
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.get("health") === "1") return json({ok:true});
  if (req.method !== "POST") return json({ok:false,error:"method_not_allowed"}, 405);

  let payload: any = {};
  try { payload = await req.json(); } catch { return json({ok:false,error:"invalid_json"}, 400); }

  const token = String(payload.token || "");
  const action = String(payload.action || "");
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token) || !ALLOWED.has(action)) {
    return json({ok:false,error:"invalid_confirmation"}, 400);
  }

  const tokenHash = await sha256Hex(token);
  const { data: row, error: findError } = await db
    .from("class_a_session_rsvp_tokens")
    .select("id,registration_id,session_id,response")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (findError || !row) return json({ok:false,error:"confirmation_not_found"}, 404);

  const now = new Date().toISOString();
  const { error: updateError } = await db
    .from("class_a_session_rsvp_tokens")
    .update({response: action, responded_at: now, updated_at: now})
    .eq("id", row.id);
  if (updateError) return json({ok:false,error:"save_failed"}, 500);

  let join_url: string | null = null;
  if (action === "joining") {
    const { data: session } = await db.from("class_a_sessions").select("join_url").eq("id", row.session_id).maybeSingle();
    join_url = session?.join_url || null;
  }

  return json({ok:true,response:action,join_url});
});