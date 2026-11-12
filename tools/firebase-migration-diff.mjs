// Read-only audit between the initial and a fresh source export. Prints counts only.
import fs from 'node:fs/promises';
import { parseArgs, isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';
import { decodeText, validateBackups } from './firebase-migration-check.mjs';

export function differences(before, after, identity, contents = value => value) {
  const old = new Map(before.map(value => [identity(value), contents(value)]));
  const latest = new Map(after.map(value => [identity(value), contents(value)]));
  let added = 0, changed = 0, removed = 0;
  for (const [id, value] of latest) {
    if (!old.has(id)) added++;
    else if (!isDeepStrictEqual(old.get(id), value)) changed++;
  }
  for (const id of old.keys()) if (!latest.has(id)) removed++;
  return { added, changed, removed };
}

export function auditSource(initialAuth, initialData, latestAuth, latestData, source, target) {
  const initial = validateBackups(initialAuth, initialData, source, target);
  const latest = validateBackups(latestAuth, latestData, source, target);
  if (!Number.isFinite(Date.parse(initialData.exportedAt)) || !Number.isFinite(Date.parse(latestData.exportedAt)) || Date.parse(latestData.exportedAt) < Date.parse(initialData.exportedAt)) throw new Error('The latest Firestore export must be at least as recent as the initial export.');
  return { initial: { users: initial.users, documents: initial.documents }, latest: { users: latest.users, documents: latest.documents },
    users: differences(initialAuth.users, latestAuth.users, user => user.localId),
    documents: differences(initialData.documents, latestData.documents, doc => doc.path, doc => doc.fields) };
}

async function main() {
  const { values } = parseArgs({ options: {
    source: { type: 'string' }, target: { type: 'string' }, auth: { type: 'string', default: 'auth-backup.json' },
    firestore: { type: 'string', default: 'firestore-backup.json' }, 'latest-auth': { type: 'string', default: 'auth-latest.json' },
    'latest-firestore': { type: 'string', default: 'firestore-latest.json' }
  } });
  const read = async path => JSON.parse(decodeText(await fs.readFile(path)));
  const result = auditSource(await read(values.auth), await read(values.firestore), await read(values['latest-auth']), await read(values['latest-firestore']), values.source, values.target);
  console.log('Initial source: users ' + result.initial.users + '; documents ' + result.initial.documents);
  console.log('Latest source: users ' + result.latest.users + '; documents ' + result.latest.documents);
  for (const [label, diff] of [['Accounts', result.users], ['Documents', result.documents]]) console.log(label + ': added ' + diff.added + '; changed ' + diff.changed + '; removed ' + diff.removed);
  console.log('READ-ONLY AUDIT COMPLETE. No Firebase or Vercel settings changed. This is not a write-frozen cutover snapshot. Keep original and latest files private.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
