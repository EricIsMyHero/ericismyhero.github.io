import test from 'node:test';
import assert from 'node:assert/strict';
import { makePlan, reconcile, copyMissing, rebaseReferences, listAuthUsers } from '../tools/firebase-migration-restore.mjs';

const source = 'source-project', target = 'target-project';
const prefix = project => `projects/${project}/databases/(default)/documents/`;
const auth = () => ({ users: [{ localId: 'same-uid', email: 'test@example.invalid', passwordHash: '+/8=', salt: '+/8=', createdAt: '100', lastSignedInAt: '200', customAttributes: '{"role":"student"}' }] });
const hashes = 'hash_config {algorithm: SCRYPT, base64_signer_key: +/8=, base64_salt_separator: Bw==, rounds: 8, mem_cost: 14}';
const backup = (size = 1) => ({ schemaVersion: 1, projectId: source, databaseId: '(default)', documentCount: size,
  documents: Array.from({ length: size }, (_, i) => ({ path: 'records/' + i, fields: { uid: { stringValue: 'same-uid' }, time: { timestampValue: '2026-11-12T00:00:00Z' }, large: { integerValue: '9223372036854775807' }, target: { referenceValue: prefix(source) + 'users/same-uid' } } })) });

test('import plans preserve UIDs and CLI timestamps while converting password bytes for the REST API', () => {
  const original = auth(), before = structuredClone(original);
  const plan = makePlan(original, backup(), hashes, source, target);
  assert.deepEqual(original, before);
  assert.equal(plan.users[0].localId, 'same-uid');
  assert.equal(plan.users[0].passwordHash, '-_8='); assert.equal(plan.users[0].salt, '-_8=');
  assert.equal(plan.hashConfig.signerKey, '-_8=');
  assert.equal(plan.users[0].lastLoginAt, '200'); assert.ok(!Object.hasOwn(plan.users[0], 'lastSignedInAt'));
  assert.throws(() => makePlan({ users: [{ ...auth().users[0], rawPassword: 'do-not-use' }] }, backup(), hashes, source, target), /Plaintext/);
});

test('internal references are rebased without changing ordinary strings, bytes, nested values or foreign references', () => {
  const fields = { reference: { referenceValue: prefix(source) + 'users/u' }, text: { stringValue: prefix(source) + 'users/u' }, bytes: { bytesValue: 'AQI=' }, nested: { arrayValue: { values: [{ referenceValue: prefix(source) + 'users/u' }, { referenceValue: prefix('foreign-project') + 'users/u' }] } } };
  const actual = rebaseReferences(fields, source, target);
  assert.equal(actual.reference.referenceValue, prefix(target) + 'users/u');
  assert.deepEqual(actual.text, fields.text); assert.deepEqual(actual.bytes, fields.bytes);
  assert.equal(actual.nested.arrayValue.values[0].referenceValue, prefix(target) + 'users/u');
  assert.equal(actual.nested.arrayValue.values[1].referenceValue, prefix('foreign-project') + 'users/u');
});

test('reconciliation refuses occupied destinations, conflicting values or unknown accounts', () => {
  const plan = makePlan(auth(), backup(), hashes, source, target);
  assert.throws(() => reconcile(plan, { users: plan.users, documents: [] }, false), /not empty/);
  assert.throws(() => reconcile(plan, { users: [{ ...plan.users[0], localId: 'someone-else' }], documents: [] }, true), /differs/);
  assert.throws(() => reconcile(plan, { users: [], documents: [{ ...plan.documents[0], fields: {} }] }, true), /differs/);
  assert.deepEqual(reconcile(plan, { users: plan.users, documents: plan.documents }, true), { users: [], documents: [] });
});

function destination() {
  const users = [], documents = new Map(), calls = []; let failAfterCommit = false;
  const snapshot = () => ({ users: structuredClone(users), documents: [...documents].map(([path, fields]) => ({ path, fields: structuredClone(fields) })) });
  return { snapshot, users, documents, calls, failOnceAfterCommit() { failAfterCommit = true; },
    async request(url, init = {}) {
      calls.push([url, init]); assert.ok(url.includes('/projects/' + target + '/'));
      if (url.includes('accounts:batchCreate')) {
        const body = JSON.parse(init.body); assert.equal(body.allowOverwrite, false);
        users.push(...structuredClone(body.users)); return {};
      }
      if (url.includes('accounts:batchGet')) return { users: structuredClone(users) };
      if (url.endsWith('documents:commit')) {
        const { writes } = JSON.parse(init.body); assert.ok(writes.length <= 100);
        for (const write of writes) {
          assert.deepEqual(write.currentDocument, { exists: false });
          assert.ok(write.update.name.startsWith(prefix(target)));
          const path = write.update.name.slice(prefix(target).length);
          assert.ok(!documents.has(path)); documents.set(path, write.update.fields);
        }
        if (failAfterCommit) { failAfterCommit = false; throw new Error('response lost after successful commit'); }
        return {};
      }
      throw new Error('Unexpected request');
    }
  };
}

