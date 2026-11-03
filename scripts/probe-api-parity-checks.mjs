import test from 'node:test';
import assert from 'node:assert/strict';
import { probeApi, validateCandidate } from './probe-api-parity.mjs';

function fake(status, body, cors = true) {
  return new Response(JSON.stringify(body), { status, headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': cors ? 'https://lastbenchbd.com' : '*',
    'access-control-allow-credentials': 'true',
  }});
}
function fetchFixture(overrides = {}) {
  return async (url, options) => {
    assert.equal(options.method, 'GET');
    if (url.endsWith('/api/health')) return overrides.health || fake(200, {ok:true,integrations:{authConfigured:true,storageConfigured:true}});
    if (url.endsWith('/api/auth/me')) return overrides.me || fake(401, {error:'Not authenticated'});
    if (url.endsWith('/api/trpc/admin.automationOverview')) return overrides.admin || fake(403, {error:{data:{code:'FORBIDDEN'}}});
    throw new Error('unexpected url');
  };
}

test('no production/legacy origin or non-HTTPS target accepted', () => {
  for (const bad of [undefined,'http://staging.example.com', 'https://api.lastbenchbd.com', 'https://last-bench-api-v2.onrender.com', 'https://candidate.example.com/a']) {
    assert.throws(() => validateCandidate(bad));
  }
  assert.equal(validateCandidate('https://worker-staging.example.com'), 'https://worker-staging.example.com');
});

test('all read-only access and CORS contracts pass for compliant candidate', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture());
  assert.equal(r.pass,true);
  assert.equal(r.results.length,3);
});

test('rejects a health-only mock missing auth and storage readiness', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({health:fake(200,{ok:true})}));
  assert.equal(r.pass,false);
  assert.equal(r.results[0].pass,false);
});

test('rejects anonymous admin route 404 even if health is green', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({admin:fake(404,{error:'NOT_FOUND'})}));
  assert.equal(r.pass,false);
  assert.equal(r.results[2].pass,false);
});

test('rejects wildcard CORS on authenticated browser API', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({me:fake(401,{error:'Not authenticated'},false)}));
  assert.equal(r.pass,false);
  assert.equal(r.results[1].pass,false);
});
