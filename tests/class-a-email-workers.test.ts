import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { transformSync } from "esbuild";
import { describe, expect, it } from "vitest";
import { escapeClassAHtml, safeClassAUrl, classAButton, classAStatusCard, classAPlainText, renderClassAEmail } from "../supabase/functions/_shared/class-a-email";
import { postclassClaimAccepted } from "../supabase/functions/_shared/class-a-postclass-claim";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const worker = (name: string) => readFileSync(resolve(root, "supabase/functions", name, "index.ts"), "utf8");
const confirmation = worker("class-a-course-confirmation-worker");
const receipt = worker("class-a-payment-receipt-worker");
const notification = worker("class-a-notification-worker");
const followup = worker("class-a-postclass-completion-worker");
const shared = readFileSync(resolve(root,"supabase/functions/_shared/class-a-email.ts"),"utf8");

describe("CLASS[Λ] locked transactional email contract", () => {
  it("parses all worker entrypoints and the shared renderer as TypeScript", () => {
    for (const source of [confirmation,receipt,notification,followup,shared]) {
      expect(() => transformSync(source, { loader:"ts",target:"es2022" })).not.toThrow();
    }
  });

  it("requires every sending worker to use the canonical dark renderer", () => {
    for (const source of [confirmation,receipt,notification,followup]) {
      expect(source).toContain('../_shared/class-a-email.ts');
      expect(source).toContain("renderClassAEmail");
      expect(source).not.toContain("background:#FAFAF8");
      expect(source).not.toContain("background:#F2F3F1");
    }
    expect(shared).toContain("#00C853");
    expect(shared).toContain("#222525");
    expect(shared).toContain("#101110");
    expect(shared).toContain("#1C2620");
    expect(shared).toContain("https://lastbenchbd.com/assets/logo-full.png");
  });

  it("renders a readable mobile-safe dark email with approved parent logo endorsement", () => {
    const html=renderClassAEmail({title:"APPLICATION\nRECEIVED.",body:'<p>Hello builder.</p>'+classAStatusCard([["Application","Received"]])+classAButton("VIEW COURSE","https://lastbenchbd.com/class-a/course.html")});
    expect(html).toContain("max-width:600px");
    expect(html).toContain('role="presentation"');
    expect(html).toContain("background:#101110");
    expect(html).toContain("background:#222525");
    expect(html).toContain("background:#1C2620");
    expect(html).toContain("APPLICATION<br>RECEIVED.");
    expect(html).toContain('alt="Last Bench — Creating a Lasting Benchmark"');
    expect(html).toContain("background:#101110;border-radius:5px");
    expect(html).toContain("CLASS[Λ]");
    expect(html).toContain("CLASS[Λ] · Last Bench");
    expect(html).toContain("padding:15px 22px");
    const plain=classAPlainText(html);
    expect(plain).toContain("APPLICATION");
    expect(plain).toContain("https://lastbenchbd.com/class-a/course.html");
  });

  it("escapes HTML in learner names, statuses, field values and CTA labels", () => {
    const attack='<img src=x onerror="alert(1)">';
    const body='<p>'+escapeClassAHtml(attack)+'</p>'+classAStatusCard([["Name",attack]])+classAButton(attack,"https://lastbenchbd.com/class-a");
    const html=renderClassAEmail({title:attack,body});
    expect(html).not.toContain(attack);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain("&lt;img");
    expect(html).toContain("&quot;alert(1)&quot;");
    expect(followup).toContain("escapeClassAHtml(name)");
    expect(followup).toContain("safeClassAUrl(pack)");
    expect(notification).toContain("name=escapeHtml(name)");
  });

  it("does not double-unescape encoded ampersands (CodeQL js/double-escaping regression)", () => {
    const once=classAPlainText("<p>&amp;lt;script&amp;gt;</p>");
    expect(once).toContain("&lt;script&gt;");
    expect(once).not.toContain("<script>");
    expect(classAPlainText("<p>A &amp; B &lt; C</p>")).toContain("A & B < C");
  });

  it("rejects hostile or ambiguous URLs and escapes valid query strings", () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,test','http://insecure.test','https://user:pass@lastbenchbd.com','https://lastbenchbd.com/\nInjected: true']) {
      expect(safeClassAUrl(bad)).toBe("");
      expect(classAButton("OPEN",bad)).toBe("");
    }
    expect(classAButton("OPEN","https://lastbenchbd.com/?a=1&b=2")).toContain("a=1&amp;b=2");
    expect(classAPlainText(classAButton("OPEN","https://lastbenchbd.com/path"))).toContain("https://lastbenchbd.com/path");
  });

  it("preserves admission/payment separation and hard receipt-specific Parliament PDF block", () => {
    expect(confirmation).toContain("It does not constitute a seat acceptance or payment receipt");
    expect(confirmation).toContain('["Application", "Received"]');
    expect(receipt).toContain("Payment verification is separate from final seat acceptance.");
    expect(receipt).toContain("Final seat acceptance is separate.");
    expect(receipt).toContain("Verification is not bank reconciliation or seat acceptance.");
    expect(receipt).toContain("const PARLIAMENT_RECEIPT_RENDERER_APPROVED = false;");
    expect(receipt).toContain('blocked:"parliament_receipt_template_not_implemented"');
    expect(receipt).not.toContain("YOUR SEAT IS SECURED");
    expect(receipt).not.toContain("10 October 2026");
    expect(receipt).toContain("row.payment_method");
    expect(receipt).toContain("pdf.embedPng");
  });

  it("holds provider-accepted-but-uncertain emails instead of inventing delivery evidence", () => {
    for (const source of [confirmation,notification,followup]) {
      expect(source).toContain("provider_email_id_missing_delivery_uncertain");
      expect(source).toContain("delivery_uncertain");
      expect(source).not.toContain('String(body.id||"resend")');
    }
    expect(followup).toContain('.eq("status","skipped")');
    expect(followup).toContain('.select("id,status").maybeSingle()');
    expect(followup).toContain("postclassClaimAccepted(claimed,item.id)");
    expect(followup).toContain("delivery_uncertain_provider_accepted");
    expect(confirmation).toContain('email_status:uncertain?"processing":"failed"');
    expect(notification).toContain('?"processing":"failed"');
  });

  it("preserves existing delivery/retry and payment evidence guards", () => {
    for (const source of [confirmation,receipt]) {
      expect(source).toContain('blocked:"missing_email_transport"');
      expect(source).toContain("status:503");
    }
    expect(confirmation).toContain('.eq("email_status",e.email_status)');
    expect(confirmation).toContain('.eq("email_attempts",e.email_attempts)');
    expect(receipt).toContain('.eq("status","verified")');
    expect(receipt).toContain('.in("receipt_status",["pending","failed"])');
    expect(receipt).toContain("receipt_external_ref:ref");
    expect(receipt).not.toContain('cc:["sayemahmed1891@gmail.com"');
    expect(notification).toContain("classAPlainText(html)");
    expect(followup).toContain("classAPlainText(html)");
  });
  it("fails closed when the deployed legacy post-class trigger rewrites an attempted processing claim", () => {
    const ddl = readFileSync(resolve(root,"drizzle/migrations/20261006095000_class_a_legacy_postclass_failclosed.sql"),"utf8");
    expect(ddl).toContain("new.status := 'skipped'");
    expect(ddl).toContain("new.status in ('pending','failed','processing')");
    // UPDATE ... RETURNING can return the row even though the BEFORE trigger
    // reverted its status. A returned row is NOT proof that an atomic claim held.
    expect(postclassClaimAccepted({id:42,status:"skipped"},42)).toBe(false);
    expect(postclassClaimAccepted({id:42,status:"processing"},42)).toBe(true);
    expect(postclassClaimAccepted({id:43,status:"processing"},42)).toBe(false);
    expect(postclassClaimAccepted(null,42)).toBe(false);
    const verificationAt = followup.indexOf("postclassClaimAccepted(claimed,item.id)");
    const sendAt = followup.indexOf("const ref=await send(reg.email");
    expect(verificationAt).toBeGreaterThan(0);
    expect(sendAt).toBeGreaterThan(verificationAt);
  });

});
