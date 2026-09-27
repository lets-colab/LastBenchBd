#!/usr/bin/env node

/**
 * Last Bench cross-engine boundary regression gate.
 *
 * Prevents learner-facing CLASS[Λ] surfaces from absorbing internal operating
 * context merely because two engines share an underlying capability.
 *
 * Canonical principle:
 *   Reuse capability; do not reuse context blindly.
 */

import fs from "node:fs";
import path from "node:path";

const learnerRoot = "landing/class-a";
const textExtensions = new Set([".html", ".js", ".mjs", ".md", ".json", ".css", ".txt"]);

function collectTextFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectTextFiles(full));
      continue;
    }
    if (textExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

const learnerFiles = collectTextFiles(learnerRoot);

const forbidden = [
  { label: "ProjectX operating identity", pattern: /\bProjectX\b/i },
  { label: "Moontakim internal ownership", pattern: /\bMoontakim\b/i },
  { label: "ProjectX operator guide", pattern: /Website Building 101\s*[—-]\s*No-Tech Guide/i },
  { label: "internal client-delivery SOP", pattern: /client[- ]delivery\s+SOP/i },
  {
    label: "client deposit operating rule",
    pattern: /(?:\bclient\b[\s\S]{0,100}\bdeposit\b|\bdeposit\b[\s\S]{0,100}\bclient\b)/i,
  },
];

let failed = false;

if (!learnerFiles.length) {
  failed = true;
  console.error(`FAIL  no textual CLASS learner/runtime files discovered under ${learnerRoot}`);
}

for (const file of learnerFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      failed = true;
      console.error(
        `FAIL  CLASS learner boundary: ${file} contains ${rule.label} matching ${rule.pattern}`
      );
    }
  }
}

const semanticsFiles = [
  "landing/class-a/README.md",
  "drizzle/MIGRATION_STATUS.md",
];

for (const file of semanticsFiles) {
  if (!fs.existsSync(file)) {
    failed = true;
    console.error(`FAIL  required semantics source missing: ${file}`);
  }
}

if (fs.existsSync("landing/class-a/README.md")) {
  const readme = fs.readFileSync("landing/class-a/README.md", "utf8");
  const required = [
    "record_kind='genuine'",
    "CRM person identity is deduplicated by normalized email",
  ];
  for (const needle of required) {
    if (!readme.includes(needle)) {
      failed = true;
      console.error(`FAIL  CLASS semantic contract missing: ${needle}`);
    }
  }
}

if (!failed) {
  console.log(`PASS  scanned ${learnerFiles.length} CLASS learner/runtime text files`);
  console.log("PASS  cross-engine audience boundary checks");
  console.log("PASS  CLASS registration semantic contract checks");
}

process.exitCode = failed ? 1 : 0;
