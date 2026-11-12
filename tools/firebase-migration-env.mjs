// Prepare private Vercel values locally. Does not contact or modify any service.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export function makeFirebaseEnv(web, key, vapidText, journal, project) {
  if (typeof project !== 'string' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project) || web?.projectId !== project || key?.project_id !== project) throw new Error('Web configuration and service-account key must both belong to the specified destination project.');
  if (web.private_key || key.type !== 'service_account' || typeof key.client_email !== 'string' || !key.client_email.endsWith('@' + project + '.iam.gserviceaccount.com') || typeof key.private_key !== 'string') throw new Error('Use the destination web SDK config and its original service-account key.');
  const rsa = crypto.createPrivateKey(key.private_key);
  if (rsa.asymmetricKeyType !== 'rsa' || rsa.asymmetricKeyDetails.modulusLength < 2048) throw new Error('The service-account key must be an RSA key of at least 2048 bits.');
  if (journal?.schemaVersion !== 1 || journal.status !== 'verified' || journal.target !== project || journal.source === project || !journal.fingerprint) throw new Error('A verified migration journal for this destination is required.');
  const number = typeof web.appId === 'string' && web.appId.match(/^1:(\d+):web:[A-Za-z0-9]+$/)?.[1];
  if (typeof web.apiKey !== 'string' || web.apiKey.length < 20 || web.authDomain !== project + '.firebaseapp.com' || !number || web.messagingSenderId !== number) throw new Error('Destination web configuration has missing or inconsistent Firebase fields. Export the SDK config again.');
  const vapid = vapidText.replace(/^\uFEFF/, '').replace(/\s/g, '');
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(vapid)) throw new Error('VAPID file must contain only the public Web Push certificate key.');
  const publicKey = Buffer.from(vapid, 'base64url');
  if (publicKey.length !== 65 || publicKey[0] !== 4) throw new Error('Invalid Web Push public key length or format.');
  try { crypto.ECDH.convertKey(publicKey, 'prime256v1'); } catch (_) { throw new Error('The Web Push public key is not a valid P-256 point.'); }
  const variables = {
    FIREBASE_API_KEY: web.apiKey, FIREBASE_AUTH_DOMAIN: web.authDomain, FIREBASE_PROJECT_ID: project,
    FIREBASE_STORAGE_BUCKET: web.storageBucket || '', FIREBASE_MESSAGING_SENDER_ID: web.messagingSenderId,
    FIREBASE_APP_ID: web.appId, FIREBASE_MEASUREMENT_ID: web.measurementId || '',
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify(key), FIREBASE_VAPID_KEY: publicKey.toString('base64url')
  };
  const rows = Object.entries(variables).map(([name, value]) => {
    // Single quotes preserve JSON's literal backslash-n sequences in PEM keys.
    if (typeof value !== 'string' || /['\r\n]/.test(value)) throw new Error('An environment value cannot be represented safely; no file was written.');
    return name + "='" + value + "'";
  });
  return { count: rows.length, contents: '# PRIVATE: contains a service-account key. Never commit or share.\n' + rows.join('\n') + '\n',
    optionalEmpty: ['FIREBASE_STORAGE_BUCKET', 'FIREBASE_MEASUREMENT_ID'].filter(name => !variables[name]) };
}

async function main() {
  const { values } = parseArgs({ options: {
    project: { type: 'string' }, config: { type: 'string', default: 'firebase-web-config.json' },
    key: { type: 'string', default: 'firebase-new-key.json' }, vapid: { type: 'string', default: 'firebase-vapid-key.txt' },
    journal: { type: 'string', default: 'firebase-migration-state.json' }, out: { type: 'string', default: 'firebase-target.env' }
  } });
  const read = async path => (await fs.readFile(path, 'utf8')).replace(/^\uFEFF/, '');
  const prepared = makeFirebaseEnv(JSON.parse(await read(values.config)), JSON.parse(await read(values.key)), await read(values.vapid), JSON.parse(await read(values.journal)), values.project);
  await fs.writeFile(values.out, prepared.contents, { flag: 'wx', mode: 0o600 });
  console.log('Private environment file prepared: ' + values.out);
  console.log('Destination project: ' + values.project + '; Firebase variables: ' + prepared.count);
  if (prepared.optionalEmpty.length) console.log('Optional SDK fields are empty: ' + prepared.optionalEmpty.join(', '));
  console.log('No Vercel settings changed. Keep this file private; do not import it until final cutover.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.code === 'EEXIST' ? 'Output already exists. Keep it private and choose a different --out filename if needed.' : error.message); process.exitCode = 1; });
