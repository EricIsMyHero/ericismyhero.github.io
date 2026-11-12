// Local, resumable copy into a new Firebase project. Never modifies the source.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { authenticatedRequest, exportFirestore } from './firebase-firestore-backup.mjs';
import { decodeText, parseHashConfig, validateBackups } from './firebase-migration-check.mjs';

const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const hash = value => crypto.createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const prefix = project => `projects/${project}/databases/(default)/documents/`;

export function rebaseReferences(value, source, target) {
  if (Array.isArray(value)) return value.map(item => rebaseReferences(item, source, target));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
    key === 'referenceValue' && typeof item === 'string' && item.startsWith(prefix(source))
      ? prefix(target) + item.slice(prefix(source).length) : rebaseReferences(item, source, target)]));
}

export function makePlan(auth, backup, hashText, source, target) {
  const counts = validateBackups(auth, backup, source, target);
  if (auth.users.some(user => Object.hasOwn(user, 'rawPassword'))) throw new Error('Plaintext passwords are not accepted. Use the original Firebase export.');
  const hashConfig = counts.passwordUsers ? parseHashConfig(hashText) : {};
  const webSafe = value => value.replace(/\+/g, '-').replace(/\//g, '_');
  for (const key of ['signerKey', 'saltSeparator']) if (hashConfig[key]) hashConfig[key] = webSafe(hashConfig[key]);
  // Match Firebase CLI's JSON-to-REST conversion, including login timestamps.
  const users = auth.users.map(original => {
    const user = { ...original };
    if (Object.hasOwn(user, 'lastSignedInAt')) { user.lastLoginAt = user.lastSignedInAt; delete user.lastSignedInAt; }
    for (const key of ['passwordHash', 'salt']) if (user[key]) user[key] = webSafe(user[key]);
    return user;
  });
  const documents = backup.documents.map(doc => ({ path: doc.path, fields: rebaseReferences(doc.fields, source, target) }));
  return { source, target, counts, users, hashConfig, documents,
    fingerprint: hash({ source, target, users, hashConfig, documents }) };
}

export function userIdentity(user, expected = user) {
  let claims;
  try { claims = JSON.parse(user.customAttributes || '{}'); } catch (_) { throw new Error('Invalid custom claims in an Authentication record.'); }
  const timestamp = value => value && value !== '0' ? String(value) : '';
  return { uid: user.localId, email: (user.email || '').toLowerCase(), emailVerified: !!user.emailVerified,
    disabled: !!user.disabled, name: user.displayName || '', photo: user.photoUrl || '', phone: user.phoneNumber || '', claims,
    createdAt: timestamp(user.createdAt), lastLoginAt: timestamp(user.lastLoginAt || user.lastSignedInAt), mfaInfo: user.mfaInfo || [],
    // Firebase CLI omits the password provider from exports. The REST API may
    // return it explicitly; a source password hash already establishes it.
    providers: (user.providerUserInfo || []).filter(provider => !(provider.providerId === 'password' && expected.passwordHash)).map(provider => ({ providerId: provider.providerId, id: provider.rawId || provider.federatedId || '' })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) };
}

export function reconcile(plan, actual, resume) {
  if (!resume && (actual.users.length || actual.documents.length)) throw new Error('Destination is not empty and no matching local migration journal exists. Nothing will be overwritten.');
  const expectedUsers = new Map(plan.users.map(user => [user.localId, user]));
  const expectedDocs = new Map(plan.documents.map(doc => [doc.path, doc]));
  const differences = new Map();
  for (const user of actual.users) {
    const expected = expectedUsers.get(user.localId);
    if (!expected) { differences.set('unknown accounts', (differences.get('unknown accounts') || 0) + 1); continue; }
    const observed = userIdentity(user, expected), wanted = userIdentity(expected);
    for (const field of Object.keys(wanted)) {
      if (!isDeepStrictEqual(observed[field], wanted[field])) differences.set(field, (differences.get(field) || 0) + 1);
    }
  }
  if (differences.size) {
    // Report only fixed field names and counts: never UIDs, emails or values.
    const summary = [...differences].sort(([a], [b]) => a.localeCompare(b)).map(([field, count]) => field + ': ' + count).join('; ');
    throw new Error('An existing destination account differs from this backup. Verification fields: ' + summary + '. Stopped without overwriting it.');
  }
  for (const doc of actual.documents) {
    if (!expectedDocs.has(doc.path) || !isDeepStrictEqual(doc.fields || {}, expectedDocs.get(doc.path).fields)) throw new Error('An existing destination document differs from this backup. Stopped without overwriting it.');
  }
  const users = new Set(actual.users.map(user => user.localId)), documents = new Set(actual.documents.map(doc => doc.path));
  return { users: plan.users.filter(user => !users.has(user.localId)), documents: plan.documents.filter(doc => !documents.has(doc.path)) };
}

export async function listAuthUsers(target, request) {
  const users = []; let nextPageToken;
  do {
    const params = new URLSearchParams({ maxResults: '1000' });
    if (nextPageToken) params.set('nextPageToken', nextPageToken);
    const result = await request(`https://identitytoolkit.googleapis.com/v1/projects/${target}/accounts:batchGet?${params}`);
    users.push(...(result.users || [])); nextPageToken = result.nextPageToken;
  } while (nextPageToken);
  if (new Set(users.map(user => user.localId)).size !== users.length) throw new Error('Duplicate destination account IDs; retry the read.');
  return users;
}

export async function loadDestination(plan, request, location) {
  const database = await request(`https://firestore.googleapis.com/v1/projects/${plan.target}/databases/(default)`);
  if (database.locationId !== location || database.type !== 'FIRESTORE_NATIVE') throw new Error('Destination database region or mode does not match.');
  const users = await listAuthUsers(plan.target, request);
  const backup = await exportFirestore(plan.target, request);
  return { users, documents: backup.documents };
}

export async function copyMissing(plan, missing, request, progress = () => {}) {
  for (let start = 0; start < missing.users.length; start += 1000) {
    const users = missing.users.slice(start, start + 1000);
    const result = await request(`https://identitytoolkit.googleapis.com/v1/projects/${plan.target}/accounts:batchCreate`, {
      method: 'POST', body: JSON.stringify({ ...plan.hashConfig, users, allowOverwrite: false })
    });
    if (result.error?.length) {
      const first = result.error[0], code = String(first.message || 'UNKNOWN').split(/[\s:]/)[0].replace(/[^A-Z0-9_]/g, '').slice(0, 80);
      throw new Error(`Authentication import reported ${result.error.length} error(s); first index ${first.index}, code ${code}. Firestore import was not started. Keep the journal and rerun the same command after resolving the error.`);
    }
    progress('Authentication batch accepted: ' + users.length + ' users.');
  }
  // Verify identity preservation before writing document data.
  const users = await listAuthUsers(plan.target, request);
  const remaining = reconcile(plan, { users, documents: [] }, true);
  if (remaining.users.length) throw new Error('Authentication verification found missing users. Keep the journal and rerun the same command.');

  let writes = [], bytes = 0, copied = 0;
  const flush = async () => {
    if (!writes.length) return;
    await request(`https://firestore.googleapis.com/v1/projects/${plan.target}/databases/(default)/documents:commit`, {
      method: 'POST', body: JSON.stringify({ writes })
    });
    copied += writes.length; writes = []; bytes = 0;
    progress('Firestore documents copied this run: ' + copied + '/' + missing.documents.length);
  };
  for (const doc of missing.documents) {
    const write = { update: { name: prefix(plan.target) + doc.path, fields: doc.fields }, currentDocument: { exists: false } };
    const size = Buffer.byteLength(JSON.stringify(write), 'utf8');
    if (size > 8000000) throw new Error('A document exceeds the safe batch size. Stopped.');
    if (writes.length >= 100 || bytes + size > 8000000) await flush();
    writes.push(write); bytes += size;
  }
  await flush();
}

async function main() {
  const { values } = parseArgs({ options: {
    source: { type: 'string' }, target: { type: 'string' }, location: { type: 'string' },
    apply: { type: 'boolean', default: false }, verify: { type: 'boolean', default: false },
    key: { type: 'string', default: 'firebase-new-key.json' }, auth: { type: 'string', default: 'auth-backup.json' },
    firestore: { type: 'string', default: 'firestore-backup.json' }, 'hash-config': { type: 'string', default: 'firebase-hash-config.txt' },
    journal: { type: 'string', default: 'firebase-migration-state.json' }
  } });
  if (!values.source || !values.target || !values.location || values.apply === values.verify) throw new Error('Specify --source OLD_PROJECT --target NEW_PROJECT --location REGION and exactly one of --apply or --verify.');
  const read = async path => decodeText(await fs.readFile(path));
  const auth = JSON.parse(await read(values.auth)), backup = JSON.parse(await read(values.firestore));
  const counts = validateBackups(auth, backup, values.source, values.target);
  const hashText = counts.passwordUsers ? await read(values['hash-config']) : '';
  const plan = makePlan(auth, backup, hashText, values.source, values.target);
  let journal;
  try { journal = JSON.parse(await read(values.journal)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (journal && (journal.schemaVersion !== 1 || journal.source !== plan.source || journal.target !== plan.target || journal.fingerprint !== plan.fingerprint)) throw new Error('The local migration journal belongs to different inputs. Do not delete it or replace the backups; review the migration first.');
  const key = JSON.parse(await read(values.key));
  const request = authenticatedRequest(key, plan.target, fetch, { scope: 'https://www.googleapis.com/auth/cloud-platform', label: 'Migration' });
  console.log('Source: ' + plan.source + '; destination: ' + plan.target);
  console.log('Expected users: ' + counts.users + '; password hashes: ' + counts.hashUsers + '; documents: ' + counts.documents);
  let actual = await loadDestination(plan, request, values.location);
  let missing = reconcile(plan, actual, !!journal || values.verify);
  if (values.apply) {
    if (!journal) {
      journal = { schemaVersion: 1, source: plan.source, target: plan.target, fingerprint: plan.fingerprint, startedAt: new Date().toISOString(), status: 'running' };
      await fs.writeFile(values.journal, JSON.stringify(journal, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    }
    console.log('Missing users: ' + missing.users.length + '; missing documents: ' + missing.documents.length);
    await copyMissing(plan, missing, request, console.log);
    actual = await loadDestination(plan, request, values.location);
    missing = reconcile(plan, actual, true);
  }
  if (missing.users.length || missing.documents.length) throw new Error('Verification incomplete: missing users ' + missing.users.length + '; missing documents ' + missing.documents.length + '. Keep all files and rerun --apply with the same inputs.');
  if (journal && values.apply) {
    journal.status = 'verified'; journal.verifiedAt = new Date().toISOString();
    await fs.writeFile(values.journal, JSON.stringify(journal, null, 2) + '\n', { mode: 0o600 });
  }
  console.log('VERIFIED: ' + actual.users.length + ' users; ' + actual.documents.length + ' documents.');
  console.log('UIDs, account identities and all document fields match the backup; internal document references point to the destination.');
  console.log('Keep all backup files and the migration journal. Keep the production site on the source until rules, indexes, sign-in, push and final source changes have been checked.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
