import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import { createLoginTestServer, validateWebConfig } from '../tools/firebase-migration-login-test.mjs';

const config = { projectId: 'target-project', authDomain: 'target-project.firebaseapp.com', apiKey: 'test-public-api-key-123456789', appId: 'web-app-id' };
test('login test accepts only destination web configuration and excludes unrelated fields', () => {
  assert.deepEqual(validateWebConfig({ ...config, arbitrary: 'excluded' }, 'target-project'), config);
  assert.throws(() => validateWebConfig({ ...config, private_key: 'never-serve' }, 'target-project'), /never a service-account/);
  assert.throws(() => validateWebConfig(config, 'source-project'), /destination/);
});

test('loopback server exposes only public configuration, HTML and origin-bound UID membership', async t => {
  const server = createLoginTestServer(config, new Set(['existing-uid']));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  const root = await fetch(base + '/');
  const html = await root.text();
  assert.equal(root.status, 200); assert.match(html, /Auth.Persistence.NONE/); assert.match(html, /signOut/);
  const inlineScript = html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inlineScript); new vm.Script(inlineScript);
  assert.match(root.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.ok(!html.includes('existing-uid'));
  const publicConfig = await fetch(base + '/config.json');
  assert.deepEqual(await publicConfig.json(), config); assert.equal(publicConfig.headers.get('cache-control'), 'no-store');
  for (const path of ['/auth-backup.json', '/firebase-new-key.json', '/firestore-backup.json', '/firebase-hash-config.txt', '/%2e%2e/firebase-old-key.json']) assert.equal((await fetch(base + path)).status, 404);
  const request = (body, origin = base) => fetch(base + '/check-uid', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.deepEqual(await (await request({ uid: 'existing-uid' })).json(), { known: true });
  assert.deepEqual(await (await request({ uid: 'unknown-uid' })).json(), { known: false });
  assert.equal((await request({ uid: 'existing-uid' }, 'https://foreign.example')).status, 403);
  assert.equal((await request({ uid: 'existing-uid', password: 'never-accept' })).status, 400);
  const foreignHostStatus = await new Promise((resolve, reject) => {
    const req = http.get(base + '/config.json', { headers: { Host: 'foreign.example' } }, response => { response.resume(); response.on('end', () => resolve(response.statusCode)); });
    req.on('error', reject);
  });
  assert.equal(foreignHostStatus, 403);
});
