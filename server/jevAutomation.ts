import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { getJevProviderHealth } from "./jevIntegrationHealth";

/** Strictly server-side and callable only from the application adminProcedure. */
export async function getAutomationOverview() {
  const db = await getDb();
  if (!db) throw new Error("Automation database connection unavailable");
  const [counts, workflows, runs] = await Promise.all([
    db.execute(sql`select count(*) filter(where status='pending')::int as pending, count(*) filter(where status='processing')::int as processing, count(*) filter(where status='completed')::int as completed, count(*) filter(where status='blocked')::int as blocked, count(*) filter(where status='dead_letter')::int as dead_letter from automation.events`),
    db.execute(sql`select id,version,enabled,definition->'trigger'->>'event' as event_type,definition->>'execution_mode' as execution_mode from automation.workflow_definitions order by id,version`),
    db.execute(sql`select id::text as id,workflow_id,mode,status,started_at,completed_at from automation.runs order by started_at desc limit 25`)
  ]);
  const providers = await getJevProviderHealth();
  return {
    providers,
    counts: (counts[0] ?? {pending:0,processing:0,completed:0,blocked:0,dead_letter:0}) as Record<string, number>,
    workflows: workflows.map(x=>({ id:String(x.id), version:Number(x.version), enabled:Boolean(x.enabled), eventType:String(x.event_type??""), executionMode:String(x.execution_mode??"") })),
    runs: runs.map(x=>({ id:String(x.id), workflowId:String(x.workflow_id), mode:String(x.mode), status:String(x.status), startedAt:new Date(String(x.started_at)).toISOString(), completedAt:x.completed_at?new Date(String(x.completed_at)).toISOString():null })),
    verifiedSource:"supabase:automation", generatedAt:new Date().toISOString()
  };
}

/** Run a synthetic probe only. This action never contacts HubSpot or sends messages. */
export async function executeSyntheticAutomationProbe(adminUserId:number) {
  const db = await getDb();
  if (!db) throw new Error("Automation database connection unavailable");
  const key=`jev-console-probe-${randomUUID()}`;
  return db.transaction(async tx=>{
    await tx.execute(sql`select set_config('request.jwt.claim.role','service_role',true)`);
    const submitted=await tx.execute(sql`select public.jev_enqueue_event('system.health_probe','admin_console',${key},${JSON.stringify({synthetic:true,requested_by_admin_user_id:adminUserId})}::jsonb,1)::text as id`);
    const id=String(submitted[0]?.id??"");
    // Cron owns execution. Never process unrelated events from a UI action.
    return {eventId:id,status:"pending",outcome:{execution_mode:"dry_run",delivery:"scheduled"}};
  });
}