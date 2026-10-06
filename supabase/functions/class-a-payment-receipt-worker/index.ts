import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const SITE="https://lastbenchbd.com/class-a/course.html";
const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";
const RESEND_KEY=Deno.env.get("RESEND_API_KEY")||"";

function admin(){
  const url=Deno.env.get("SUPABASE_URL")||"";
  const mapRaw=Deno.env.get("SUPABASE_SECRET_KEYS")||"";
  const legacy=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
  let key=legacy;
  if(mapRaw){try{const x=JSON.parse(mapRaw);key=String(x.default||Object.values(x)[0]||legacy)}catch{}}
  if(!url||!key) throw new Error("supabase_admin_not_configured");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

function esc(s:string){
  return String(s||"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c));
}

function base64(bytes:Uint8Array){
  let out="";
  const step=0x8000;
  for(let i=0;i<bytes.length;i+=step){
    out += String.fromCharCode(...bytes.subarray(i,Math.min(i+step,bytes.length)));
  }
  return btoa(out);
}

async function receiptPdf(input:{
  receiptNumber:string; learner:string; registrationId:number; amount:string;
  transactionId:string; verifiedAt:string; verifiedBy:string;
}){
  const pdf=await PDFDocument.create();
  const page=pdf.addPage([595.28,841.89]);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const green=rgb(0,0.65,0.27);
  const dark=rgb(0.05,0.07,0.06);
  page.drawRectangle({x:0,y:829,width:595.28,height:12,color:green});
  page.drawText("LAST BENCH / CLASS A",{x:44,y:780,size:12,font:bold,color:dark});
  page.drawText("OFFICIAL PAYMENT RECEIPT",{x:44,y:735,size:25,font:bold,color:dark});
  page.drawText("Verified learner payment evidence",{x:44,y:712,size:11,font:regular,color:rgb(.35,.38,.36)});
  const rows=[
    ["Receipt",input.receiptNumber],
    ["Learner",input.learner],
    ["Registration ID",String(input.registrationId)],
    ["Amount","BDT "+input.amount],
    ["Payment method","bKash"],
    ["Transaction ID",input.transactionId],
    ["Verified at",input.verifiedAt],
    ["Verified by",input.verifiedBy],
    ["Status","PAID / VERIFIED"]
  ];
  let y=655;
  for(const [k,v] of rows){
    page.drawText(k.toUpperCase(),{x:44,y,size:9,font:bold,color:rgb(.35,.38,.36)});
    page.drawText(v,{x:190,y,size:11,font:regular,color:dark});
    page.drawLine({start:{x:44,y:y-10},end:{x:551,y:y-10},thickness:.5,color:rgb(.85,.88,.86)});
    y-=45;
  }
  page.drawRectangle({x:44,y:160,width:507,height:78,color:rgb(.94,.98,.95)});
  page.drawText("PAYMENT VERIFIED",{x:62,y:204,size:12,font:bold,color:green});
  page.drawText("This receipt confirms the payment recorded in the CLASS A payment ledger.",{x:62,y:183,size:10,font:regular,color:dark});
  page.drawText("If any detail is incorrect, contact Last Bench before relying on this receipt.",{x:62,y:166,size:9,font:regular,color:rgb(.35,.38,.36)});
  page.drawText("Sayem Ahmed · Co-Founder & CEO",{x:44,y:104,size:9,font:regular,color:dark});
  page.drawText("Erfan Uddin · Co-Founder & CBIO",{x:44,y:88,size:9,font:regular,color:dark});
  page.drawText("Fahim Shahbaz Mahmud · Co-Founder & COO",{x:44,y:72,size:9,font:regular,color:dark});
  return new Uint8Array(await pdf.save());
}

async function sendReceipt(row:any, reg:any){
  if(!RESEND_KEY) throw new Error("missing_email_transport");
  if(!reg?.email) throw new Error("missing_learner_email");
  const pdf=await receiptPdf({
    receiptNumber:row.receipt_number,
    learner:reg.full_name||"CLASS learner",
    registrationId:Number(row.registration_id),
    amount:Number(row.amount_received).toFixed(2),
    transactionId:row.transaction_id||"",
    verifiedAt:new Date(row.verified_at).toISOString(),
    verifiedBy:row.verified_by||"Last Bench"
  });
  const html=`<div style="font-family:Arial,Helvetica,sans-serif;color:#111312;max-width:680px;margin:auto">
  <div style="height:7px;background:#00C853"></div>
  <div style="padding:28px 30px">
    <div style="font-size:13px;font-weight:900;letter-spacing:1px">CLASS[Λ] × LAST BENCH</div>
    <h1 style="font-size:32px;line-height:1.05;margin:18px 0 12px">PAYMENT VERIFIED.<br>YOUR SEAT IS SECURED.</h1>
    <p>Hi ${esc(reg.full_name||"there")},</p>
    <p>Your CLASS[Λ] course payment has been verified against the submitted evidence.</p>
    <div style="background:#F1FAF4;border:1px solid #BCECCB;border-radius:14px;padding:18px;margin:18px 0">
      <strong>Receipt:</strong> ${esc(row.receipt_number)}<br>
      <strong>Amount:</strong> BDT ${Number(row.amount_received).toFixed(2)}<br>
      <strong>Transaction ID:</strong> ${esc(row.transaction_id)}<br>
      <strong>Status:</strong> PAID / VERIFIED
    </div>
    <p>Your official PDF receipt is attached. The current batch starts on <strong>10 October 2026</strong>; exact class timing and onboarding instructions are communicated separately.</p>
    <p><a href="${SITE}" style="display:inline-block;background:#00C853;color:#001B0B;text-decoration:none;font-weight:900;padding:11px 16px;border-radius:999px">VIEW CLASS[Λ] COURSE →</a></p>
    <p style="font-size:12px;color:#68716c;margin-top:24px">Sayem Ahmed · Co-Founder & CEO<br>Erfan Uddin · Co-Founder & CBIO<br>Fahim Shahbaz Mahmud · Co-Founder & COO</p>
  </div></div>`;
  const r=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:`Bearer ${RESEND_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      from:FROM,
      to:[reg.email],
      cc:["sayemahmed1891@gmail.com","fahimshahbaz95@gmail.com"],
      subject:`CLASS[Λ] — Payment Confirmed | ${row.receipt_number}`,
      html,
      attachments:[{filename:`${row.receipt_number}.pdf`,content:base64(pdf)}]
    })
  });
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(`email_failed:${body.message||r.status}`);
  return String(body.id||"resend");
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  const c=admin();
  const {data:rows,error}=await c.from("class_a_payments")
    .select("id,registration_id,amount_received,transaction_id,verified_at,verified_by,receipt_number,receipt_status,receipt_attempts")
    .eq("status","verified")
    .in("receipt_status",["pending","failed"])
    .lt("receipt_attempts",5)
    .order("verified_at",{ascending:true})
    .limit(20);
  if(error) throw error;

  const out:any={sent:0,failed:0,skipped:0};
  for(const row of rows||[]){
    const {data:claimed}=await c.from("class_a_payments")
      .update({receipt_status:"processing",receipt_attempts:Number(row.receipt_attempts||0)+1,updated_at:new Date().toISOString(),receipt_last_error:null})
      .eq("id",row.id)
      .in("receipt_status",["pending","failed"])
      .select("id")
      .maybeSingle();
    if(!claimed){out.skipped++;continue;}

    const {data:reg}=await c.from("class_a_registrations")
      .select("id,full_name,email,record_kind,program")
      .eq("id",row.registration_id).maybeSingle();

    try{
      if(!reg||reg.record_kind!=="genuine"||reg.program!=="course") throw new Error("ineligible_course_registration");
      const ref=await sendReceipt(row,reg);
      const now=new Date().toISOString();
      await c.from("class_a_payments").update({
        receipt_status:"sent",receipt_sent_at:now,receipt_external_ref:ref,receipt_last_error:null,updated_at:now
      }).eq("id",row.id);
      await c.from("class_a_payment_events").insert({
        payment_id:row.id,event_type:"receipt_sent",actor_ref:"class-a-payment-receipt-worker",
        evidence:{external_ref:ref,channel:"email"}
      });
      out.sent++;
    }catch(err){
      await c.from("class_a_payments").update({
        receipt_status:"failed",receipt_last_error:String(err).slice(0,500),updated_at:new Date().toISOString()
      }).eq("id",row.id);
      await c.from("class_a_payment_events").insert({
        payment_id:row.id,event_type:"receipt_failed",actor_ref:"class-a-payment-receipt-worker",
        evidence:{error:String(err).slice(0,500)}
      });
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});