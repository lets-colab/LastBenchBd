import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {classAButton,classAPlainText,classAStatusCard,renderClassAEmail} from "../_shared/class-a-email.ts";

type Row = Record<string, any>;
const SITE = "https://lastbenchbd.com/class-a";
// Default to the verified Last Bench owner, never a public team channel.
const CHANNEL_ID = Deno.env.get("CLASS_A_SLACK_CHANNEL_ID") || "U0BRY5WMLLW";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("CLASS_A_EMAIL_FROM") || "CLASS[Λ] <info@lastbenchbd.com>";

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL") || "";
  const secretJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || "";
  let secret = legacy;
  if (secretJson) {
    try {
      const parsed = JSON.parse(secretJson);
      secret = parsed.default || Object.values(parsed)[0] || legacy;
    } catch (_) {}
  }
  if (!url || !secret) throw new Error("supabase_admin_not_configured");
  return createClient(url, String(secret), { auth: { persistSession: false, autoRefreshToken: false } });
}

function bdTime(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone:"Asia/Dhaka", dateStyle:"medium", timeStyle:"short" }).format(new Date(value));
  } catch (_) {
    return String(value);
  }
}

function escapeHtml(input:unknown){return String(input??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));}
function safeLink(raw:string){try{const url=new URL(raw);return url.protocol==="https:"?url.toString():"";}catch{return "";}}
function brandedEmail(body:string,title:string){
  return renderClassAEmail({title,eyebrow:"CLASS[Λ] SESSION UPDATE",body});
}

