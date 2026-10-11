import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const SITE="https://lastbenchbd.com/class-a/course.html";
const FROM=Deno.env.get("CLASS_A_EMAIL_FROM")||"CLASS[Λ] <info@lastbenchbd.com>";
const RESEND_KEY=Deno.env.get("RESEND_API_KEY")||"";

const BRAND_LOGO="https://lastbenchbd.com/assets/logo-full.png"; // Exact transparent production asset from brand lock.
function paymentHtml(row:any,reg:any){
  const name=esc(reg.full_name||"there");
  const receipt=esc(row.receipt_number||"");
  const txn=esc(row.transaction_id||"Not specified");
  const method=esc(row.payment_method||"Not specified");
  const amount=Number(row.amount_received).toLocaleString("en-BD",{minimumFractionDigits:2,maximumFractionDigits:2});
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F2F3F1;color:#111111;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F2F3F1;border-collapse:collapse"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FAFAF8;border-collapse:collapse;border:1px solid #DBE4DD">
<tr><td style="height:6px;background:#00C853;font-size:1px;line-height:1px">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 0"><img src="${BRAND_LOGO}" alt="Last Bench — Creating a Lasting Benchmark" width="170" style="display:block;width:170px;max-width:70%;height:auto;border:0"></td></tr>
<tr><td style="padding:22px 28px 12px">
<p style="margin:0 0 10px;color:#44624C;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.5px">CLASS[Λ] · HUMAN LAB</p>
<h1 style="margin:0;color:#111111;font-size:30px;line-height:1.12;font-weight:800">PAYMENT RECORD<br>VERIFIED<span style="color:#00C853">.</span></h1>
<p style="margin:22px 0 12px;font-size:15px;line-height:1.65">Hello ${name},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.65">Last Bench has verified the payment record for your CLASS[Λ] course against the evidence available to the team. Your official PDF receipt is attached.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E6F2E9;border-left:4px solid #00C853;border-collapse:collapse"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.8">
<strong>Receipt:</strong> ${receipt}<br><strong>Amount received:</strong> BDT ${amount}<br><strong>Method:</strong> ${method}<br><strong>Transaction reference:</strong> ${txn}<br><strong>Payment record:</strong> Verified by Last Bench</td></tr></table>
<p style="margin:20px 0;font-size:14px;line-height:1.65">Payment verification is separate from final seat acceptance. Class timing and onboarding are communicated through the verified admission route.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#00C853" style="border-radius:6px"><a href="${SITE}" style="display:inline-block;padding:14px 20px;background:#00C853;border-radius:6px;color:#092715;text-decoration:none;font-size:14px;font-weight:700">VIEW COURSE DETAILS →</a></td></tr></table>
</td></tr><tr><td style="padding:22px 28px 26px"><p style="margin:0;padding-top:17px;border-top:1px solid #CBD7CF;color:#55635B;font-size:12px;line-height:1.65">CLASS[Λ] · Last Bench<br><a href="mailto:info@lastbenchbd.com" style="color:#154E2E">info@lastbenchbd.com</a></p></td></tr></table></td></tr></table></body></html>`;
}


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
  transactionId:string; verifiedAt:string; verifiedBy:string; paymentMethod:string;
}){
  const pdf=await PDFDocument.create();
  const page=pdf.addPage([595.28,841.89]);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const green=rgb(0,0.65,0.27);
  const dark=rgb(0.05,0.07,0.06);
  page.drawRectangle({x:0,y:829,width:595.28,height:12,color:green});
  const logoResponse=await fetch(BRAND_LOGO);
  if(!logoResponse.ok) throw new Error("canonical_brand_logo_unavailable");
  const logo=await pdf.embedPng(new Uint8Array(await logoResponse.arrayBuffer()));
  const fit=logo.scaleToFit(170,66);
  page.drawImage(logo,{x:44,y:771,width:fit.width,height:fit.height});
  page.drawText("OFFICIAL PAYMENT RECEIPT",{x:44,y:719,size:23,font:bold,color:dark});
  page.drawText("CLASS VENTURE BUILDER - PAYMENT RECORD",{x:44,y:697,size:10,font:regular,color:rgb(.35,.38,.36)});
  const rows=[
    ["Receipt",input.receiptNumber],
    ["Learner",input.learner],
    ["Registration ID",String(input.registrationId)],
    ["Amount","BDT "+input.amount],
    ["Payment method",input.paymentMethod],
    ["Transaction ID",input.transactionId],
    ["Verified at",input.verifiedAt],
    ["Verified by",input.verifiedBy],
    ["Status","VERIFIED BY LAST BENCH"]
  ];
  let y=648;
  for(const [k,v] of rows){
    page.drawText(k.toUpperCase(),{x:44,y,size:9,font:bold,color:rgb(.35,.38,.36)});
    let value=String(v??"");
    let size=11;
    while(size>8 && regular.widthOfTextAtSize(value,size)>355) size-=0.5;
    while(value.length>4 && regular.widthOfTextAtSize(value,size)>355) value=value.slice(0,-2)+"…";
    page.drawText(value,{x:190,y,size,font:regular,color:dark});
    page.drawLine({start:{x:44,y:y-10},end:{x:551,y:y-10},thickness:.5,color:rgb(.85,.88,.86)});
    y-=45;
  }
  page.drawRectangle({x:44,y:160,width:507,height:78,color:rgb(.94,.98,.95)});
  page.drawText("PAYMENT VERIFIED",{x:62,y:204,size:12,font:bold,color:green});
  page.drawText("Payment verified in Last Bench records against available evidence.",{x:62,y:183,size:9,font:regular,color:dark});
  page.drawText("Final admission is verified separately; contact Last Bench for corrections.",{x:62,y:166,size:9,font:regular,color:rgb(.35,.38,.36)});
  page.drawText("LAST BENCH  |  info@lastbenchbd.com",{x:44,y:91,size:10,font:bold,color:dark});
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
    verifiedBy:row.verified_by||"Last Bench",
    paymentMethod:row.payment_method||"Not specified"
  });
  const html=paymentHtml(row,reg);
  const text=`Hello ${reg.full_name||"there"},\n\nThe CLASS[Λ] payment record is verified by Last Bench. Receipt: ${row.receipt_number}. Amount: BDT ${Number(row.amount_received).toFixed(2)}. See attached receipt. Final seat acceptance is separate.\n\n${SITE}`;
  const r=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{Authorization:`Bearer ${RESEND_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      from:FROM,
      to:[reg.email],
      subject:`CLASS[Λ] — Payment Confirmed | ${row.receipt_number}`,
      html,text,
      attachments:[{filename:`${row.receipt_number}.pdf`,content:base64(pdf)}]
    })
  });
  const body=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(`email_failed:${body.message||r.status}`);
  if(!body.id) throw new Error("provider_receipt_id_missing_delivery_uncertain");
  return String(body.id);
}

