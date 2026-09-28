import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// A local configuration gate, not a substitute for device or store verification.
const failures = [];
const eas = JSON.parse(readFileSync('eas.json', 'utf8'));
const webWorkflow = readFileSync('.github/workflows/deploy-github-pages.yml', 'utf8');
const production = eas.build.production;
for (const key of ['EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY']) {
  const webValue = webWorkflow.match(new RegExp(`^      ${key}: (.+)$`, 'm'))?.[1]?.trim();
  if (!webValue || production.env[key] !== webValue) failures.push(`${key}: mobile configuration differs from the canonical web deployment`);
}
if (production.android?.buildType !== 'app-bundle') failures.push('Android store builds must use an app bundle');
if (production.ios?.simulator !== false) failures.push('iOS store builds must target physical devices');

const configResult = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'config', '--type', 'public', '--json'], {
  encoding: 'utf8', env: { ...process.env, ...production.env },
});
let config;
if (configResult.status !== 0) {
  failures.push('Expo configuration could not be resolved; run pnpm exec expo config --type public');
} else {
  try { config = JSON.parse(configResult.stdout); }
  catch { failures.push('Expo did not return valid configuration JSON'); }
}
if (config) {
  if (config.name !== 'Last Bench') failures.push('Display name must be Last Bench');
  for (const value of [config.ios?.bundleIdentifier, config.android?.package]) {
    if (value !== 'com.app.lastbenchmobile') failures.push('Existing application identity changed; verify store ownership before changing identifiers');
  }
  if (!config.scheme?.includes('lastbench')) failures.push('Last Bench deep-link scheme is missing');
  if (!config.owner) failures.push('EXPO_ACCOUNT_OWNER is not bound to a verified Expo account');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.extra?.eas?.projectId ?? '')) {
    failures.push('EAS_PROJECT_ID is not bound to a verified Expo project');
  }
  for (const [label, path] of [['App icon', config.icon], ['Android foreground', config.android?.adaptiveIcon?.foregroundImage]]) {
    if (!path || !existsSync(path)) { failures.push(`${label} is missing`); continue; }
    const bytes = readFileSync(path);
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') { failures.push(`${label} must be a reviewed PNG`); continue; }
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width !== height || width < 1024) failures.push(`${label} is ${width} × ${height}; prepare a square 1024px-or-larger export from the exact approved artwork`);
  }
}
if (failures.length) {
  console.error('[mobile-preflight] BLOCKED');
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log('[mobile-preflight] Local configuration checks passed. Device journeys, approved assets, privacy/deletion flows, store signing, submission and review remain separate gates.');
}
