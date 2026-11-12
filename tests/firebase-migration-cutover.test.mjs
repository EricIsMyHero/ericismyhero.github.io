import test from 'node:test';
import assert from 'node:assert/strict';
import { planDelta, confirmPause, sourceRules, writeDelta } from '../tools/firebase-migration-cutover.mjs';
const user = { localId: 'uid', email: 'test@example.invalid', passwordHash: 'YWJj', lastLoginAt: '100' };
const doc = (n, extra = {}) => ({ path: 'users/uid', fields: { n: { integerValue: String(n) } }, ...extra });
const base = { users: [user], documents: [doc(1)] };
const latest = { target: 'target-project', hashConfig: {}, users: [{ ...user, lastLoginAt: '200' }], documents: [doc(2), { path: 'events/new', fields: {} }] };
test('catch-up plans additions/updates and preserves a newer tested-account login timestamp', () => {
  const delta = planDelta(base, latest, { users: [{ ...user, lastLoginAt: '300' }], documents: [doc(1, { updateTime: 'v1' })] });
  assert.equal(delta.creates, 1); assert.equal(delta.updates, 1); assert.equal(delta.users[0].lastLoginAt, '300');
  assert.equal(delta.documents[0].updateTime, 'v1');
});
test('removals and independently modified destination data stop before any writes', () => {
  assert.throws(() => planDelta(base, { ...latest, documents: [] }, { users: [user], documents: [] }), /removals/);
  assert.throws(() => planDelta(base, latest, { users: [user], documents: [doc(99, { updateTime: 'v2' })] }), /conflict/);
  assert.throws(() => planDelta(base, latest, { users: [{ ...user, email: 'changed@example.invalid' }], documents: [doc(1, { updateTime: 'v1' })] }), /account conflict/);
});
test('catch-up commits use creation/version preconditions and skip documents already applied on retry', async () => {
  const delta = planDelta(base, latest, { users: [user], documents: [doc(1, { updateTime: 'v1' })] }), writes = [];
  await writeDelta(latest, delta, async (url, init) => {
    const body = JSON.parse(init.body);
    if (url.includes('accounts:batchCreate')) { assert.equal(body.allowOverwrite, true); return {}; }
    writes.push(...body.writes); return {};
  });
  assert.deepEqual(writes.map(w => w.currentDocument), [{ updateTime: 'v1' }, { exists: false }]);
  assert.equal(planDelta(base, latest, { users: latest.users, documents: latest.documents }).documents.length, 0);
});
test('source pause requires matching deny rules, source backend maintenance and blocked Auth client key', async () => {
  const rules = 'rules_version="2"; deny-all-test', config = { projectId: 'source-project', apiKey: 'public-test-key' };
  const fetcher = async url => url.includes('firebase-config') ? { ok: true, json: async () => ({ maintenance: true, projectId: 'source-project', deployment: 'deployment-1' }) } : { status: 403, json: async () => ({ error: { details: [{ reason: 'API_KEY_HTTP_REFERRER_BLOCKED' }] } }) };
  assert.equal(await confirmPause('source-project', config, rules, rules, fetcher), 'deployment-1');
  await assert.rejects(confirmPause('source-project', config, 'different rules', rules, fetcher), /freeze rules/);
  await assert.rejects(confirmPause('source-project', config, rules, rules, async () => ({ ok: true, json: async () => ({ maintenance: false }) })), /paused/);
  await assert.rejects(confirmPause('source-project', config, rules, rules, async url => url.includes('firebase-config') ? fetcher(url) : { status: 400, json: async () => ({ error: { message: 'INVALID_ID_TOKEN' } }) }), /not blocked/);
});
test('source rule inspection reads only the expected project and explains missing IAM permission without secret values', async () => {
  const calls = [];
  assert.equal(await sourceRules('source-project', async url => { calls.push(url); return url.endsWith('cloud.firestore') ? { rulesetName: 'projects/source-project/rulesets/id' } : { source: { files: [{ content: 'original rules' }] } }; }), 'original rules');
  assert.equal(calls.length, 2);
  await assert.rejects(sourceRules('source-project', async () => { throw new Error('HTTP 403'); }), /roles\/firebaserules.viewer/);
});
