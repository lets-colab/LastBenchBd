import { createHash } from "crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
}

function full(relativePath) {
  return path.join(root, relativePath);
}

function readText(relativePath) {
  const target = full(relativePath);
  if (!existsSync(target)) {
    fail("Missing required file: " + relativePath);
    return "";
  }
  return readFileSync(target, "utf8");
}

function readBytes(relativePath) {
  const target = full(relativePath);
  if (!existsSync(target)) {
    fail("Missing required file: " + relativePath);
    return null;
  }
  return readFileSync(target);
}

function gitBlobSha(buffer) {
  if (!buffer) return null;
  const header = Buffer.from("blob " + buffer.length + "\0", "utf8");
  return createHash("sha1").update(header).update(buffer).digest("hex");
}

function assertGitBlobSha(relativePath, expectedSha, label = relativePath) {
  const bytes = readBytes(relativePath);
  if (!bytes) return;
  const actual = gitBlobSha(bytes);
  if (actual !== expectedSha) {
    fail(
      label +
        " fingerprint mismatch: expected Git blob " +
        expectedSha +
        ", got " +
        actual +
        ". Do not replace or regenerate locked brand assets without an explicit approved identity change.",
    );
  }
}

function walk(relativeRoot) {
  const start = full(relativeRoot);
  if (!existsSync(start)) return [];

  const found = [];
  const stack = [start];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current);
    for (const entry of entries) {
      const absolute = path.join(current, entry);
      const stat = statSync(absolute);
      if (stat.isDirectory()) {
        stack.push(absolute);
      } else {
        found.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
    }
  }

  return found;
}

function isTextSource(relativePath) {
  return /\.(?:html?|css|js|mjs|cjs|ts|tsx|jsx|json|md|txt)$/i.test(relativePath);
}

