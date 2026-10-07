import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Row = Record<string, any>;
const SITE = "https://lastbenchbd.com/class-a";
const CHANNEL_ID = Deno.env.get("CLASS_A_SLACK_CHANNEL_ID") || "C0BRY6AR0DC";
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") || "";
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL") || "";
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

async function sendSlack(message:string) {
  if (SLACK_BOT_TOKEN) {
    const res=await fetch("https://slack.com/api/chat.postMessage",{
      method:"POST",
      headers:{Authorization:`Bearer ${SLACK_BOT_TOKEN}`,"Content-Type":"application/json"},
      body:JSON.stringify({channel:CHANNEL_ID,text:message,unfurl_links:false,unfurl_media:false})
    });
    const body=await res.json().catch(()=>({}));
    if(!res.ok||!body.ok) throw new Error(`slack_bot_failed:${body.error||res.status}`);
    return String(body.ts||"slack");
  }
  if (SLACK_WEBHOOK_URL) {
    const res=await fetch(SLACK_WEBHOOK_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:message})
    });
    if(!res.ok) throw new Error(`slack_webhook_failed:${res.status}`);
    return "webhook";
  }
  throw new Error("missing_slack_transport");
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
  if(!href) return "";
  return `<p><a href="${href}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#00C853;color:#001b0b;text-decoration:none;font-weight:800">${label}</a></p>`;
}

function emailCopy(kind:string,name:string,session:Row) {
  const when=session?.starts_at?bdTime(session.starts_at)+" Bangladesh time":"Schedule pending";
  const join=session?.join_url||SITE+"/pass.html";
  const common=`<p><strong>Session:</strong> ${session?.title||"CLASS[Λ] Masterclass"}<br><strong>Time:</strong> ${when}</p>`;
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
  return map[kind]||map.registration_confirmation;
}

function courseRegistrationCopy(name:string) {
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
    body:JSON.stringify({from:EMAIL_FROM,to:[to],subject,html})
  });
  const body=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(`email_failed:${body.message||res.status}`);
  return String(body.id||"resend");
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
    courseEmail:{sent:0,blocked:0,failed:0,skipped:0},
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
    if(!SLACK_BOT_TOKEN&&!SLACK_WEBHOOK_URL){
      report.slack.blocked++;
      continue;
    }
    try{
      const ref=await sendSlack(`*CLASS[Λ] signup confirmed*\n${reg.full_name} · ${event.program||reg.program||"masterclass"} · ${event.skill_level||"Skill level not supplied"}\nRegistration ID: \`${reg.id}\`\nRegistered: ${bdTime(event.registration_created_at)} (Bangladesh time)\nStatus: *CONFIRMED*`);
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

  const {data:courseEmailRows,error:courseEmailError}=await db
    .from("class_a_signup_events")
    .select("id,registration_id,email_status,email_attempts")
    .in("email_status",["pending","failed"])
    .lt("email_attempts",5)
    .order("id",{ascending:true})
    .limit(25);
  if(courseEmailError) throw courseEmailError;

  for(const event of courseEmailRows||[]) {
    const {data:reg}=await db
      .from("class_a_registrations")
      .select("full_name,email,record_kind,program")
      .eq("id",event.registration_id)
      .maybeSingle();

    if(!reg||reg.record_kind!=="genuine"||reg.program!=="course"||!reg.email){
      await db.from("class_a_signup_events")
        .update({email_status:"not_applicable",email_last_error:"not_genuine_course_or_missing_email"})
        .eq("id",event.id);
      report.courseEmail.skipped++;
      continue;
    }
    if(!RESEND_API_KEY){
      report.courseEmail.blocked++;
      continue;
    }

    await db.from("class_a_signup_events").update({email_status:"processing"}).eq("id",event.id);
    try{
      const copy=courseRegistrationCopy(reg.full_name);
      const ref=await sendEmail(reg.email,copy.subject,copy.html);
      await db.from("class_a_signup_events")
        .update({email_status:"sent",email_sent_at:new Date().toISOString(),email_external_ref:ref,email_last_error:null})
        .eq("id",event.id);
      report.courseEmail.sent++;
    }catch(err){
      await db.from("class_a_signup_events")
        .update({email_status:"failed",email_attempts:(Number(event.email_attempts)||0)+1,email_last_error:String(err)})
        .eq("id",event.id);
      report.courseEmail.failed++;
    }
  }

  const {data:attended}=await db
    .from("class_a_session_enrollments")
    .select("id,registration_id,attended_at,attendance_slack_notified_at")
    .eq("status","attended")
    .is("attendance_slack_notified_at",null)
    .order("attended_at",{ascending:true})
    .limit(25);

  for(const row of attended||[]) {
    if(!SLACK_BOT_TOKEN&&!SLACK_WEBHOOK_URL){
      report.attendance.blocked++;
      continue;
    }
    const {data:reg}=await db.from("class_a_registrations")
      .select("full_name,record_kind")
      .eq("id",row.registration_id)
      .maybeSingle();
    if(!reg||reg.record_kind!=="genuine") continue;
    try{
      await sendSlack(`*CLASS[Λ] attendance verified*\n${reg.full_name}\nRegistration ID: \`${row.registration_id}\`\nAttended: ${bdTime(row.attended_at)} (Bangladesh time)\nStatus: *ATTENDED*`);
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
    if(!RESEND_API_KEY){
      report.email.blocked++;
      continue;
    }

    await db.from("class_a_session_notifications").update({status:"processing"}).eq("id",item.id);

    const [{data:reg},{data:session},{data:enrollment}]=await Promise.all([
      db.from("class_a_registrations")
        .select("full_name,email,record_kind")
        .eq("id",item.registration_id)
        .maybeSingle(),
      db.from("class_a_sessions")
        .select("title,starts_at,ends_at,timezone,join_url,recording_url,transcript_url,analysis_status,analysis_summary")
        .eq("id",item.session_id)
        .maybeSingle(),
      db.from("class_a_session_enrollments")
        .select("id,status,attended_at")
        .eq("id",item.enrollment_id)
        .maybeSingle()
    ]);

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
        .update({status:"failed",attempts:(Number(item.attempts)||0)+1,last_error:String(err)})
        .eq("id",item.id);
      report.email.failed++;
    }
  }

  return new Response(JSON.stringify({ok:true,report}),{headers:{"Content-Type":"application/json"}});
});