Deno.serve(async(req)=>{
  if(req.method!=="POST") return new Response("method_not_allowed",{status:405});
  if(!RESEND_KEY) return new Response(JSON.stringify({ok:false,blocked:"missing_email_transport",sent:0,failed:0,skipped:0}),{status:503,headers:{"Content-Type":"application/json"}});
  const c=admin();
  const {data:rows,error}=await c.from("class_a_payments")
    .select("id,registration_id,amount_received,payment_method,transaction_id,verified_at,verified_by,receipt_number,receipt_status,receipt_attempts")
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
      const {data:recorded,error:recordError}=await c.from("class_a_payments").update({
        receipt_status:"sent",receipt_sent_at:now,receipt_external_ref:ref,receipt_last_error:null,updated_at:now
      }).eq("id",row.id).eq("receipt_status","processing").select("id").maybeSingle();
      if(recordError||!recorded) throw new Error("delivery_uncertain_provider_accepted:"+ref);
      await c.from("class_a_payment_events").insert({
        payment_id:row.id,event_type:"receipt_sent",actor_ref:"class-a-payment-receipt-worker",
        evidence:{external_ref:ref,channel:"email"}
      });
      out.sent++;
    }catch(err){
      const uncertain=String(err).includes("delivery_uncertain");
      await c.from("class_a_payments").update({
        receipt_status:uncertain?"processing":"failed",receipt_last_error:String(err).slice(0,500),updated_at:new Date().toISOString()
      }).eq("id",row.id).eq("receipt_status","processing");
      await c.from("class_a_payment_events").insert({
        payment_id:row.id,event_type:"receipt_failed",actor_ref:"class-a-payment-receipt-worker",
        evidence:{error:String(err).slice(0,500)}
      });
      out.failed++;
    }
  }
  return new Response(JSON.stringify({ok:true,...out}),{headers:{"Content-Type":"application/json"}});
});