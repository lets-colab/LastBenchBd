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
    try { const parsed = JSON.parse(secretJson); secret = parsed.default || Object.values(parsed)[0] || legacy; } catch (_) {}
  }
  if (!url || !secret) throw new Error("supabase_admin_not_configured");
  return createClient(url, String(secret), { auth: { persistSession: false, autoRefreshToken: false } });
}
function bdTime(value?: string | null) {
  if (!value) return "—";
  try { return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"}).format(new Date(value)); }
  catch (_) { return String(value); }
}
async function sendSlack(text:string) {
  if (SLACK_BOT_TOKEN) {
    const res=await fetch("https://slack.com/api/chat.postMessage",{method:"POST",headers:{Authorization:`Bearer ${SLACK_BOT_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify({channel:CHANNEL_ID,text,unfurl_links:false,unfurl_media:false})});
    const body=await res.json().catch(()=>({}));
    if(!res.ok||!body.ok) throw new Error(`slack_bot_failed:${body.error||res.status}`);
    return String(body.ts||"slack");
  }
  if (SLACK_WEBHOOK_URL) {
    const res=await fetch(SLACK_WEBHOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
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
  return "https://calendar.google.com/calendar/render?"+new URLSearchParams({action:"TEMPLATE",text:session.title||"CLASS[Λ] — The 0.01% Builders Masterclass",dates:`${start}/${end}`,details:"Your personal CLASS[Λ] pass contains the latest room and attendance details.",location:session.join_url||"Online · Google Meet"}).toString();
}
function emailCopy(kind:string,name:string,session:Row) {
  const when=session?.starts_at?bdTime(session.starts_at)+" Bangladesh time":"Schedule pending";
  const join=session?.join_url||SITE+"/pass.html";
  const common=`<p><strong>Session:</strong> ${session?.title||"CLASS[Λ] Masterclass"}<br><strong>Time:</strong> ${when}</p>`;
  const button=(label:string,href:string)=>`<p><a href="${href}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#00C853;color:#001b0b;text-decoration:none;font-weight:800">${label}</a></p>`;
  const map:Record<string,{subject:string,html:string}>={
    registration_confirmation:{subject:"CLASS[Λ] registration confirmed",html:`<p>Hi ${name},</p><p>Your CLASS[Λ] masterclass registration is reserved.</p>${common}${button("OPEN MASTERCLASS",SITE+"/masterclass.html")}<p>Your personal pass is released through the consent + WhatsApp follow-confirmation flow. Keep the pass code private.</p>`},
    calendar_invite:{subject:"Add CLASS[Λ] to your calendar",html:`<p>Hi ${name},</p><p>Your CLASS[Λ] live session is scheduled.</p>${common}${button("ADD TO GOOGLE CALENDAR",calendarUrl(session))}`},
    reminder_24h:{subject:"CLASS[Λ] starts tomorrow",html:`<p>Hi ${name},</p><p>Your CLASS[Λ] live masterclass starts in about 24 hours.</p>${common}${button("OPEN MY PASS",SITE+"/pass.html")}<p>Keep your personal pass ready. Attendance is verified with the live in-class code.</p>`},
    reminder_6h:{subject:"CLASS[Λ] starts in 6 hours",html:`<p>Hi ${name},</p><p>Your CLASS[Λ] masterclass starts in about 6 hours.</p>${common}${button("OPEN MY PASS",SITE+"/pass.html")}`},
    room_open:{subject:"CLASS[Λ] room opens in 15 minutes",html:`<p>Hi ${name},</p><p>The CLASS[Λ] live room is opening.</p>${common}${button("JOIN GOOGLE MEET",join)}<p>Joining is a signal; attendance is verified only after the live code is redeemed through your personal pass.</p>`},
    post_class_followup:{subject:"CLASS[Λ] — session follow-up",html:`<p>Hi ${name},</p><p>Thanks for joining CLASS[Λ].</p><p>Your attendance evidence and approved follow-up materials remain tied to your personal pass.</p>${button("OPEN MY PASS",SITE+"/pass.html")}${button("EXPLORE THE 20-CLASS PROGRAM",SITE+"/course.html")}`}
  };
  return map[kind]||map.registration_confirmation;
}
async function sendEmail(to:string,subject:string,html:string) {
  if(!RESEND_API_KEY) throw new Error("missing_email_transport");
  const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:EMAIL_FROM,to:[to],subject,html})});
  const body=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(`email_failed:${body.message||res.status}`);
  return String(body.id||"resend");
}

Deno.serve(async (req:Request)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  const db=adminClient();
  const report:any={slack:{sent:0,blocked:0,failed:0},email:{sent:0,blocked:0,failed:0},attendance:{sent:0,blocked:0,failed:0}};

  const {data:signupRows,error:signupError}=await db.from("class_a_signup_events").select("id,registration_id,program,skill_level,registration_created_at,status,attempts").eq("status","pending").order("id",{ascending:true}).limit(25);
  if(signupError) throw signupError;
  for(const event of signupRows||[]) {
    const {data:reg}=await db.from("class_a_registrations").select("id,full_name,record_kind,program").eq("id",event.registration_id).maybeSingle();
    if(!reg||reg.record_kind!=="genuine"){await db.from("class_a_signup_events").update({status:"skipped",processed_at:new Date().toISOString(),resolution_note:"non_genuine_record"}).eq("id",event.id);continue;}
    if(!SLACK_BOT_TOKEN&&!SLACK_WEBHOOK_URL){report.slack.blocked++;continue;}
    try{
      const ref=await sendSlack(`*CLASS[Λ] signup confirmed*\n${reg.full_name} · ${event.program||reg.program||"masterclass"} · ${event.skill_level||"Skill level not supplied"}\nRegistration ID: \`${reg.id}\`\nRegistered: ${bdTime(event.registration_created_at)} (Bangladesh time)\nStatus: *CONFIRMED*`);
      await db.from("class_a_signup_events").update({status:"sent",processed_at:new Date().toISOString(),slack_notified_at:new Date().toISOString(),last_error:null,resolution_note:`slack:${ref}`}).eq("id",event.id);
      report.slack.sent++;
    }catch(err){await db.from("class_a_signup_events").update({attempts:(Number(event.attempts)||0)+1,last_error:String(err)}).eq("id",event.id);report.slack.failed++;}
  }

  const {data:attended}=await db.from("class_a_session_enrollments").select("id,registration_id,attended_at,attendance_slack_notified_at").eq("status","attended").is("attendance_slack_notified_at",null).order("attended_at",{ascending:true}).limit(25);
  for(const row of attended||[]) {
    if(!SLACK_BOT_TOKEN&&!SLACK_WEBHOOK_URL){report.attendance.blocked++;continue;}
    const {data:reg}=await db.from("class_a_registrations").select("full_name,record_kind").eq("id",row.registration_id).maybeSingle();
    if(!reg||reg.record_kind!=="genuine") continue;
    try{
      await sendSlack(`*CLASS[Λ] attendance verified*\n${reg.full_name}\nRegistration ID: \`${row.registration_id}\`\nAttended: ${bdTime(row.attended_at)} (Bangladesh time)\nStatus: *ATTENDED*`);
      await db.from("class_a_session_enrollments").update({attendance_slack_notified_at:new Date().toISOString(),attendance_slack_last_error:null}).eq("id",row.id);report.attendance.sent++;
    }catch(err){await db.from("class_a_session_enrollments").update({attendance_slack_last_error:String(err)}).eq("id",row.id);report.attendance.failed++;}
  }

  const {data:due,error:dueError}=await db.from("class_a_session_notifications").select("id,registration_id,session_id,notification_type,status,attempts,due_at").in("status",["pending","failed"]).lte("due_at",new Date().toISOString()).lt("attempts",5).order("due_at",{ascending:true}).limit(25);
  if(dueError) throw dueError;
  for(const item of due||[]) {
    if(!RESEND_API_KEY){report.email.blocked++;continue;}
    await db.from("class_a_session_notifications").update({status:"processing"}).eq("id",item.id);
    const [{data:reg},{data:session}]=await Promise.all([
      db.from("class_a_registrations").select("full_name,email,record_kind").eq("id",item.registration_id).maybeSingle(),
      db.from("class_a_sessions").select("title,starts_at,ends_at,timezone,join_url").eq("id",item.session_id).maybeSingle()
    ]);
    if(!reg||reg.record_kind!=="genuine"||!reg.email){await db.from("class_a_session_notifications").update({status:"skipped",last_error:"non_genuine_or_missing_email"}).eq("id",item.id);continue;}
    try{
      const copy=emailCopy(item.notification_type,reg.full_name,session||{});
      const ref=await sendEmail(reg.email,copy.subject,copy.html);
      await db.from("class_a_session_notifications").update({status:"sent",sent_at:new Date().toISOString(),external_ref:ref,last_error:null}).eq("id",item.id);report.email.sent++;
    }catch(err){await db.from("class_a_session_notifications").update({status:"failed",attempts:(Number(item.attempts)||0)+1,last_error:String(err)}).eq("id",item.id);report.email.failed++;}
  }

  return new Response(JSON.stringify({ok:true,report}),{headers:{"Content-Type":"application/json"}});
});
