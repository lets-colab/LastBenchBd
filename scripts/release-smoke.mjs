#!/usr/bin/env node

/**
 * Last Bench post-deploy smoke check.
 *
 * Defaults to the verified production topology:
 *   WEB_ORIGIN=https://lastbenchbd.com
 *   API_ORIGIN=https://api.lastbenchbd.com
 *
 * RENDER_ORIGIN is optional and is used as a diagnostic control-plane check.
 * When present, both the custom API domain and Render origin must be healthy.
 * This verifies the public web/API contract. Auth/session and real form receipt
 * remain separate release gates because they require stateful flows.
 */

import dns from "node:dns/promises";

const webOrigin = (process.env.WEB_ORIGIN ?? "https://lastbenchbd.com").replace(/\/+$/, "");
const apiOrigin = (process.env.API_ORIGIN ?? "https://api.lastbenchbd.com").replace(/\/+$/, "");
const renderOrigin = (process.env.RENDER_ORIGIN ?? "").replace(/\/+$/, "");
const attempts = Math.max(1, Number.parseInt(process.env.SMOKE_ATTEMPTS ?? "3", 10) || 3);
const retryDelayMs = Math.max(0, Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS ?? "5000", 10) || 5000);

const origins = [["WEB_ORIGIN", webOrigin],["API_ORIGIN", apiOrigin]];
if (renderOrigin) origins.push(["RENDER_ORIGIN", renderOrigin]);
for (const [name, value] of origins) {
  let parsed;
  try { parsed = new URL(value); } catch { console.error(`${name} must be a valid absolute URL.`); process.exit(2); }
  if (parsed.protocol !== "https:") { console.error(`${name} must use HTTPS for a production release check.`); process.exit(2); }
}

