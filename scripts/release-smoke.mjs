#!/usr/bin/env node

/**
 * Last Bench post-deploy smoke check.
 *
 * Usage:
 *   WEB_ORIGIN=https://www.lastbenchbd.com \
 *   API_ORIGIN=https://api.lastbenchbd.com \
 *   node scripts/release-smoke.mjs
 *
 * This intentionally does not claim auth is proven. It verifies the public web/API
 * contract, then prints the human auth/session checks still required.
 */

const webOrigin = process.env.WEB_ORIGIN?.replace(/\/+$/, "");
const apiOrigin = process.env.API_ORIGIN?.replace(/\/+$/, "");

if (!webOrigin || !apiOrigin) {
  console.error("WEB_ORIGIN and API_ORIGIN are required.");
  process.exit(2);
}

for (const [name, value] of [
  ["WEB_ORIGIN", webOrigin],
  ["API_ORIGIN", apiOrigin],
]) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    console.error(`${name} must be a valid absolute URL.`);
    process.exit(2);
  }
  if (parsed.protocol !== "https:") {
    console.error(`${name} must use HTTPS for a production release check.`);
    process.exit(2);
  }
}

const checks = [
  { name: "API health", url: `${apiOrigin}/api/health`, expectJson: true },
  { name: "Landing", url: `${webOrigin}/` },
  { name: "Student app", url: `${webOrigin}/app/` },
  { name: "CLASS masterclass", url: `${webOrigin}/class-a/masterclass.html` },
  { name: "CLASS course", url: `${webOrigin}/class-a/course.html` },
];

let failed = false;

for (const check of checks) {
  try {
    const response = await fetch(check.url, {
      redirect: "follow",
      headers: { "user-agent": "lastbench-release-smoke/1.0" },
    });

    const type = response.headers.get("content-type") ?? "";
    let semanticOk = response.ok;

    if (check.expectJson) {
      semanticOk = semanticOk && type.includes("application/json");
      if (semanticOk) {
        const body = await response.json();
        semanticOk = body?.ok === true;
      }
    }

    if (!semanticOk) {
      failed = true;
      console.error(`FAIL  ${check.name}: ${response.status} ${type || "unknown content-type"}`);
    } else {
      console.log(`PASS  ${check.name}: ${response.status}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL  ${check.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log("\nManual release gates still required:");
console.log("- Fresh-browser OAuth login completes on /app");
console.log("- Returning session survives refresh");
console.log("- Authenticated tRPC request succeeds");
console.log("- Logout causes the next protected request to be rejected");
console.log("- Real Netlify form submissions appear for each active conversion form");
console.log("- Pending database migrations are reconciled and intentionally applied");

process.exitCode = failed ? 1 : 0;
