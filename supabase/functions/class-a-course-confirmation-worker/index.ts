import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";
import {escapeClassAHtml,classAButton,classAStatusCard,renderClassAEmail} from "../_shared/class-a-email.ts";

const SITE="https://lastbenchbd.com/class-a/course.html";
const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";

function registrationHtml(name:string,registrationId:number){
  const person=escapeClassAHtml(name||"there");
  const body='<p style="margin:0 0 18px">Dear '+person+',</p>'+
    '<p>Your CLASS[Λ] 20-class venture builder application has been recorded in the Last Bench registration system.</p>'+
    classAStatusCard([
      ["Reference", "#"+String(registrationId)],
      ["Application", "Received"],
      ["Seat acceptance", "To be confirmed separately"],
      ["Payment", "Verified separately"]
    ])+
    '<p>This acknowledges the application only. It does not constitute a seat acceptance or payment receipt. The CLASS[Λ] team will communicate these separately after verification.</p>'+
    classAButton("VIEW COURSE DETAILS",SITE);
  return renderClassAEmail({title:"APPLICATION\nRECEIVED.",eyebrow:"APPLICATION RECEIVED",body});
}

function db(){
  const url=Deno.env.get("SUPABASE_URL")||"";
  const json=Deno.env.get("SUPABASE_SECRET_KEYS")||"";
  const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
  let key=legacy;
  if(json){try{const x=JSON.parse(json);key=String(x.default||Object.values(x)[0]||legacy)}catch{}}
  if(!url||!key) throw new Error("supabase_admin_not_configured");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

async function mail(to:string,name:string,registrationId:number){
  const key=Deno.env.get("RESEND_API_KEY")||"";
  if(!key) throw new Error("missing_email_transport");
  const html=registrationHtml(name,registrationId);
  const text=`Hello ${name},\n\nYour CLASS[Λ] application is recorded. Reference #${registrationId}. This confirms application receipt only, not final seat acceptance or payment.\n\nCourse: ${SITE}\nQuestions: info@lastbenchbd.com`;
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject:"CLASS[Λ] — Application received",html,text})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(`email_failed:${body.message||r.status}`);
  if(!body.id) throw new Error("provider_email_id_missing_delivery_uncertain");
  return String(body.id);
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  if(!Deno.env.get("RESEND_API_KEY")) return new Response(JSON.stringify({ok:false,blocked:"missing_email_transport",sent:0,failed:0,skipped:0}),{status:503,headers:{"Content-Type":"application/json"}});
  const c=db();
  const {data:rows,error}=await c.from("class_a_signup_events")
    .select("id,registration_id,email_status,email_attempts")
    .in("email_status",["pending","failed"]).lt("email_attempts",5)
    .order("id",{ascending:true}).limit(25);
  if(error) throw error;
  const out={sent:0,skipped:0,failed:0};
  for(const e of rows||[]){
    const {data:r}=await c.from("class_a_registrations")
      .select("full_name,email,record_kind,program").eq("id",e.registration_id).maybeSingle();
    if(!r||r.record_kind!=="genuine"||r.program!=="course"||!r.email){
      await c.from("class_a_signup_events").update({email_status:"not_applicable",email_last_error:"not_genuine_course_or_missing_email"}).eq("id",e.id);
      out.skipped++; continue;
    }
    const {data:claimed,error:claimError}=await c.from("class_a_signup_events").update({email_status:"processing"}).eq("id",e.id).eq("email_status",e.email_status).eq("email_attempts",e.email_attempts).select("id").maybeSingle();
    if(claimError) throw claimError;
    if(!claimed){out.skipped++;continue;}
    try{
      const ref=await mail(r.email,r.full_name||"there",Number(e.registration_id));
      await c.from("class_a_signup_events").update({email_status:"sent",email_sent_at:new Date().toISOString(),email_external_ref:ref,email_last_error:null}).eq("id",e.id);
      out.sent++;
    }catch(err){
      const uncertain=String(err).includes("delivery_uncertain");
      await c.from("class_a_signup_events").update({email_status:uncertain?"processing":"failed",email_attempts:uncertain?e.email_attempts:(Number(e.email_attempts)||0)+1,email_last_error:String(err)}).eq("id",e.id).eq("email_status","processing");
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});