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
    const path = new URL(url).pathname;
    const origin = options.headers.Origin;
    if (options.method === 'OPTIONS' && path === '/api/trpc/system.health') {
      assert.equal(origin, 'https://lastbenchbd.com');
      return overrides.preflight || new Response(null, {status:204,headers:{
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
      }});
    }
    assert.equal(options.method, 'GET');
    if (path === '/api/health' && origin !== 'https://lastbenchbd.com') {
      return overrides.foreign || new Response(JSON.stringify({error:'Origin is not allowed'}), {status:403,headers:{'content-type':'application/json'}});
    }
    if (path === '/api/health') return overrides.health || fake(200, {ok:true,integrations:{authConfigured:true,storageConfigured:true}});
    if (path === '/api/auth/me') return overrides.me || fake(401, {error:'Not authenticated'});
    if (path === '/api/trpc/admin.automationOverview') return overrides.admin || fake(403, {error:{data:{code:'FORBIDDEN'}}});
    if (path === '/api/trpc/student.getProfile') return overrides.student || fake(401,{error:{data:{code:'UNAUTHORIZED'}}});
    if (path === '/api/trpc/system.health') {
      const input = JSON.parse(new URL(url).searchParams.get('input') || 'null');
      assert.equal(typeof input?.json?.timestamp, 'number');
      return overrides.system || fake(200,{result:{data:{json:{ok:true}}}});
    }
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
  assert.equal(r.results.length,7);
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


test('rejects a staging tRPC public route that silently returns not found', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({system:fake(404,{error:'NOT_FOUND'})}));
  assert.equal(r.pass,false);
  assert.equal(r.results.find(x=>x.name==='public-trpc-read')?.pass,false);
});

test('rejects a staging Worker that allows anonymous student profile reads', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({student:fake(200,{result:{data:{json:{id:1}}}})}));
  assert.equal(r.pass,false);
  assert.equal(r.results.find(x=>x.name==='anonymous-student-denied')?.pass,false);
});

test('rejects a staging Worker that reflects arbitrary unapproved origins', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({foreign:fake(403,{error:'blocked'},false)}));
  assert.equal(r.pass,false);
  assert.equal(r.results.find(x=>x.name==='foreign-origin-denied')?.pass,false);
});

test('rejects a Worker that does not implement credentialed browser preflight', async () => {
  const r=await probeApi('https://candidate.example.com',fetchFixture({preflight:new Response(null,{status:404})}));
  assert.equal(r.pass,false);
  assert.equal(r.results.find(x=>x.name==='credentialed-preflight')?.pass,false);
});
