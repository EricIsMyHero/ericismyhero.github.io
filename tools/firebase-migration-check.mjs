// Read-only migration preflight. Never prints secrets or writes to Firebase.
import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { authenticatedRequest, exportFirestore } from './firebase-firestore-backup.mjs';

export function decodeText(buffer) {
  return (buffer[0] === 0xff && buffer[1] === 0xfe ? buffer.subarray(2).toString('utf16le') : buffer.toString('utf8')).replace(/^\uFEFF/, '');
}

export function parseHashConfig(text) {
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch (_) {}
  const extract = name => text.match(new RegExp('\\b' + name + '\\s*:\\s*["\']?([A-Za-z0-9+/_=\u002d]*)'))?.[1];
  const config = {
    hashAlgorithm: data?.algorithm || data?.hashAlgorithm || extract('algorithm'),
    signerKey: data?.base64_signer_key || data?.signerKey || extract('base64_signer_key'),
    saltSeparator: data?.base64_salt_separator ?? data?.saltSeparator ?? extract('base64_salt_separator'),
    rounds: Number(data?.rounds ?? extract('rounds')),
    memoryCost: Number(data?.mem_cost ?? data?.memoryCost ?? extract('mem_cost'))
  };
  const base64 = value => typeof value === 'string' && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
  if (config.hashAlgorithm !== 'SCRYPT' || !config.signerKey || !base64(config.signerKey) || !base64(config.saltSeparator) || !Number.isInteger(config.rounds) || config.rounds < 1 || config.rounds > 100 || !Number.isInteger(config.memoryCost) || config.memoryCost < 1 || config.memoryCost > 30) {
    throw new Error('Hash settings are missing or invalid. Save the complete original SCRYPT hash_config from the SOURCE Firebase Authentication console. Do not share this file.');
  }
  return config;
}

export function validateBackups(auth, firestore, source, target) {
  const validProject = value => typeof value === 'string' && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value);
  if (!validProject(source) || !validProject(target) || source === target) throw new Error('Supply different, valid source and target project IDs.');
  if (!Array.isArray(auth?.users) || !auth.users.length) throw new Error('Authentication backup has no users.');
  const uids = new Set(); let passwordUsers = 0, hashUsers = 0;
  for (const user of auth.users) {
    if (!user || typeof user.localId !== 'string' || !user.localId || user.localId.length > 128 || uids.has(user.localId) || user.tenantId) throw new Error('Authentication backup contains invalid, duplicate or tenant-scoped users.');
    uids.add(user.localId);
    if (user.passwordHash) hashUsers++;
    if (user.passwordHash || user.salt || user.providerUserInfo?.some(provider => provider.providerId === 'password')) {
      passwordUsers++;
      if (!user.passwordHash) throw new Error('A password account has no exported password hash. Export again with permission to read password hashes.');
    } else if (!Array.isArray(user.providerUserInfo) || !user.providerUserInfo.length) {
      throw new Error('An account has neither an exported password hash nor a sign-in provider. Check its source sign-in method and export permissions before migration.');
    }
  }
  if (firestore?.schemaVersion !== 1 || firestore.projectId !== source || firestore.databaseId !== '(default)' || !Array.isArray(firestore.documents) || !firestore.documents.length || firestore.documentCount !== firestore.documents.length) throw new Error('Firestore backup is empty, incomplete or belongs to a different source project.');
  const paths = new Set();
  for (const doc of firestore.documents) {
    const parts = typeof doc?.path === 'string' ? doc.path.split('/') : [];
    if (!parts.length || parts.length % 2 || parts.some(part => !part || part === '.' || part === '..') || paths.has(doc.path) || !doc.fields || typeof doc.fields !== 'object' || Array.isArray(doc.fields)) throw new Error('Firestore backup contains invalid or duplicate document paths or fields.');
    paths.add(doc.path);
  }
  return { users: uids.size, passwordUsers, hashUsers, documents: paths.size };
}

export async function checkDestination(target, location, request) {
  const database = await request(`https://firestore.googleapis.com/v1/projects/${target}/databases/(default)`);
  if (database.locationId !== location || database.type !== 'FIRESTORE_NATIVE') throw new Error('Destination database region or mode does not match. Do not proceed.');
  let auth;
  try { auth = await request(`https://identitytoolkit.googleapis.com/v1/projects/${target}/accounts:batchGet?maxResults=1`); }
  catch (error) { throw new Error('Cannot read destination Authentication. Open Authentication, click Get started and check service-account permissions. ' + error.message); }
  if (auth.users?.length || auth.nextPageToken) throw new Error('Destination Authentication already contains users. Stop before importing; existing accounts must be reviewed.');
  const snapshot = await exportFirestore(target, request);
  if (snapshot.documentCount) throw new Error('Destination Firestore already contains documents. Stop before importing; existing data must be reviewed.');
  return { location: database.locationId, users: 0, documents: 0 };
}

async function main() {
  const { values } = parseArgs({ options: {
    source: { type: 'string' }, target: { type: 'string' }, location: { type: 'string' },
    key: { type: 'string', default: 'firebase-new-key.json' }, auth: { type: 'string', default: 'auth-backup.json' },
    firestore: { type: 'string', default: 'firestore-backup.json' }, 'hash-config': { type: 'string', default: 'firebase-hash-config.txt' }
  } });
  if (!values.source || !values.target || !values.location) throw new Error('Usage: node firebase-migration-check.mjs --source OLD_PROJECT --target NEW_PROJECT --location REGION');
  const read = async path => decodeText(await fs.readFile(path));
  const auth = JSON.parse(await read(values.auth)), firestore = JSON.parse(await read(values.firestore));
  const counts = validateBackups(auth, firestore, values.source, values.target);
  if (counts.passwordUsers) parseHashConfig(await read(values['hash-config']));
  const key = JSON.parse(await read(values.key));
  const request = authenticatedRequest(key, values.target, fetch, { scope: 'https://www.googleapis.com/auth/cloud-platform', label: 'Migration preflight' });
  console.log('Backup users: ' + counts.users + '; users with password hashes: ' + counts.hashUsers);
  console.log('Backup documents: ' + counts.documents);
  console.log('Checking destination project: ' + values.target);
  const destination = await checkDestination(values.target, values.location, request);
  console.log('Destination region: ' + destination.location);
  console.log('Destination users: 0; destination documents: 0');
  console.log('CHECK PASSED. No Firebase data was written. Keep all keys, hash settings and backups private.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
