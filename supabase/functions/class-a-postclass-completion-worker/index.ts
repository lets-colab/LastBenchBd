import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";

const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";
const COURSE="https://lastbenchbd.com/class-a/course.html";

function db(){
  const url=Deno.env.get("SUPABASE_URL")||"";
  const json=Deno.env.get("SUPABASE_SECRET_KEYS")||"";
  const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
  let key=legacy;
  if(json){try{const x=JSON.parse(json);key=String(x.default||Object.values(x)[0]||legacy)}catch{}}
  if(!url||!key) throw new Error("supabase_admin_not_configured");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

function button(label:string,url:string){
  return url?`<p><a href="${url}">${label}</a></p>`:"";
}

async function send(to:string,name:string,session:any){
  const key=Deno.env.get("RESEND_API_KEY")||"";
  if(!key) throw new Error("missing_email_transport");
  const pack=String(session?.analysis_summary?.after_class_pack_url||"");
  const recording=String(session?.recording_url||"");
  const transcript=String(session?.transcript_url||"");
  if(!pack) throw new Error("after_class_pack_not_ready");
  const html=`<p>Hi ${name},</p><p>Thank you for completing the CLASS[Λ] live session.</p><p>Your approved after-class materials are ready.</p>${button("OPEN AFTER-CLASS PACK",pack)}${button("WATCH CLASS RECORDING",recording)}${button("OPEN NOTES / TRANSCRIPT",transcript)}${button("EXPLORE THE 20-CLASS PROGRAM",COURSE)}<p>Participant-specific personal or company materials remain private unless explicitly approved for sharing.</p>`;
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject:"CLASS[Λ] — your after-class pack",html})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(`email_failed:${body.message||r.status}`);
  return String(body.id||"resend");
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  const c=db();
  const {data:items,error}=await c.from("class_a_session_notifications")
    .select("id,enrollment_id,registration_id,session_id,status,last_error")
    .eq("notification_type","post_class_followup")
    .eq("status","skipped")
    .like("last_error","completion_gate_moved_to_governed_followup%")
    .order("id",{ascending:true}).limit(25);
  if(error) throw error;

  const out={sent:0,waiting:0,failed:0};
  for(const item of items||[]){
    const [{data:reg},{data:enrollment},{data:session},{data:evidence}]=await Promise.all([
      c.from("class_a_registrations").select("full_name,email,record_kind").eq("id",item.registration_id).maybeSingle(),
      c.from("class_a_session_enrollments").select("status,attended_at").eq("id",item.enrollment_id).maybeSingle(),
      c.from("class_a_sessions").select("recording_url,transcript_url,analysis_status,analysis_summary").eq("id",item.session_id).maybeSingle(),
      c.from("class_a_session_attendance_evidence").select("evidence_type,metadata").eq("registration_id",item.registration_id).eq("session_id",item.session_id).in("evidence_type",["meet_report","staff_code"]).limit(20)
    ]);
    const completed=(evidence||[]).some((x:any)=>x?.metadata?.present_at_end===true||x?.metadata?.completion_eligible===true);
    if(!reg||reg.record_kind!=="genuine"||!reg.email||enrollment?.status!=="attended"||!completed||!session?.analysis_summary?.after_class_pack_url){
      out.waiting++; continue;
    }
    try{
      const ref=await send(reg.email,reg.full_name||"there",session);
      await c.from("class_a_session_notifications").update({status:"sent",sent_at:new Date().toISOString(),external_ref:ref,last_error:null}).eq("id",item.id);
      out.sent++;
    }catch(err){
      await c.from("class_a_session_notifications").update({last_error:`completion_gate_moved_to_governed_followup:send_failed:${String(err)}`}).eq("id",item.id);
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});