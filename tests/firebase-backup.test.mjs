import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticatedRequest, exportFirestore } from '../tools/firebase-firestore-backup.mjs';

test('Firestore backup preserves raw values and traverses pagination and missing parents', async () => {
  const prefix = 'projects/source-project/databases/(default)/documents/';
  const fields = { date: { timestampValue: '2026-11-12T00:00:00Z' }, n: { integerValue: '9223372036854775807' }, bytes: { bytesValue: 'AQI=' }, ref: { referenceValue: prefix + 'users/a' } };
  const calls = [];
  const request = async (url, init = {}) => {
    calls.push([url, init]);
    const name = url.split('/documents')[1];
    if (name === ':listCollectionIds') return JSON.parse(init.body).pageToken ? { collectionIds: ['empty'] } : { collectionIds: ['users'], nextPageToken: 'root-next' };
    if (name.startsWith('/users?')) return new URL(url).searchParams.has('pageToken') ? { documents: [{ name: prefix + 'users/missing' }] } : { documents: [{ name: prefix + 'users/a', fields, createTime: '2026-01-01T00:00:00Z' }], nextPageToken: 'docs-next' };
    if (name === '/users/missing:listCollectionIds') return { collectionIds: ['messages'] };
    if (name.startsWith('/users/missing/messages?')) return { documents: [{ name: prefix + 'users/missing/messages/one', createTime: '2026-01-01T00:00:00Z' }] };
    if (name.endsWith(':listCollectionIds')) return {};
    if (name.startsWith('/empty?')) return {};
    throw new Error('Unexpected request: ' + name);
  };
  const backup = await exportFirestore('source-project', request);
  assert.equal(backup.documentCount, 2); assert.equal(backup.collectionCount, 3);
  assert.deepEqual(backup.documents.find(doc => doc.path === 'users/a').fields, fields);
  assert.deepEqual(backup.documents.find(doc => doc.path.endsWith('/one')).fields, {});
  assert.ok(!backup.documents.some(doc => doc.path === 'users/missing'));
  assert.ok(calls.every(([url, init]) => init.method === 'POST' ? url.endsWith(':listCollectionIds') : new URL(url).searchParams.get('showMissing') === 'true'));
  assert.equal(backup.consistentSnapshot, false);
});

test('backup refuses a key from the destination or another project before any network call', () => {
  assert.throws(() => authenticatedRequest({ project_id: 'destination-project', type: 'service_account', client_email: 'test@example.invalid', private_key: 'never used' }, 'source-project'), /SOURCE project/);
});

test('backup fails completely instead of silently omitting an inaccessible collection', async () => {
  await assert.rejects(exportFirestore('source-project', async () => { throw new Error('HTTP 403'); }), /403/);
  await assert.rejects(exportFirestore('source-project', async (url, init) => init ? { collectionIds: ['users'] } : { documents: [{ name: 'projects/another-project/databases/(default)/documents/users/a' }] }), /Unexpected document source/);
});
