#!/usr/bin/env node
/**
 * Read-only, pre-cutover LastBenchBd API contract probe.
 * Explicit staging target only; no production mutations, credentials, or writes.
 * PASS is a necessary preflight, never production cutover approval.
 */
import { pathToFileURL } from 'node:url';

const WEB_ORIGIN = 'https://lastbenchbd.com';
const BLOCKED_CANDIDATES = new Set([
  'https://api.lastbenchbd.com',
  'https://last-bench-api-v2.onrender.com',
]);

export function validateCandidate(input) {
  if (!input) throw new Error('CANDIDATE_API_ORIGIN is required; use a staging endpoint, not production.');
  let url;
  try { url = new URL(input); } catch { throw new Error('Candidate must be an absolute HTTPS URL.'); }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('Candidate must be an HTTPS origin with no path, query, fragment or embedded credentials.');
  }
  const origin = url.origin;
  if (BLOCKED_CANDIDATES.has(origin)) throw new Error('Refusing legacy or production API as the replacement candidate.');
  return origin;
}

const codeOf = body => body?.error?.data?.code ?? body?.error?.json?.data?.code;
const checks = [
  {
    name: 'semantic-health', path: '/api/health', expectedStatus: 200,
    validate: j => j?.ok === true && j?.integrations?.authConfigured === true && j?.integrations?.storageConfigured === true,
  },
  { name: 'anonymous-session-denied', path: '/api/auth/me', expectedStatus: 401, validate: () => true },
  { name: 'anonymous-admin-denied', path: '/api/trpc/admin.automationOverview', expectedStatus: 403, validate: j => codeOf(j) === 'FORBIDDEN' },
  {
    name: 'public-trpc-read', path: '/api/trpc/system.health', expectedStatus: 200,
    query: () => \`?input=\${encodeURIComponent(JSON.stringify({json:{timestamp:Date.now()}}))}\`,
    validate: j => j?.result?.data?.json?.ok === true,
  },
  { name: 'anonymous-student-denied', path: '/api/trpc/student.getProfile', expectedStatus: 401, validate: j => codeOf(j) === 'UNAUTHORIZED' },
  {
    name: 'foreign-origin-denied', path: '/api/health', origin: 'https://evil.example.invalid', expectedStatus: 403,
    corsMode: 'blocked', validate: j => j?.error === 'Origin is not allowed',
  },
  {
    name: 'credentialed-preflight', path: '/api/trpc/system.health', method: 'OPTIONS', expectedStatus: 204,
    corsMode: 'preflight', validate: () => true,
  },
];

export async function probeApi(origin, fetcher = fetch) {
  const results = [];
  for (const check of checks) {
    try {
      const response = await fetcher(origin + check.path + (check.query?.() || ''), {
        method: check.method ?? 'GET',
        headers: {
          Origin: check.origin ?? WEB_ORIGIN,
          'Cache-Control': 'no-cache',
          ...(check.method === 'OPTIONS' ? {'Access-Control-Request-Method': 'GET'} : {}),
        },
        signal: AbortSignal.timeout(12000),
      });
      const contentType = response.headers.get('content-type') || '';
      const allowOrigin = response.headers.get('access-control-allow-origin');
      const credentials = response.headers.get('access-control-allow-credentials');
      const allowedMethods = response.headers.get('access-control-allow-methods') || '';
      const json = contentType.includes('application/json');
      const body = json ? await response.json().catch(() => null) : null;
      const semanticsOk = check.validate(body);
      let corsOk;
      if (check.corsMode === 'blocked') {
        corsOk = !allowOrigin && !credentials && json;
      } else if (check.corsMode === 'preflight') {
        corsOk = allowOrigin === WEB_ORIGIN && credentials === 'true'
          && allowedMethods.split(',').some(x => x.trim() === 'GET');
      } else {
        corsOk = json && allowOrigin === WEB_ORIGIN && credentials === 'true';
      }
      const pass = response.status === check.expectedStatus && corsOk && semanticsOk;
      results.push({ name: check.name, status: response.status, pass,
        reason: pass ? null : 'status, JSON semantics, CORS or access-control mismatch' });
    } catch (error) {
      results.push({ name: check.name, pass: false,
        reason: error instanceof Error ? error.name : 'request failure' });
    }
  }
  return { results, pass: results.every(x => x.pass) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const candidate = validateCandidate(process.env.CANDIDATE_API_ORIGIN);
    const result = await probeApi(candidate);
    console.log(JSON.stringify({ target: candidate, ...result, verdict: result.pass ? 'STAGING_PREFLIGHT_PASS_NOT_RELEASE' : 'BLOCKED' }, null, 2));
    if (!result.pass) process.exitCode = 1;
  } catch (error) {
    console.error(JSON.stringify({ verdict: 'BLOCKED', reason: error instanceof Error ? error.message : String(error) }));
    process.exitCode = 2;
  }
}