const checks = [
  { name: "API custom-domain health", url: `${apiOrigin}/api/health`, expectJson: true, dnsOnFailure: true },
  ...(renderOrigin ? [{ name: "API Render-origin health", url: `${renderOrigin}/api/health`, expectJson: true }] : []),
  {
    name: "Corporate landing",
    url: `${webOrigin}/`,
    expectHtml: true,
    expectIncludes: [
      "<title>Last Bench — Build People. Build Business. Learn Faster.</title>",
      "CLASS[Λ] builds builders",
      "LAST BENCH",
      "EDUCATION & MOBILITY",
      "CLASS[Λ]",
      "co.lab",
      "Community connects everything.",
      "claude-design-support.js",
      "bench-ai.js",
    ],
  },
  {
    name: "Runtime blueprint alignment",
    url: `${webOrigin}/lastbench-blueprint.js`,
    expectIncludes: [
      "Opportunity Accelerator",
      "Education & Mobility",
      "CLASS[Λ]",
      "co.lab",
      "Business Lab",
      "educationMobilityService:'Malaysia'",
      "lb-malaysia-service",
    ],
  },
  { name: "Student app", url: `${webOrigin}/app/`, expectHtml: true },
  { name: "CLASS signup hub", url: `${webOrigin}/class-a/`, expectHtml: true },
  {
    name: "CLASS masterclass",
    url: `${webOrigin}/class-a/masterclass.html`,
    expectHtml: true,
    expectIncludes: [
      "masterclass-entry.mp4",
      "data-intro-end-card",
      "class=\"intro-number\"",
      "<h1><span>TURN AI INTO</span>",
      "hero-system-stack",
      "transform-rig",
      "ACCEPT INVITATION",
      "TURN AI INTO",
      "YOUR TEAM.",
      "Research · Build · Create · Sell · Operate",
      "data-public-session-chip",
      "data-public-session-meta",
      "GOOGLE MEET · FREE REGISTRATION",
      "FOLLOW &lt;CLASS[Λ]&gt; | LEARN AI ON WHATSAPP",
      "FOLLOW CHANNEL →",
      "I'VE FOLLOWED — UNLOCK MY PASS",
    ],
  },
  {
    name: "CLASS personal masterclass pass",
    url: `${webOrigin}/class-a/pass.html`,
    expectHtml: true,
    expectIncludes: [
      "YOUR",
      "MASTERCLASS PASS.",
      "LIVE ATTENDANCE PROOF",
      "pass.js",
    ],
  },
  {
    name: "CLASS instructor live control",
    url: `${webOrigin}/class-a/live-control.html`,
    expectHtml: true,
    expectIncludes: [
      "DR.X LIVE · INSTRUCTOR CONTROL",
      "ISSUE LIVE",
      "ATTENDANCE CODE.",
      "live-control.js",
    ],
  },
  {
    name: "CLASS attendance check-in",
    url: `${webOrigin}/class-a/checkin.html`,
    expectHtml: true,
    expectIncludes: [
      "CLASS[Λ] staff check-in · Class 0",
      "REDEEM ATTENDANCE.",
      "MARK ATTENDED →",
      "checkin.js",
      "last-bench-bench.png",
    ],
  },
  { name: "CLASS course", url: `${webOrigin}/class-a/course.html`, expectHtml: true },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function resolveAndReport(label, host, resolver) {
  try { const records = await resolver.call(dns, host); console.error(`      ${label}: ${records.length ? records.join(", ") : "none"}`); }
  catch (error) { const code = error && typeof error === "object" && "code" in error ? error.code : "lookup-failed"; console.error(`      ${label}: ${code}`); }
}
async function reportDns(url) {
  const host = new URL(url).hostname;
  const labels = host.split(".").filter(Boolean);
  const zone = labels.length >= 2 ? labels.slice(-2).join(".") : host;
  console.error(`DNS   ${host}:`);
  await resolveAndReport("CNAME", host, dns.resolveCname);
  await resolveAndReport("A", host, dns.resolve4);
  await resolveAndReport("AAAA", host, dns.resolve6);
  if (zone !== host) { console.error(`DNS   authoritative zone ${zone}:`); await resolveAndReport("NS", zone, dns.resolveNs); }
}
async function verify(check) {
  const response = await fetch(check.url, { redirect: "follow", headers: { "user-agent": "lastbench-release-smoke/3.5", "cache-control": "no-cache" } });
  const type = response.headers.get("content-type") ?? "";
  let semanticOk = response.ok;
  if (check.expectJson) {
    semanticOk = semanticOk && type.includes("application/json");
    if (semanticOk) { const body = await response.json(); semanticOk = body?.ok === true; }
  } else {
    if (check.expectHtml) semanticOk = semanticOk && type.includes("text/html");
    if (semanticOk && check.expectIncludes?.length) {
      const bodyText = await response.text();
      semanticOk = check.expectIncludes.every((needle) => bodyText.includes(needle));
      if (!semanticOk) throw new Error("stale or unexpected content; missing release fingerprint");
    }
  }
  if (!semanticOk) throw new Error(`${response.status} ${type || "unknown content-type"}`);
  return response.status;
}

let failed = false;
for (const check of checks) {
  let passed = false; let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { const status = await verify(check); console.log(`PASS  ${check.name}: ${status}${attempt > 1 ? ` (attempt ${attempt})` : ""}`); passed = true; break; }
    catch (error) { lastError = error; if (attempt < attempts) { console.warn(`RETRY ${check.name}: attempt ${attempt}/${attempts} failed`); await sleep(retryDelayMs); } }
  }
  if (!passed) { failed = true; console.error(`FAIL  ${check.name}: ${lastError instanceof Error ? lastError.message : String(lastError)}`); if (check.dnsOnFailure) await reportDns(check.url); }
}

console.log("\nStateful release gates:");
console.log("- Supabase Auth production URL and publishable key are present in the production web build");
console.log("- Fresh-browser account creation/sign-in completes on /app/auth");
console.log("- Returning Supabase session survives refresh");
console.log("- Authenticated tRPC request succeeds");
console.log("- Logout causes the next protected request to be rejected");
console.log("- Real homepage and CLASS[Λ] submissions appear in their intended Supabase tables");
console.log("- Online CLASS[Λ] registration creates a session enrollment without rewriting historical attendance");
console.log("- Personal pass opens from its private code and join-click remains a signal, not attendance");
console.log("- Live attendance becomes verified only after personal-pass + active BUILD-code evidence");
console.log("- Supabase migration ledger remains reconciled with drizzle/MIGRATION_STATUS.md");
console.log("- Homepage business logic matches the current Opportunity Accelerator blueprint and keeps Malaysia scoped to Education & Mobility");

process.exitCode = failed ? 1 : 0;
