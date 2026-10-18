/** Deterministic PII-free previews of the actual CLASS[Λ] email renderer.
 * For visual review only. Does not query students, payments or delivery services.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  classAButton, classAStatusCard, renderClassAEmail,
} from "../supabase/functions/_shared/class-a-email";

const out=resolve(process.cwd(),"artifacts/class-a-email-previews");
mkdirSync(out,{recursive:true});
const sampleNote='<p style="font-size:11px;line-height:1.5;color:#AFC8B8">DESIGN PREVIEW ONLY — FICTIONAL DATA, NOT A SENT MESSAGE OR PAYMENT RECORD.</p>';
const cases=[
  {
    key:"application-received",title:"APPLICATION\nRECEIVED.",eyebrow:"APPLICATION STATUS",
    body:'<p>Dear Sample Learner,</p><p>Your application has been recorded.</p>'+
      classAStatusCard([["Reference","#DEMO-001"],["Application","Received"],["Seat acceptance","Pending independent review"],["Payment","Not verified by this email"]])+
      '<p>Application acknowledgement is not admission or proof of payment.</p>'+
      classAButton("VIEW COURSE DETAILS","https://lastbenchbd.com/class-a/course.html")
  },
  {
    key:"course-quotation",title:"YOUR NEXT BUILD\nSTARTS HERE.",eyebrow:"PERSONAL COURSE QUOTATION",
    body:'<p>Dear Sample Learner,</p><p>Your requested quotation is ready.</p>'+
      classAStatusCard([["Course","20-Class One-Person Venture Builder"],["Fee","Use current approved quotation"],["Validity","Use current approved offer"],["Status","Quotation only; not an invoice or payment receipt"]])+
      '<p>Please confirm the current payable details through the authorized process.</p>'+
      classAButton("VIEW COURSE","https://lastbenchbd.com/class-a/course.html")
  },
  {
    key:"registration-confirmed",title:"COURSE REGISTRATION\nCONFIRMED.",eyebrow:"ENROLLMENT NOTICE — EXAMPLE ONLY",
    body:'<p>Dear Sample Learner,</p><p>In this fictional example, enrollment has already been independently verified.</p>'+
      classAStatusCard([["Course","20-Class One-Person Venture Builder"],["Status","Confirmed (fictional demonstration)"],["Schedule","Not announced in this preview"]])+
      '<p>Never send this status without evidence of authorized enrollment.</p>'+
      classAButton("VIEW COURSE","https://lastbenchbd.com/class-a/course.html")
  },
  {
    key:"payment-record",title:"PAYMENT RECORD\nVERIFIED.",eyebrow:"PAYMENT — EXAMPLE ONLY",
    body:'<p>Dear Sample Learner,</p><p>This demonstration does not verify or issue any actual payment receipt.</p>'+
      classAStatusCard([["Receipt","SAMPLE-NOT-VALID"],["Amount","Sample only; no money recorded"],["Admission","Separate from any payment"]])+
      '<p>The Parliament-themed PDF receipt remains separately fail-closed until specific owner approval.</p>'+
      classAButton("VIEW COURSE DETAILS","https://lastbenchbd.com/class-a/course.html")
  }
];
for(const entry of cases){
  const html=renderClassAEmail({title:entry.title,eyebrow:entry.eyebrow,body:sampleNote+entry.body});
  writeFileSync(resolve(out,entry.key+".html"),html,"utf8");
}
console.log("Prepared "+cases.length+" fictional preview HTML files in "+out);
