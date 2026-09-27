#!/usr/bin/env node

/**
 * Last Bench cross-engine boundary regression gate.
 *
 * Prevents a learner/student/public surface from absorbing internal operating
 * context merely because two engines share an underlying capability.
 *
 * Canonical principle:
 *   Reuse capability; do not reuse context blindly.
 */

import fs from "node:fs";

const checks = [
  {
    label: "CLASS learner/public surfaces",
    files: [
      "landing/class-a/index.html",
      "landing/class-a/masterclass.html",
      "landing/class-a/masterclass-cinematic.js",
      "landing/class-a/course.html",
    ],
    forbidden: [
      /ProjectX/i,
      /required deposit/i,
      /Moontakim/i,
      /Website Building 101\s*[—-]\s*No-Tech Guide/i,
      /client[- ]delivery SOP/i,
    ],
  },
];

let failed = false;

for (const check of checks) {
  for (const file of check.files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    for (const pattern of check.forbidden) {
      if (pattern.test(content)) {
        failed = true;
        console.error(`FAIL  ${check.label}: ${file} contains forbidden cross-engine context matching ${pattern}`);
      }
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
  console.log("PASS  cross-engine audience boundary checks");
  console.log("PASS  CLASS registration semantic contract checks");
}

process.exitCode = failed ? 1 : 0;
