import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { transformSync } from "esbuild";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(resolve(root, "supabase/functions/class-a-notification-worker/index.ts"), "utf8");
const email = readFileSync(resolve(root, "supabase/functions/_shared/class-a-email.ts"), "utf8");
const due = source.slice(source.indexOf("const {data:due,error:dueError}="));
const signup = source.slice(source.indexOf("const {data:signupRows"));

describe("CLASS[Λ] notification fail-closed worker", () => {
  it("parses TypeScript before deployment", () => {
    expect(() => transformSync(source, {loader:"ts",target:"es2022"})).not.toThrow();
  });
  it("uses the standalone dedicated course sender only", () => {
    expect(source).toContain("class-a-course-confirmation-worker");
    expect(source).not.toContain("const {data:courseEmailRows");
    expect(source).not.toContain("courseRegistrationCopy(reg.full_name)");
    expect(due).toContain('.from("class_a_session_notifications")');
  });
  it("claims each due event atomically against current status and attempt count", () => {
    expect(due).toContain('.update({status:"processing"}).eq("id",item.id)');
    expect(due).toContain('.eq("status",item.status).eq("attempts",item.attempts)');
    expect(due).toContain("if(!claimed){report.email.skipped++;continue;}");
  });
  it("never sends schedule notices after a session starts, completes or is canceled", () => {
    expect(due).toContain('"title,status,starts_at,ends_at');
    expect(due).toContain('["completed","cancelled","canceled"]');
    expect(due).toContain('startTime<=Date.now()');
    expect(due).toContain('expired_or_closed_session');
    expect(due).toContain('notification_type==="reminder_24h"');
    expect(due).toContain('notification_type==="reminder_6h"');
    expect(due).toContain('notification_type==="room_open"');
    expect(due.indexOf('expired_or_closed_session')).toBeLessThan(due.indexOf('if(!RESEND_API_KEY)'));
  });
  it("does not consume email retries when the provider credential is unavailable", () => {
    expect(due).toContain('last_error:"missing_email_transport"');
    expect(due).toContain('status:item.status');
    expect(due).toContain('report.email.blocked++');
    expect(due).toContain('if(!RESEND_API_KEY)');
  });
  it("preserves verified completion criteria before sending after-class packages", () => {
    expect(due).toContain("class_a_session_attendance_evidence");
    expect(due).toContain('["meet_report","staff_code"]');
    expect(due).toContain('enrollment?.status==="attended" && completionEvidenceOk(evidence)');
    expect(due).toContain('after_class_pack_not_ready');
    expect(due).toContain('completion_not_verified');
  });
  it("uses official brand and escapes learner-provided text", () => {
    expect(email).toContain('https://lastbenchbd.com/assets/logo-icon.png');
    expect(email).toContain("Creating a Lasting Benchmark");
    expect(source).toContain("CLASS[Λ]");
    expect(email).toContain('#00C853');
    expect(source).toContain('renderClassAEmail');
    expect(source).toContain('classAStatusCard');
    expect(source).toContain("escapeHtml(name)");
    expect(email).toContain("escapeClassAHtml(value)");
    expect(source).toContain("'\"':\"&quot;\"");
    expect(source).toContain("unsupported_notification_type");
  });
  it("routes only to private owner / private Slack destinations and never an opaque webhook", () => {
    expect(source).toContain('U0BRY5WMLLW');
    expect(source).toContain('function privateSlackReady()');
    expect(source).toContain('/^[UDG][A-Z0-9]+$/');
    expect(source).toContain('private_slack_destination_not_authorized');
    expect(source).not.toContain('C0BRY6AR0DC');
    expect(source).not.toContain('SLACK_WEBHOOK_URL');
  });

  it("does not disclose learner names in public channel notifications", () => {
    expect(signup).not.toContain('${reg.full_name} ·');
    expect(source).not.toContain('sendSlack(`*CLASS[Λ] attendance verified*\\n${reg.full_name}');
    expect(source).toContain('APPLICATION RECEIVED — admission/payment separately verified');
  });
});
