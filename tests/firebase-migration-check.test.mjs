import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeText, parseHashConfig, validateBackups, checkDestination } from '../tools/firebase-migration-check.mjs';

test('hash settings are parsed locally from console text or JSON, never guessed', () => {
  const text = 'hash_config { algorithm: SCRYPT, base64_signer_key: "YWJj", base64_salt_separator: "Bw==", rounds: 8, mem_cost: 14, }';
  assert.deepEqual(parseHashConfig(text), { hashAlgorithm: 'SCRYPT', signerKey: 'YWJj', saltSeparator: 'Bw==', rounds: 8, memoryCost: 14 });
  assert.equal(parseHashConfig(JSON.stringify({ algorithm: 'SCRYPT', signerKey: 'YWJj', saltSeparator: '', rounds: 8, memoryCost: 14 })).saltSeparator, '');
  assert.throws(() => parseHashConfig('algorithm: SCRYPT'), /missing or invalid/);
  assert.equal(decodeText(Buffer.concat([Buffer.from([255, 254]), Buffer.from('abc', 'utf16le')])), 'abc');
  assert.equal(decodeText(Buffer.from('\uFEFFabc')), 'abc');
});

const firestore = () => ({ schemaVersion: 1, projectId: 'source-project', databaseId: '(default)', documentCount: 1, documents: [{ path: 'users/uid', fields: { n: { integerValue: '123' } } }] });
const auth = () => ({ users: [{ localId: 'uid', email: 'test@example.invalid', passwordHash: 'YWJj', salt: 'Bw==' }] });
test('backup preflight catches wrong projects, missing hashes, duplicate UIDs and incomplete exports', () => {
  assert.deepEqual(validateBackups(auth(), firestore(), 'source-project', 'target-project'), { users: 1, passwordUsers: 1, hashUsers: 1, documents: 1 });
  assert.throws(() => validateBackups(auth(), firestore(), 'source-project', 'source-project'), /different/);
  const duplicate = auth(); duplicate.users.push({ ...duplicate.users[0] });
  assert.throws(() => validateBackups(duplicate, firestore(), 'source-project', 'target-project'), /duplicate/);
  assert.throws(() => validateBackups({ users: [{ localId: 'uid', salt: 'Bw==' }] }, firestore(), 'source-project', 'target-project'), /no exported password hash/);
  assert.throws(() => validateBackups({ users: [{ localId: 'uid', email: 'test@example.invalid' }] }, firestore(), 'source-project', 'target-project'), /neither/);
  const incomplete = firestore(); incomplete.documentCount = 2;
  assert.throws(() => validateBackups(auth(), incomplete, 'source-project', 'target-project'), /incomplete/);
});

test('destination preflight only reads and refuses an occupied destination or wrong region', async () => {
  const calls = [];
  const request = async (url, init) => {
    calls.push([url, init]);
    if (url.endsWith('/databases/(default)')) return { locationId: 'europe-west12', type: 'FIRESTORE_NATIVE' };
    return {};
  };
  assert.deepEqual(await checkDestination('target-project', 'europe-west12', request), { location: 'europe-west12', users: 0, documents: 0 });
  assert.ok(calls.every(([url, init]) => !init || (url.endsWith(':listCollectionIds') && init.method === 'POST')));
  await assert.rejects(checkDestination('target-project', 'eur3', request), /region/);
  await assert.rejects(checkDestination('target-project', 'europe-west12', async url => url.includes('accounts:batchGet') ? { users: [{ localId: 'existing' }] } : request(url)), /already contains users/);
});
