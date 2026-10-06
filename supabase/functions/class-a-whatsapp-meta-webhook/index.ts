import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")||"";
const secretMap=(()=>{try{return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}")}catch{return {}}})();
const legacySecret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||Deno.env.get("SUPABASE_SECRET_KEY")||"";
const adminKey=String(secretMap.default||Object.values(secretMap)[0]||legacySecret||"");
const META_VERIFY_TOKEN=Deno.env.get("META_WHATSAPP_WEBHOOK_VERIFY_TOKEN")||"";
const META_APP_SECRET=Deno.env.get("META_WHATSAPP_APP_SECRET")||"";
const META_TOKEN=Deno.env.get("META_WHATSAPP_ACCESS_TOKEN")||"";
const META_GRAPH_VERSION=Deno.env.get("META_WHATSAPP_GRAPH_VERSION")||"v23.0";

if(!SUPABASE_URL||!adminKey) throw new Error("supabase_admin_not_configured");
const db=createClient(SUPABASE_URL,adminKey,{auth:{persistSession:false,autoRefreshToken:false}});

function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store, max-age=0","x-content-type-options":"nosniff"}})}
function safeEqual(a:string,b:string){const ea=new TextEncoder().encode(a),eb=new TextEncoder().encode(b);if(ea.length!==eb.length)return false;let diff=0;for(let i=0;i<ea.length;i++)diff|=ea[i]^eb[i];return diff===0}
function normalizeLocalPhone(value:unknown){let digits=String(value||"").replace(/\D/g,"");if(digits.startsWith("880"))digits="0"+digits.slice(3);if(digits.length===10&&digits.startsWith("1"))digits="0"+digits;return digits}
function inboundText(message:any){
  if(message?.type==="text")return String(message?.text?.body||"");
  if(message?.type==="button")return String(message?.button?.text||message?.button?.payload||"");
  if(message?.type==="interactive")return String(message?.interactive?.button_reply?.id||message?.interactive?.button_reply?.title||message?.interactive?.list_reply?.id||message?.interactive?.list_reply?.title||"");
  if(message?.type==="image")return String(message?.image?.caption||"");
  if(message?.type==="document")return String(message?.document?.caption||message?.document?.filename||"");
  return "";
}
function isPaymentEvidence(message:any,text:string){
  const t=String(text||"").toLowerCase();
  return ["image","document"].includes(String(message?.type||"")) || /(paid|payment|bkash|b-kash|trx|transaction|receipt|৫০০০|5000)/i.test(t);
}
async function verifySignature(body:Uint8Array,header:string){
  if(!META_APP_SECRET||!header.startsWith("sha256="))return false;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(META_APP_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=new Uint8Array(await crypto.subtle.sign("HMAC",key,body));
  const expected="sha256="+Array.from(sig).map(b=>b.toString(16).padStart(2,"0")).join("");
  return safeEqual(expected,header);
}
async function bridge(payload:Record<string,unknown>){
  const response=await fetch(`${SUPABASE_URL}/functions/v1/class-a-whatsapp-bridge`,{method:"POST",headers:{"content-type":"application/json","apikey":adminKey},body:JSON.stringify(payload)});
  const body=await response.json().catch(()=>({}));
  return {ok:response.ok&&body?.ok===true,status:response.status,body};
}
async function resolveRegistration(phone:string,program:"course"|"masterclass"){
  const {data,error}=await db.from("class_a_registrations").select("id,phone,record_kind,program").eq("record_kind","genuine").eq("program",program);
  if(error)throw error;
  const matches=(data||[]).filter((row:any)=>normalizeLocalPhone(row.phone)===phone);
  return matches.length===1?matches[0]:null;
}
function mediaDescriptor(message:any){
  if(message?.type==="image"&&message?.image?.id)return {id:String(message.image.id),mime:String(message.image.mime_type||"image/jpeg"),kind:"image"};
  if(message?.type==="document"&&message?.document?.id)return {id:String(message.document.id),mime:String(message.document.mime_type||"application/pdf"),kind:"document"};
  return null;
}
function extensionFor(mime:string){if(mime==="image/png")return"png";if(mime==="application/pdf")return"pdf";return"jpg"}
async function fetchAndStoreMedia(message:any,registrationId:number,externalRef:string){
  const media=mediaDescriptor(message);
  if(!media||!META_TOKEN)return {storagePath:null,messageType:String(message?.type||"unknown")+"_unfetched"};
  const meta=await fetch(`https://graph.facebook.com/${encodeURIComponent(META_GRAPH_VERSION)}/${encodeURIComponent(media.id)}`,{headers:{authorization:`Bearer ${META_TOKEN}`},signal:AbortSignal.timeout(15000)});
  const metaBody:any=await meta.json().catch(()=>({}));
  if(!meta.ok||!metaBody?.url)return {storagePath:null,messageType:media.kind+"_unfetched"};
  const file=await fetch(String(metaBody.url),{headers:{authorization:`Bearer ${META_TOKEN}`},signal:AbortSignal.timeout(20000)});
  if(!file.ok)return {storagePath:null,messageType:media.kind+"_unfetched"};
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(bytes.length>10*1024*1024)return {storagePath:null,messageType:media.kind+"_too_large"};
  const mime=String(metaBody?.mime_type||media.mime||file.headers.get("content-type")||"image/jpeg").split(";")[0];
  if(!["image/jpeg","image/png","application/pdf"].includes(mime))return {storagePath:null,messageType:media.kind+"_unsupported"};
  const safeRef=externalRef.replace(/[^A-Za-z0-9._-]/g,"_").slice(0,120);
  const path=`${registrationId}/${new Date().toISOString().slice(0,10)}/${safeRef}.${extensionFor(mime)}`;
  const {error}=await db.storage.from("class-a-payment-proof").upload(path,bytes,{contentType:mime,upsert:false});
  if(error&&!String(error.message||error).toLowerCase().includes("already exists"))return {storagePath:null,messageType:media.kind+"_store_failed"};
  return {storagePath:path,messageType:media.kind};
}
async function recordPayment(registrationId:number,message:any,externalRef:string,phone:string,text:string){
  const stored=await fetchAndStoreMedia(message,registrationId,externalRef);
  const {data,error}=await db.schema("private").rpc("class_a_record_payment_evidence",{
    p_registration_id:registrationId,
    p_provider:"meta",
    p_external_ref:externalRef,
    p_message_type:stored.messageType,
    p_sender_phone:phone,
    p_storage_path:stored.storagePath,
    p_text_hint:String(text||"").slice(0,500)
  });
  if(error)throw error;
  return {paymentId:data,storagePath:stored.storagePath,messageType:stored.messageType};
}

Deno.serve(async(req:Request)=>{
  const url=new URL(req.url);
  if(req.method==="GET"){
    const mode=url.searchParams.get("hub.mode")||"",token=url.searchParams.get("hub.verify_token")||"",challenge=url.searchParams.get("hub.challenge")||"";
    if(mode==="subscribe"&&META_VERIFY_TOKEN&&safeEqual(token,META_VERIFY_TOKEN)&&challenge)return new Response(challenge,{status:200,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
    return json({ok:false,error:"verification_failed"},403);
  }
  if(req.method!=="POST")return json({ok:false,error:"method_not_allowed"},405);
  const raw=new Uint8Array(await req.arrayBuffer());
  const signature=req.headers.get("x-hub-signature-256")||"";
  if(!(await verifySignature(raw,signature)))return json({ok:false,error:"invalid_signature"},401);
  let payload:any;try{payload=JSON.parse(new TextDecoder().decode(raw))}catch{return json({ok:false,error:"invalid_json"},400)}
  let inboundProcessed=0,statusProcessed=0,paymentProcessed=0,ignored=0;

  for(const entry of payload?.entry||[]){
    for(const change of entry?.changes||[]){
      const value=change?.value||{};
      for(const status of value?.statuses||[]){
        const externalRef=String(status?.id||""),normalizedStatus=String(status?.status||"").toLowerCase();
        if(!externalRef||!["sent","delivered","failed"].includes(normalizedStatus)){ignored++;continue}
        const {data:event}=await db.from("class_a_whatsapp_events").select("session_id,registration_id").eq("provider","meta").eq("external_ref",externalRef).maybeSingle();
        if(!event?.session_id||!event?.registration_id){ignored++;continue}
        const result=await bridge({kind:"outbound_receipt",provider:"meta",external_ref:externalRef,session_id:event.session_id,registration_id:Number(event.registration_id),status:normalizedStatus});
        if(result.ok)statusProcessed++;else ignored++;
      }

      for(const message of value?.messages||[]){
        const externalRef=String(message?.id||""),phone=normalizeLocalPhone(message?.from),text=inboundText(message);
        if(!externalRef||!/^01\d{9}$/.test(phone)){ignored++;continue}

        const courseReg=await resolveRegistration(phone,"course");
        if(courseReg?.id&&isPaymentEvidence(message,text)){
          try{
            await recordPayment(Number(courseReg.id),message,externalRef,phone,text);
            paymentProcessed++;
          }catch(error){
            console.error("payment_evidence_ingest_failed",String(error));
            ignored++;
          }
          continue;
        }

        const registration=await resolveRegistration(phone,"masterclass");
        if(!registration?.id||!text){ignored++;continue}
        const {data:outbound}=await db.from("class_a_whatsapp_events").select("session_id").eq("provider","meta").eq("registration_id",Number(registration.id)).eq("direction","outbound").in("status",["sent","delivered"]).order("occurred_at",{ascending:false}).limit(1).maybeSingle();
        if(!outbound?.session_id){ignored++;continue}
        const result=await bridge({kind:"inbound_reply",provider:"meta",external_ref:externalRef,session_id:outbound.session_id,phone,text});
        if(result.ok)inboundProcessed++;else ignored++;
      }
    }
  }
  return json({ok:true,provider:"meta",inbound_processed:inboundProcessed,payment_evidence_processed:paymentProcessed,status_processed:statusProcessed,ignored});
});