import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function read(relativePath) {
  const full = path.join(root, relativePath);
  if (!existsSync(full)) {
    fail(`Missing required file: ${relativePath}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(value, label) {
  if (value !== true) fail(`${label}: expected true`);
}

let tokens;
try {
  tokens = JSON.parse(read("design-system/tokens.json"));
} catch (error) {
  fail(`design-system/tokens.json is not valid JSON: ${error.message}`);
  tokens = {};
}

assertEqual(tokens?.governance?.category, "Opportunity Accelerator", "governance.category");
assertEqual(
  tokens?.governance?.brandPromise,
  "From where you are. To what you can build.",
  "governance.brandPromise",
);
assertEqual(tokens?.governance?.visualLaw, "Dark for emotion. White for trust. Green for progress.", "governance.visualLaw");

const lockedColors = {
  brandGreen: "#00C853",
  brandGreenBright: "#00E676",
  charcoal: "#111111",
  warmWhite: "#FAFAF8",
  sageGreen: "#E6F2E9",
  gray: "#6B6F76",
};
for (const [name, expected] of Object.entries(lockedColors)) {
  assertEqual(tokens?.color?.[name]?.value, expected, `color.${name}.value`);
}

if ((tokens?.interaction?.minimumTargetPx ?? 0) < 44) {
  fail("interaction.minimumTargetPx must be at least 44");
}
if ((tokens?.interaction?.preferredTargetPx ?? 0) < (tokens?.interaction?.minimumTargetPx ?? 44)) {
  fail("interaction.preferredTargetPx must be >= interaction.minimumTargetPx");
}
assertTrue(tokens?.interaction?.focusVisibleRequired, "interaction.focusVisibleRequired");
assertTrue(tokens?.motion?.reducedMotionRequired, "motion.reducedMotionRequired");
assertTrue(tokens?.accessibility?.reducedMotionRequired, "accessibility.reducedMotionRequired");
assertEqual(tokens?.accessibility?.wcagFloor, "AA", "accessibility.wcagFloor");
assertTrue(tokens?.accessibility?.keyboardOperableWeb, "accessibility.keyboardOperableWeb");

assertTrue(tokens?.namespaces?.lastBench?.inheritsParentTokens, "namespaces.lastBench.inheritsParentTokens");
assertEqual(tokens?.namespaces?.classLambda?.inheritsParentTokens, false, "namespaces.classLambda.inheritsParentTokens");
assertEqual(tokens?.namespaces?.coLab?.inheritsParentTokens, false, "namespaces.coLab.inheritsParentTokens");

const canonicalAssets = [
  tokens?.governance?.logoMaster,
  tokens?.governance?.productionLogo,
  tokens?.governance?.productionIcon,
].filter(Boolean);
for (const asset of canonicalAssets) {
  if (!existsSync(path.join(root, asset))) fail(`Canonical locked asset does not exist: ${asset}`);
}
if (!(tokens?.governance?.deprecatedAssets ?? []).includes("design-system/logo.svg")) {
  fail("design-system/logo.svg must remain explicitly deprecated");
}

const theme = read("theme.config.js");
if (!theme.includes('require("./design-system/tokens.json")')) {
  fail("theme.config.js must derive semantic colors from design-system/tokens.json");
}

const productionFiles = [
  "landing/index.html",
  "landing/bench-ai.js",
  "landing/lastbench-blueprint.js",
];
for (const relativePath of productionFiles) {
  const source = read(relativePath);
  if (source.includes("design-system/logo.svg")) {
    fail(`${relativePath} must not use the legacy design-system/logo.svg recreation`);
  }
}

const pagesWorkflow = read(".github/workflows/deploy-github-pages.yml");
for (const requiredPath of [
  '"design-system/**"',
  '"components/**"',
  '"hooks/**"',
  '"lib/**"',
  '"theme.config.js"',
  '"scripts/validate-design-system.mjs"',
]) {
  if (!pagesWorkflow.includes(requiredPath)) {
    fail(`GitHub Pages workflow is missing production trigger path ${requiredPath}`);
  }
}
if (!pagesWorkflow.includes("pnpm design:check")) {
  fail("GitHub Pages workflow must run pnpm design:check before deployment");
}

const designQa = read(".github/workflows/impeccable-design-qa.yml");
if (!designQa.includes("pull_request:")) {
  fail("Impeccable design QA must run on pull requests");
}
if (!designQa.includes('"design-system/**"')) {
  fail('Impeccable design QA must watch "design-system/**"');
}

const handoff = read("CLAUDE_DESIGN_PHONE_HANDOFF.md");
if (!handoff.includes("legacy digital recreation") || !handoff.includes("must not be used as a brand master")) {
  fail("Claude Design handoff must explicitly deprecate design-system/logo.svg");
}

if (errors.length > 0) {
  console.error("[design-system] canonical checks failed:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("[design-system] canonical design system checks passed");
