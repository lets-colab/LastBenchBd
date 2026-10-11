import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2";

const SITE="https://lastbenchbd.com/class-a/course.html";
const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";

const BRAND_LOGO="https://lastbenchbd.com/assets/logo-full.png"; // Fingerprinted canonical transparent production asset.
function esc(input:string){return String(input??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c));}
function registrationHtml(name:string,registrationId:number){
  const person=esc(name||"there");
  const reference=esc(String(registrationId));
  return \`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F2F3F1;color:#111111;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F2F3F1;border-collapse:collapse"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#FAFAF8;border-collapse:collapse;border:1px solid #DBE4DD">
<tr><td style="height:6px;background:#00C853;font-size:1px;line-height:1px">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 0"><img src="\${BRAND_LOGO}" alt="Last Bench — Creating a Lasting Benchmark" width="170" style="display:block;width:170px;max-width:70%;height:auto;border:0"></td></tr>
<tr><td style="padding:22px 28px 12px"><p style="margin:0 0 10px;color:#44624C;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.5px">CLASS[Λ] · HUMAN LAB</p>
<h1 style="margin:0;color:#111111;font-size:30px;line-height:1.12;letter-spacing:-.5px;font-weight:800">APPLICATION<br>RECEIVED<span style="color:#00C853">.</span></h1>
<p style="margin:22px 0 12px;font-size:15px;line-height:1.65">Hello \${person},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65">Your CLASS[Λ] 20-class venture builder application has been recorded in the Last Bench registration system.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6F2E9;border-left:4px solid #00C853;border-collapse:collapse"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.8">
<strong>Application reference:</strong> #\${reference}<br><strong>Application:</strong> Received<br><strong>Seat acceptance:</strong> Not confirmed by this email<br><strong>Payment:</strong> Handled and verified separately</td></tr></table>
<p style="margin:20px 0;font-size:14px;line-height:1.65">Please do not submit a second application. Admission and payment confirmation require separate verified evidence.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#00C853" style="border-radius:6px"><a href="\${SITE}" style="display:inline-block;padding:14px 20px;background:#00C853;border-radius:6px;color:#092715;text-decoration:none;font-size:14px;font-weight:700">VIEW COURSE DETAILS →</a></td></tr></table>
</td></tr><tr><td style="padding:22px 28px 26px"><p style="margin:0;padding-top:17px;border-top:1px solid #CBD7CF;color:#55635B;font-size:12px;line-height:1.65">CLASS[Λ] · Last Bench<br><a href="mailto:info@lastbenchbd.com" style="color:#154E2E">info@lastbenchbd.com</a></p></td></tr>
</table></td></tr></table></body></html>\`;
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
  return String(body.id||"resend");
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
      await c.from("class_a_signup_events").update({email_status:"failed",email_attempts:(Number(e.email_attempts)||0)+1,email_last_error:String(err)}).eq("id",e.id);
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});