test('copy imports accounts without overwrites and verifies raw document types and relationships', async () => {
  const plan = makePlan(auth(), backup(3), hashes, source, target), db = destination();
  await copyMissing(plan, reconcile(plan, db.snapshot(), false), db.request);
  assert.deepEqual(reconcile(plan, db.snapshot(), true), { users: [], documents: [] });
  assert.equal(db.documents.get('records/0').large.integerValue, '9223372036854775807');
  assert.equal(db.documents.get('records/0').target.referenceValue, prefix(target) + 'users/same-uid');
});

test('a lost commit response resumes without overwriting documents or importing accounts twice', async () => {
  const plan = makePlan(auth(), backup(105), hashes, source, target), db = destination();
  db.failOnceAfterCommit();
  await assert.rejects(copyMissing(plan, reconcile(plan, db.snapshot(), false), db.request), /response lost/);
  assert.equal(db.documents.size, 100);
  const missing = reconcile(plan, db.snapshot(), true);
  assert.equal(missing.users.length, 0); assert.equal(missing.documents.length, 5);
  await copyMissing(plan, missing, db.request);
  assert.deepEqual(reconcile(plan, db.snapshot(), true), { users: [], documents: [] });
  assert.equal(db.calls.filter(([url]) => url.includes('accounts:batchCreate')).length, 1);
});

test('partial Authentication errors stop before Firestore writes and do not log account data', async () => {
  const plan = makePlan(auth(), backup(), hashes, source, target), calls = [];
  await assert.rejects(copyMissing(plan, { users: plan.users, documents: plan.documents }, async url => {
    calls.push(url); return { error: [{ index: 0, message: 'INVALID_PASSWORD_HASH : private-account-details' }] };
  }), error => error.message.includes('INVALID_PASSWORD_HASH') && !error.message.includes('private-account-details'));
  assert.equal(calls.length, 1);
});

test('destination user enumeration follows every page', async () => {
  const result = await listAuthUsers(target, async url => new URL(url).searchParams.has('nextPageToken') ? { users: [{ localId: 'b' }] } : { users: [{ localId: 'a' }], nextPageToken: 'next' });
  assert.deepEqual(result.map(user => user.localId), ['a', 'b']);
});

test('REST password provider representation matches a CLI-exported password account without changing its journal fingerprint', () => {
  const plan = makePlan(auth(), backup(), hashes, source, target), fingerprint = plan.fingerprint;
  const actual = { users: [{ ...plan.users[0], providerUserInfo: [{ providerId: 'password', rawId: 'test@example.invalid' }] }], documents: [] };
  assert.equal(reconcile(plan, actual, true).users.length, 0);
  assert.equal(plan.fingerprint, fingerprint);
  const google = auth(); delete google.users[0].passwordHash; delete google.users[0].salt;
  google.users[0].providerUserInfo = [{ providerId: 'google.com', rawId: 'google-id' }];
  const googlePlan = makePlan(google, backup(), '', source, target);
  assert.throws(() => reconcile(googlePlan, { users: [{ ...googlePlan.users[0], providerUserInfo: [...googlePlan.users[0].providerUserInfo, { providerId: 'password', rawId: 'unexpected' }] }], documents: [] }, true), /providers: 1/);
});

test('account verification reports differing field counts but never private account values', () => {
  const plan = makePlan(auth(), backup(), hashes, source, target);
  const actual = { users: [{ ...plan.users[0], displayName: 'private-name', lastLoginAt: 'private-date', email: 'private@example.invalid' }], documents: [] };
  assert.throws(() => reconcile(plan, actual, true), error => {
    assert.match(error.message, /name: 1/); assert.match(error.message, /lastLoginAt: 1/); assert.match(error.message, /email: 1/);
    assert.ok(!error.message.includes('private')); assert.ok(!error.message.includes('same-uid'));
    return true;
  });
});
