// LAST BENCH JEV Gate worker v0 — dry-run only. No outbound CRM writes.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const headers = { "content-type": "application/json" };
Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const expected = Deno.env.get("JEV_WORKER_TOKEN");
  const received = request.headers.get("authorization");
  if (!expected || received !== `Bearer ${expected}`) return new Response("Unauthorized", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return new Response("Missing server configuration", { status: 503 });
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.schema("automation").rpc("claim_due_events", { p_limit: 10, p_lease_seconds: 120 });
  if (error) return Response.json({ error: "claim_failed" }, { status: 503 });
  let completed = 0, blocked = 0;
  for (const event of data ?? []) {
    const { data: workflows, error: wfError } = await db.schema("automation").from("workflow_definitions")
      .select("id,version,definition").eq("enabled", true).eq("definition->trigger->>event", event.event_type);
    if (wfError) { blocked++; continue; }
    for (const workflow of workflows ?? []) {
      await db.schema("automation").from("runs").upsert({
        event_id: event.id, workflow_id: workflow.id, workflow_version: workflow.version,
        mode: "dry_run", status: "completed", result: { outcome: "simulated", event_type: event.event_type },
        completed_at: new Date().toISOString()
      }, { onConflict: "event_id,workflow_id,workflow_version,mode", ignoreDuplicates: true });
    }
    const { error: doneError } = await db.schema("automation").from("events")
      .update({ status: "completed", lease_until: null }).eq("id", event.id).eq("status", "processing");
    if (doneError) blocked++; else completed++;
  }
  return Response.json({ mode: "dry_run", claimed: data?.length ?? 0, completed, blocked }, { headers });
});