// Slack public channels start with C. Send only to direct messages or private channels.
// Incoming webhooks have opaque destinations and cannot satisfy this proof gate.
function privateSlackReady(){return Boolean(SLACK_BOT_TOKEN && /^[UDG][A-Z0-9]+$/.test(CHANNEL_ID));}
async function sendSlack(message:string) {
  if(!privateSlackReady()) throw new Error("private_slack_destination_not_authorized");
  const res=await fetch("https://slack.com/api/chat.postMessage",{
    method:"POST",
    headers:{Authorization:`Bearer ${SLACK_BOT_TOKEN}`,"Content-Type":"application/json"},
    body:JSON.stringify({channel:CHANNEL_ID,text:message,unfurl_links:false,unfurl_media:false})
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok||!body.ok) throw new Error(`slack_bot_failed:${body.error||res.status}`);
  return String(body.ts||"slack");
}

function calendarUrl(session:Row) {
  if(!session?.starts_at) return "";
  const compact=(value:string)=>new Date(value).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const start=compact(session.starts_at);
  const end=compact(session.ends_at||new Date(new Date(session.starts_at).getTime()+90*60000).toISOString());
  return "https://calendar.google.com/calendar/render?"+new URLSearchParams({
    action:"TEMPLATE",
    text:session.title||"CLASS[Λ] — The 0.01% Builders Masterclass",
    dates:`${start}/${end}`,
    details:"Your personal CLASS[Λ] pass contains the latest room and attendance details.",
    location:session.join_url||"Online · Google Meet"
  }).toString();
}

function button(label:string,href?:string|null) {
  return classAButton(label,href);
}

function emailCopy(kind:string,name:string,session:Row) {
  name=escapeHtml(name);
  const when=session?.starts_at?escapeHtml(bdTime(session.starts_at))+" Bangladesh time":"Schedule pending";
  const join=session?.join_url||SITE+"/pass.html";
  const common=classAStatusCard([["Session",session?.title||"CLASS[Λ] Masterclass"],["Time",session?.starts_at?bdTime(session.starts_at)+" Bangladesh time":"Schedule pending"]]);
  const packUrl=String(session?.analysis_summary?.after_class_pack_url||"");
  const recordingUrl=String(session?.recording_url||"");
  const transcriptUrl=String(session?.transcript_url||"");
  const map:Record<string,{subject:string,html:string}>={
    registration_confirmation:{
      subject:"CLASS[Λ] registration confirmed",
      html:`<p>Hi ${name},</p><p>Your CLASS[Λ] masterclass registration is reserved.</p>${common}${button("OPEN MASTERCLASS",SITE+"/masterclass.html")}<p>Your personal pass is released through the consent + WhatsApp follow-confirmation flow. Keep the pass code private.</p>`
    },
    calendar_invite:{
      subject:"Add CLASS[Λ] to your calendar",
      html:`<p>Hi ${name},</p><p>Your CLASS[Λ] live session is scheduled.</p>${common}${button("ADD TO GOOGLE CALENDAR",calendarUrl(session))}`
    },
    reminder_24h:{
      subject:"CLASS[Λ] starts tomorrow",
      html:`<p>Hi ${name},</p><p>Your CLASS[Λ] live masterclass starts in about 24 hours.</p>${common}${button("OPEN MY PASS",SITE+"/pass.html")}<p>Keep your personal pass ready. Attendance is verified with the live in-class code.</p>`
    },
    reminder_6h:{
      subject:"CLASS[Λ] starts in 6 hours",
      html:`<p>Hi ${name},</p><p>Your CLASS[Λ] masterclass starts in about 6 hours.</p>${common}${button("OPEN MY PASS",SITE+"/pass.html")}`
    },
    room_open:{
      subject:"CLASS[Λ] room opens in 15 minutes",
      html:`<p>Hi ${name},</p><p>The CLASS[Λ] live room is opening.</p>${common}${button("JOIN GOOGLE MEET",join)}<p>Joining is a signal; attendance is verified only after trusted attendance evidence is recorded.</p>`
    },
    post_class_followup:{
      subject:"CLASS[Λ] — your after-class pack",
      html:`<p>Hi ${name},</p><p>Thank you for completing the CLASS[Λ] live session.</p><p>Your approved after-class materials are below.</p>${button("OPEN AFTER-CLASS PACK",packUrl)}${button("WATCH CLASS RECORDING",recordingUrl)}${button("OPEN NOTES / TRANSCRIPT",transcriptUrl)}${button("EXPLORE THE 20-CLASS PROGRAM",SITE+"/course.html")}<p>Participant-specific personal or company materials remain private unless explicitly approved for sharing.</p>`
    }
  };
  const copy=map[kind];
  if(!copy) throw new Error(`unsupported_notification_type:${kind}`);
  const titles:Record<string,string>={
    registration_confirmation:"MASTERCLASS\nREGISTRATION.",
    calendar_invite:"ADD YOUR\nCLASS.",
    reminder_24h:"YOUR CLASS\nSTARTS TOMORROW.",
    reminder_6h:"CLASS STARTS\nIN 6 HOURS.",
    room_open:"YOUR LIVE ROOM\nIS OPENING.",
    post_class_followup:"YOUR AFTER-CLASS\nPACK."
  };
  return {...copy,html:brandedEmail(copy.html,titles[kind]||"CLASS[Λ]\nUPDATE.")};
}

function courseRegistrationCopy(name:string) {
  name=escapeHtml(name);
  return {
    subject:"CLASS[Λ] — Course registration received",
    html:`<p>Hi ${name},</p><p>We received your CLASS[Λ] course registration successfully.</p><p>This confirms that your registration details are in the Last Bench system. Registration is separate from payment or final enrollment; those states require their own evidence.</p>${button("OPEN COURSE DETAILS",SITE+"/course.html")}<p>If you already completed a payment or enrollment step, keep the receipt or confirmation until it is reconciled with the official record.</p>`
  };
}

async function sendEmail(to:string,subject:string,html:string) {
  if(!RESEND_API_KEY) throw new Error("missing_email_transport");
  const res=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:`Bearer ${RESEND_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({from:EMAIL_FROM,to:[to],subject,html,text:classAPlainText(html)})
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(`email_failed:${body.message||res.status}`);
  if(!body.id) throw new Error("provider_email_id_missing_delivery_uncertain");
  return String(body.id);
}

function completionEvidenceOk(rows:Row[]|null|undefined) {
  return (rows||[]).some((row:Row)=>{
    const metadata=row?.metadata||{};
    return metadata?.present_at_end===true || metadata?.completion_eligible===true;
  });
}

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  const db=adminClient();
  const report:any={
    slack:{sent:0,blocked:0,failed:0},
    email:{sent:0,blocked:0,failed:0,skipped:0,deferred:0},
    attendance:{sent:0,blocked:0,failed:0}
  };

  const {data:signupRows,error:signupError}=await db
    .from("class_a_signup_events")
    .select("id,registration_id,program,skill_level,registration_created_at,status,attempts")
    .eq("status","pending")
    .order("id",{ascending:true})
    .limit(25);
  if(signupError) throw signupError;

  for(const event of signupRows||[]) {
    const {data:reg}=await db
      .from("class_a_registrations")
      .select("id,full_name,record_kind,program")
      .eq("id",event.registration_id)
      .maybeSingle();

    if(!reg||reg.record_kind!=="genuine"){
      await db.from("class_a_signup_events")
        .update({status:"skipped",processed_at:new Date().toISOString(),resolution_note:"non_genuine_record"})
        .eq("id",event.id);
      continue;
    }
    if(!privateSlackReady()){
      report.slack.blocked++;
      continue;
    }
    try{
      const ref=await sendSlack(`*CLASS[Λ] application recorded*\nRegistration ID: \`${reg.id}\`\nProgram: ${event.program||reg.program||"masterclass"}\nRegistered: ${bdTime(event.registration_created_at)} (Bangladesh time)\nStatus: *APPLICATION RECEIVED — admission/payment separately verified*`);
      await db.from("class_a_signup_events")
        .update({status:"sent",processed_at:new Date().toISOString(),slack_notified_at:new Date().toISOString(),last_error:null,resolution_note:`slack:${ref}`})
        .eq("id",event.id);
      report.slack.sent++;
    }catch(err){
      await db.from("class_a_signup_events")
        .update({attempts:(Number(event.attempts)||0)+1,last_error:String(err)})
        .eq("id",event.id);
      report.slack.failed++;
    }
  }

  // Course confirmation is sent exclusively by class-a-course-confirmation-worker.
  // Never run two sender loops against the same signup-event outbox.

  const {data:attended}=await db
    .from("class_a_session_enrollments")
    .select("id,registration_id,attended_at,attendance_slack_notified_at")
    .eq("status","attended")
    .is("attendance_slack_notified_at",null)
    .order("attended_at",{ascending:true})
    .limit(25);

  for(const row of attended||[]) {
    if(!privateSlackReady()){
      report.attendance.blocked++;
      continue;
    }
    const {data:reg}=await db.from("class_a_registrations")
      .select("full_name,record_kind")
      .eq("id",row.registration_id)
      .maybeSingle();
    if(!reg||reg.record_kind!=="genuine") continue;
    try{
      await sendSlack(`*CLASS[Λ] attendance verified*\nRegistration ID: \`${row.registration_id}\`\nAttended: ${bdTime(row.attended_at)} (Bangladesh time)\nStatus: *ATTENDED (recorded evidence)*`);
      await db.from("class_a_session_enrollments")
        .update({attendance_slack_notified_at:new Date().toISOString(),attendance_slack_last_error:null})
        .eq("id",row.id);
      report.attendance.sent++;
    }catch(err){
      await db.from("class_a_session_enrollments")
        .update({attendance_slack_last_error:String(err)})
        .eq("id",row.id);
      report.attendance.failed++;
    }
  }

  const {data:due,error:dueError}=await db
    .from("class_a_session_notifications")
    .select("id,enrollment_id,registration_id,session_id,notification_type,status,attempts,due_at")
    .in("status",["pending","failed"])
    .lte("due_at",new Date().toISOString())
    .lt("attempts",5)
    .order("due_at",{ascending:true})
    .limit(25);
  if(dueError) throw dueError;

  for(const item of due||[]) {
    // Claim only once, otherwise concurrent cron/trigger workers can send twice.
    const {data:claimed,error:claimError}=await db.from("class_a_session_notifications")
      .update({status:"processing"}).eq("id",item.id)
      .eq("status",item.status).eq("attempts",item.attempts)
      .select("id").maybeSingle();
    if(claimError) throw claimError;
    if(!claimed){report.email.skipped++;continue;}

    const [{data:reg},{data:session},{data:enrollment}]=await Promise.all([
      db.from("class_a_registrations")
        .select("full_name,email,record_kind")
        .eq("id",item.registration_id)
        .maybeSingle(),
      db.from("class_a_sessions")
        .select("title,status,starts_at,ends_at,timezone,join_url,recording_url,transcript_url,analysis_status,analysis_summary")
        .eq("id",item.session_id)
        .maybeSingle(),
      db.from("class_a_session_enrollments")
        .select("id,status,attended_at")
        .eq("id",item.enrollment_id)
        .maybeSingle()
    ]);

    // Never deliver outdated schedule notices after a session has started/closed.
    // This applies even when the mail provider is unconfigured.
    const isPresession=["registration_confirmation","calendar_invite","reminder_24h","reminder_6h","room_open"].includes(item.notification_type);
    const startTime=session?.starts_at?new Date(session.starts_at).getTime():NaN;
    const isClosed=(!session || ["completed","cancelled","canceled"].includes(String(session.status||"").toLowerCase()));
    const minutesUntilStart=(startTime-Date.now())/60000;
    const misleadingTiming=(
      (item.notification_type==="reminder_24h" && (minutesUntilStart<20*60 || minutesUntilStart>30*60)) ||
      (item.notification_type==="reminder_6h" && (minutesUntilStart<4*60 || minutesUntilStart>8*60)) ||
      (item.notification_type==="room_open" && (minutesUntilStart<0 || minutesUntilStart>30))
    );
    if(isPresession && (isClosed || !Number.isFinite(startTime) || startTime<=Date.now() || misleadingTiming)){
      await db.from("class_a_session_notifications").update({status:"skipped",last_error:"expired_or_closed_session"}).eq("id",item.id);
      report.email.skipped++;
      continue;
    }
    if(!RESEND_API_KEY){
      await db.from("class_a_session_notifications").update({status:item.status,last_error:"missing_email_transport"}).eq("id",item.id);
      report.email.blocked++;
      continue;
    }

    if(!reg||reg.record_kind!=="genuine"||!reg.email){
      await db.from("class_a_session_notifications")
        .update({status:"skipped",last_error:"non_genuine_or_missing_email"})
        .eq("id",item.id);
      report.email.skipped++;
      continue;
    }

    if(item.notification_type==="post_class_followup"){
      const {data:evidence,error:evidenceError}=await db
        .from("class_a_session_attendance_evidence")
        .select("id,evidence_type,evidence_at,metadata")
        .eq("registration_id",item.registration_id)
        .eq("session_id",item.session_id)
        .in("evidence_type",["meet_report","staff_code"])
        .order("evidence_at",{ascending:false})
        .limit(20);

      if(evidenceError){
        await db.from("class_a_session_notifications")
          .update({status:"failed",attempts:(Number(item.attempts)||0)+1,last_error:`completion_evidence_query_failed:${evidenceError.message}`})
          .eq("id",item.id);
        report.email.failed++;
        continue;
      }

      const completed = enrollment?.status==="attended" && completionEvidenceOk(evidence);
      if(!completed){
        const sessionEnd=session?.ends_at?new Date(session.ends_at).getTime():0;
        const cutoff=sessionEnd?sessionEnd+(24*60*60*1000):0;
        if(cutoff && Date.now()<cutoff){
          await db.from("class_a_session_notifications")
            .update({status:"pending",due_at:new Date(Date.now()+30*60*1000).toISOString(),last_error:"awaiting_completion_evidence"})
            .eq("id",item.id);
          report.email.deferred++;
        } else {
          await db.from("class_a_session_notifications")
            .update({status:"skipped",last_error:"completion_not_verified"})
            .eq("id",item.id);
          report.email.skipped++;
        }
        continue;
      }

      if(!session?.analysis_summary?.after_class_pack_url){
        await db.from("class_a_session_notifications")
          .update({status:"failed",attempts:(Number(item.attempts)||0)+1,last_error:"after_class_pack_not_ready"})
          .eq("id",item.id);
        report.email.failed++;
        continue;
      }
    }

    try{
      const copy=emailCopy(item.notification_type,reg.full_name,session||{});
      const ref=await sendEmail(reg.email,copy.subject,copy.html);
      await db.from("class_a_session_notifications")
        .update({status:"sent",sent_at:new Date().toISOString(),external_ref:ref,last_error:null})
        .eq("id",item.id);
      report.email.sent++;
    }catch(err){
      await db.from("class_a_session_notifications")
         .update({status:String(err).includes("delivery_uncertain")?"processing":"failed",attempts:String(err).includes("delivery_uncertain")?item.attempts:(Number(item.attempts)||0)+1,last_error:String(err)})
        .eq("id",item.id).eq("status","processing");
      report.email.failed++;
    }
  }

  return new Response(JSON.stringify({ok:true,report}),{headers:{"Content-Type":"application/json"}});
});