function normalizeHumanText(source) {
  return source
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function containsNormalizedPhrase(source, phrase) {
  return normalizeHumanText(source).includes(normalizeHumanText(phrase));
}

let lock;
try {
  lock = JSON.parse(readText("design-system/brand-lock.json"));
} catch (error) {
  fail("design-system/brand-lock.json is invalid JSON: " + error.message);
  lock = {};
}

if (lock?.brand !== "Last Bench") {
  fail('design-system/brand-lock.json brand must be exactly "Last Bench"');
}

const policy = lock?.policy ?? {};
for (const [key, expected] of Object.entries({
  imageModelMayRenderLogo: false,
  imageModelMayRecreateWordmark: false,
  imageModelMayRecreateIcon: false,
  vectorizationFromRasterAllowed: false,
  recolorLockedLogoAllowed: false,
  postGenerationCompositingRequired: true,
  savedArtifactReviewRequired: true,
  unknownBrandFactsMayBeInvented: false,
})) {
  if (policy[key] !== expected) {
    fail("brand-lock policy." + key + " must be " + expected);
  }
}

const canonical = lock?.canonicalAssets ?? {};
for (const [name, asset] of Object.entries(canonical)) {
  if (!asset?.path || !asset?.gitBlobSha) {
    fail("canonicalAssets." + name + " must define path and gitBlobSha");
    continue;
  }
  assertGitBlobSha(asset.path, asset.gitBlobSha, "canonicalAssets." + name);
}

for (const duplicate of lock?.approvedDuplicates ?? []) {
  const source = canonical?.[duplicate?.source];
  if (!source) {
    fail(
      "Approved duplicate " +
        (duplicate?.path ?? "(missing path)") +
        " references unknown source " +
        duplicate?.source,
    );
    continue;
  }
  assertGitBlobSha(
    duplicate.path,
    source.gitBlobSha,
    "approved duplicate " + duplicate.path + " -> " + duplicate.source,
  );
}

const deprecated = new Set(lock?.deprecatedAssets ?? []);
if (!deprecated.has("design-system/logo.svg")) {
  fail("design-system/logo.svg must remain explicitly deprecated in brand-lock.json");
}

let tokens = {};
try {
  tokens = JSON.parse(readText("design-system/tokens.json"));
} catch (error) {
  fail("design-system/tokens.json is invalid JSON: " + error.message);
}

if (tokens?.governance?.productionLogo !== canonical?.productionLogo?.path) {
  fail("tokens.governance.productionLogo must match brand-lock canonical productionLogo path");
}
if (tokens?.governance?.productionIcon !== canonical?.productionIcon?.path) {
  fail("tokens.governance.productionIcon must match brand-lock canonical productionIcon path");
}
if (tokens?.governance?.logoMaster !== canonical?.masterReference?.path) {
  fail("tokens.governance.logoMaster must match brand-lock canonical masterReference path");
}

const lockedIdentity = lock?.lockedIdentity ?? {};
if (tokens?.brand?.name !== lockedIdentity?.name) {
  fail("tokens.brand.name drifted from brand-lock lockedIdentity.name");
}
if (tokens?.brand?.tagline !== lockedIdentity?.tagline) {
  fail("tokens.brand.tagline drifted from brand-lock lockedIdentity.tagline");
}

for (const [name, expected] of Object.entries(lockedIdentity?.colors ?? {})) {
  if (tokens?.color?.[name]?.value !== expected) {
    fail(
      "Locked color " +
        name +
        " drifted: expected " +
        expected +
        ", got " +
        tokens?.color?.[name]?.value,
    );
  }
}

if (tokens?.typography?.display?.family !== lockedIdentity?.typography?.display) {
  fail("Display typography drifted from brand-lock");
}
if (tokens?.typography?.body?.family !== lockedIdentity?.typography?.body) {
  fail("Body typography drifted from brand-lock");
}

const skillPaths = [
  "skills/last-bench-brand-source-lock/SKILL.md",
  ".claude/skills/last-bench-brand-source-lock/SKILL.md",
  ".agents/skills/last-bench-brand-source-lock/SKILL.md",
];

const skillBodies = skillPaths.map((relativePath) => readText(relativePath));
if (skillBodies.some((body) => !body.includes("Mandatory Two-Stage Visual Workflow"))) {
  fail("Every Last Bench brand-lock skill copy must contain the mandatory two-stage visual workflow");
}
if (new Set(skillBodies).size !== 1) {
  fail("Last Bench brand-lock skill copies have drifted; canonical, Claude, and agent copies must be byte-identical");
}

const allowedLandingLogoFiles = new Set(lock?.allowedLogoFilesInLandingAssets ?? []);
for (const relativePath of walk("landing/assets")) {
  if (/logo/i.test(path.basename(relativePath)) && !allowedLandingLogoFiles.has(relativePath)) {
    fail(
      "Unapproved logo-like file found in landing/assets: " +
        relativePath +
        ". Add only after explicit brand approval and update brand-lock.json in the same reviewed change.",
    );
  }
}

const productionRoots = lock?.productionScanRoots ?? [];
const forbiddenPhrases = lock?.forbiddenProductionPhrases ?? [];

for (const productionRoot of productionRoots) {
  for (const relativePath of walk(productionRoot)) {
    if (!isTextSource(relativePath)) continue;

    const source = readText(relativePath);

    for (const deprecatedAsset of deprecated) {
      if (source.includes(deprecatedAsset)) {
        fail(relativePath + " references deprecated brand asset " + deprecatedAsset);
      }
    }

    for (const phrase of forbiddenPhrases) {
      if (containsNormalizedPhrase(source, phrase)) {
        fail(
          relativePath +
            " contains prohibited unapproved campaign phrase: " +
            JSON.stringify(phrase),
        );
      }
    }

    const svgBlocks = source.match(/<svg\b[\s\S]*?<\/svg>/gi) ?? [];
    for (const svg of svgBlocks) {
      if (
        /last\s*bench|creating\s+a\s+lasting\s+benchmark|bench[\s\S]{0,500}arrow/i.test(
          svg,
        )
      ) {
        fail(
          relativePath +
            " appears to contain an inline SVG recreation of the Last Bench identity. Use the canonical locked asset instead.",
        );
      }
    }
  }
}

const homepage = readText("landing/index.html");
if (!homepage.includes("assets/logo-full.png")) {
  fail("landing/index.html must reference the canonical production full logo asset");
}
if (!homepage.includes("assets/logo-icon.png")) {
  fail("landing/index.html must reference the canonical production icon asset");
}

const brandSkill = skillBodies[0] ?? "";
for (const requiredRule of [
  "Never ask an image model to draw",
  "The compositor, not the image generator, owns brand placement.",
  "Inspect the actual saved/exported artifact",
]) {
  if (!brandSkill.includes(requiredRule)) {
    fail("Brand source lock skill is missing required rule: " + requiredRule);
  }
}

if (errors.length > 0) {
  console.error("[brand-lock] Last Bench identity gate failed:");
  for (const error of errors) console.error("  - " + error);
  process.exit(1);
}

console.log("[brand-lock] canonical Last Bench identity checks passed");
