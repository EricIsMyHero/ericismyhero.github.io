import test from 'node:test';
import assert from 'node:assert/strict';
import { differences, auditSource } from '../tools/firebase-migration-diff.mjs';

test('source audit detects additions, updates and deletions independently of object key order', () => {
  const before = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }, { id: 'c', n: 3 }];
  const after = [{ n: 1, id: 'a' }, { id: 'b', n: 4 }, { id: 'd', n: 5 }];
  assert.deepEqual(differences(before, after, row => row.id), { added: 1, changed: 1, removed: 1 });
});
test('source document audit compares content, validates project identity and refuses older exports', () => {
  const users = { users: [{ localId: 'uid', passwordHash: 'YWJj', salt: 'AQI=' }] };
  const before = { schemaVersion: 1, projectId: 'source-project', databaseId: '(default)', exportedAt: '2026-11-12T10:00:00Z', documentCount: 1, documents: [{ path: 'users/uid', fields: { a: { integerValue: '1' } }, updateTime: 'before' }] };
  const after = { ...before, exportedAt: '2026-11-12T11:00:00Z', documents: [{ ...before.documents[0], updateTime: 'after' }] };
  assert.deepEqual(auditSource(users, before, users, after, 'source-project', 'target-project').documents, { added: 0, changed: 0, removed: 0 });
  assert.throws(() => auditSource(users, after, users, before, 'source-project', 'target-project'), /recent/);
  assert.throws(() => auditSource(users, before, users, { ...after, projectId: 'wrong-project' }, 'source-project', 'target-project'), /different source/);
});
