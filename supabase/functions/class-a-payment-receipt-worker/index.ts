import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

// OWNER-APPROVED RECEIPT VISUAL LOCK: 11 October 2026, Jatiya Sangsad Bhaban.
// More specific than the general 18 October 2026 CLASS[Λ] email body standard.
// See brand/class-a/PARLIAMENT_RECEIPT_LOCK.md for the exact artwork and proof steps.
// DO NOT toggle this until the PII-free, exact-logo, data-driven Parliament PDF renderer,
// visual QA, finance contract and safe delivery tests are proven and owner-approved.
const PARLIAMENT_RECEIPT_RENDERER_APPROVED = false;
const PARLIAMENT_RECEIPT_LOCK_ID = "CLASSA_PARLIAMENT_20261011";
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
  const green=rgb(0,0.77,0.32);
  const dark=rgb(0.035,0.085,0.065);
  const white=rgb(1,1,1);
  const muted=rgb(.42,.48,.45);
  const W=595.28;
  // Approved green/black/white design language. Parliament photo is intentionally
  // not fabricated: provide a verified, rights-cleared background asset separately.
  page.drawRectangle({x:0,y:0,width:W,height:841.89,color:rgb(.97,.98,.97)});
  page.drawRectangle({x:0,y:580,width:W,height:261.89,color:dark});
  page.drawRectangle({x:0,y:828,width:W,height:13.89,color:green});
  const logoResponse=await fetch(BRAND_LOGO);
  if(!logoResponse.ok) throw new Error("canonical_brand_logo_unavailable");
  const logo=await pdf.embedPng(new Uint8Array(await logoResponse.arrayBuffer()));
  const fit=logo.scaleToFit(200,72);
  // Use exact production logo; no substitute wordmark or AI-drawn logo.
  page.drawRectangle({x:34,y:738,width:fit.width+24,height:fit.height+18,color:white});
  page.drawImage(logo,{x:46,y:747,width:fit.width,height:fit.height});
  page.drawText("CLASS  /  HUMAN LAB",{x:46,y:697,size:11,font:bold,color:green});
  page.drawText("OFFICIAL PAYMENT RECEIPT",{x:46,y:656,size:24,font:bold,color:white});
  page.drawText("LAST BENCH  |  CREATING A LASTING BENCHMARK",{x:46,y:631,size:9,font:regular,color:rgb(.82,.91,.84)});
  page.drawRectangle({x:36,y:342,width:523,height:221,color:white});
  const rows=[
    ["RECEIPT NUMBER",input.receiptNumber],
    ["LEARNER",input.learner],
    ["REGISTRATION ID",String(input.registrationId)],
    ["PAYMENT METHOD",input.paymentMethod],
    ["TRANSACTION REFERENCE",input.transactionId],
    ["VERIFIED AT (UTC)",input.verifiedAt],
    ["VERIFICATION BASIS",input.verifiedBy]
  ];
  let y=535;
  for(const [k,v] of rows){
    page.drawText(k,{x:54,y,size:8,font:bold,color:muted});
    let value=String(v??"");
    let size=10;
    while(size>7 && regular.widthOfTextAtSize(value,size)>300) size-=.5;
    if(regular.widthOfTextAtSize(value,size)>300) throw new Error("receipt_field_too_long:"+k);
    page.drawText(value,{x:240,y,size,font:regular,color:dark});
    page.drawLine({start:{x:54,y:y-9},end:{x:539,y:y-9},thickness:.4,color:rgb(.86,.89,.86)});
    y-=29;
  }
  page.drawRectangle({x:36,y:221,width:523,height:102,color:dark});
  page.drawText("TOTAL RECEIVED",{x:54,y:289,size:10,font:bold,color:rgb(.80,.91,.84)});
  page.drawText("BDT "+input.amount,{x:54,y:248,size:28,font:bold,color:white});
  page.drawText("PAYMENT VERIFIED",{x:364,y:267,size:11,font:bold,color:green});
  page.drawText("Verified in Last Bench records",{x:364,y:248,size:8,font:regular,color:white});
  page.drawText("Verification is not bank reconciliation or seat acceptance.",{x:46,y:179,size:10,font:regular,color:dark});
  page.drawText("This receipt documents the recorded payment and verification basis.",{x:46,y:162,size:9,font:regular,color:muted});
  page.drawLine({start:{x:46,y:126},end:{x:549,y:126},thickness:.7,color:green});
  page.drawText("LAST BENCH  |  info@lastbenchbd.com  |  lastbenchbd.com",{x:46,y:104,size:9,font:bold,color:dark});
  page.drawText("Generated from verified payment fields. No signature or seal implied.",{x:46,y:87,size:8,font:regular,color:muted});
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
  // FAIL CLOSED BEFORE claiming any payment, incrementing attempts, or sending messages.
  // The previous generic receiptPdf()/paymentHtml() does NOT match the approved Parliament template.
  if (!PARLIAMENT_RECEIPT_RENDERER_APPROVED) {
    return new Response(JSON.stringify({ok:false,blocked:"parliament_receipt_template_not_implemented",
      design_lock:PARLIAMENT_RECEIPT_LOCK_ID,sent:0,failed:0,skipped:0}),
      {status:503,headers:{"Content-Type":"application/json"}});
  }
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