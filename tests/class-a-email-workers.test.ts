import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { transformSync } from "esbuild";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const worker = (name: string) =>
  readFileSync(resolve(root, "supabase/functions", name, "index.ts"), "utf8");
const confirmation = worker("class-a-course-confirmation-worker");
const receipt = worker("class-a-payment-receipt-worker");

describe("CLASS[Λ] branded transactional email contract", () => {
  it("parses both deployed-worker entrypoints as TypeScript", () => {
    for (const source of [confirmation, receipt]) {
      expect(() => transformSync(source, { loader: "ts", target: "es2022" })).not.toThrow();
    }
  });

  it("uses the exact locked Last Bench transparent production logo in both templates", () => {
    const expected = "https://lastbenchbd.com/assets/logo-full.png";
    for (const source of [confirmation, receipt]) {
      expect(source).toContain(expected);
      expect(source).toContain("CLASS[Λ]");
      expect(source).toContain("Creating a Lasting Benchmark");
      expect(source).toContain("#00C853");
      expect(source).toContain("#FAFAF8");
      expect(source).toContain('role="presentation"');
      expect(source).toContain("max-width:600px");
      expect(source).not.toContain("design-system/logo.svg");
    }
    expect(receipt).toContain("pdf.embedPng");
    expect(receipt).toContain("logo.scaleToFit");
  });

  it("does not turn registration or payment into an admission decision", () => {
    expect(confirmation).toContain("Not confirmed by this email");
    expect(confirmation).toContain("Application reference:");
    expect(receipt).toContain("Payment verification is separate from final seat acceptance.");
    expect(receipt).toContain("Final seat acceptance is separate.");
    expect(receipt).toContain("Verification is not bank reconciliation or seat acceptance.");
    expect(receipt).not.toContain("YOUR SEAT IS SECURED");
    expect(receipt).not.toContain("10 October 2026");
    expect(receipt).not.toContain('["Payment method","bKash"]');
    expect(receipt).toContain("row.payment_method");
  });

  it("handles missing mail transport without burning retries or sending duplicates", () => {
    for (const source of [confirmation, receipt]) {
      expect(source).toContain('blocked:"missing_email_transport"');
      expect(source).toContain("status:503");
    }
    expect(confirmation).toContain('.eq("email_status",e.email_status)');
    expect(confirmation).toContain('.eq("email_attempts",e.email_attempts)');
    expect(receipt).toContain('.in("receipt_status",["pending","failed"])');
    expect(receipt).not.toContain('cc:["sayemahmed1891@gmail.com"');
  });

  it("escapes learner fields before inserting them into HTML", () => {
    expect(confirmation).toContain("function esc(input:string)");
    expect(confirmation).toContain("const person=esc(name");
    expect(receipt).toContain("const name=esc(reg.full_name");
    expect(receipt).toContain("const txn=esc(row.transaction_id");
  });
});
