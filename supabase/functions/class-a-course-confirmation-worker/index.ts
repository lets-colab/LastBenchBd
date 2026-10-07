import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";

const SITE="https://lastbenchbd.com/class-a/course.html";
const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";

function db(){
  const url=Deno.env.get("SUPABASE_URL")||"";
  const json=Deno.env.get("SUPABASE_SECRET_KEYS")||"";
  const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
  let key=legacy;
  if(json){try{const x=JSON.parse(json);key=String(x.default||Object.values(x)[0]||legacy)}catch{}}
  if(!url||!key) throw new Error("supabase_admin_not_configured");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

async function mail(to:string,name:string){
  const key=Deno.env.get("RESEND_API_KEY")||"";
  if(!key) throw new Error("missing_email_transport");
  const html=`<p>Hi ${name},</p><p>We received your CLASS[Λ] course registration successfully.</p><p>This confirms that your registration details are in the Last Bench system. Registration is separate from payment or final enrollment; those states require their own evidence.</p><p><a href="${SITE}">OPEN COURSE DETAILS</a></p><p>If you already completed a payment or enrollment step, keep the receipt or confirmation until it is reconciled with the official record.</p>`;
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:FROM,to:[to],subject:"CLASS[Λ] — Course registration received",html})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(`email_failed:${body.message||r.status}`);
  return String(body.id||"resend");
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
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
    await c.from("class_a_signup_events").update({email_status:"processing"}).eq("id",e.id);
    try{
      const ref=await mail(r.email,r.full_name||"there");
      await c.from("class_a_signup_events").update({email_status:"sent",email_sent_at:new Date().toISOString(),email_external_ref:ref,email_last_error:null}).eq("id",e.id);
      out.sent++;
    }catch(err){
      await c.from("class_a_signup_events").update({email_status:"failed",email_attempts:(Number(e.email_attempts)||0)+1,email_last_error:String(err)}).eq("id",e.id);
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});