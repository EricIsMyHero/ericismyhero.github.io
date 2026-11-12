// Read-only Firestore backup. Run locally; never commit credentials or backups.
// Node.js 20+; no npm packages required. Raw Firestore field types are preserved.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

export async function exportFirestore(projectId, request, progress = () => {}) {
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
  const documents = [], collections = new Set(), seen = new Set();
  const prefix = `projects/${projectId}/databases/(default)/documents/`;
  const urlPath = path => path.split('/').map(encodeURIComponent).join('/');
  const pending = [''];
  while (pending.length) {
    const parent = pending.pop();
    let collectionToken;
    do {
      const result = await request(base + (parent ? '/' + urlPath(parent) : '') + ':listCollectionIds', {
        method: 'POST', body: JSON.stringify({ pageSize: 1000, ...(collectionToken ? { pageToken: collectionToken } : {}) })
      });
      for (const collectionId of result.collectionIds || []) {
        const path = parent ? parent + '/' + collectionId : collectionId;
        if (collections.has(path)) continue;
        collections.add(path);
        let pageToken;
        do {
          const params = new URLSearchParams({ pageSize: '300', showMissing: 'true' });
          if (pageToken) params.set('pageToken', pageToken);
          const page = await request(base + '/' + urlPath(path) + '?' + params);
          for (const doc of page.documents || []) {
            if (typeof doc.name !== 'string' || !doc.name.startsWith(prefix)) throw new Error('Unexpected document source; backup stopped.');
            const relative = doc.name.slice(prefix.length);
            if (seen.has(relative)) continue;
            seen.add(relative);
            // Missing parent documents can still contain real subcollections.
            pending.push(relative);
            if (!doc.createTime && !doc.updateTime) continue;
            documents.push({ path: relative, fields: doc.fields || {}, ...(doc.createTime ? { createTime: doc.createTime } : {}), ...(doc.updateTime ? { updateTime: doc.updateTime } : {}) });
            if (documents.length % 50 === 0) progress(documents.length);
          }
          pageToken = page.nextPageToken;
        } while (pageToken);
      }
      collectionToken = result.nextPageToken;
    } while (collectionToken);
  }
  return { schemaVersion: 1, projectId, databaseId: '(default)', exportedAt: new Date().toISOString(),
    consistentSnapshot: false, collectionCount: collections.size, documentCount: documents.length,
    documents: documents.sort((a, b) => a.path.localeCompare(b.path)) };
}

export function authenticatedRequest(key, projectId, fetcher = fetch, options = {}) {
  if (key.project_id !== projectId || key.type !== 'service_account' || !key.client_email || !key.private_key) {
    throw new Error('The key must be a service-account key from the specified SOURCE project.');
  }
  let token, expires = 0;
  return async (url, init = {}) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const now = Math.floor(Date.now() / 1000);
      if (!token || expires - now < 120) {
        const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
        const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({ iss: key.client_email,
          scope: options.scope || 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
        const assertion = unsigned + '.' + crypto.sign('RSA-SHA256', Buffer.from(unsigned), key.private_key).toString('base64url');
        const response = await fetcher('https://oauth2.googleapis.com/token', { method: 'POST', signal: AbortSignal.timeout(30000),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
        if (!response.ok) throw new Error(`Service-account authentication failed (HTTP ${response.status}).`);
        const data = await response.json();
        if (!data.access_token) throw new Error('Service-account authentication returned no token.');
        token = data.access_token; expires = now + (Number(data.expires_in) || 3600);
      }
      const response = await fetcher(url, { ...init, signal: AbortSignal.timeout(30000),
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } });
      if (response.ok) return response.json();
      if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt)); continue;
      }
      throw new Error(`${options.label || 'Firestore backup'} failed (HTTP ${response.status}). Check the project, enabled Firebase services and service-account permissions.`);
    }
  };
}

async function main() {
  const { values } = parseArgs({ options: { key: { type: 'string' }, project: { type: 'string' }, out: { type: 'string', default: 'firestore-backup.json' } } });
  if (!values.key || !values.project) throw new Error('Usage: node firebase-firestore-backup.mjs --key source-key.json --project SOURCE_PROJECT_ID --out firestore-backup.json');
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(values.project)) throw new Error('Invalid source project ID.');
  // Refuse to replace a previous successful backup.
  try { await fs.access(values.out); throw new Error('Output already exists. Choose a different --out filename.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const key = JSON.parse(await fs.readFile(values.key, 'utf8'));
  const request = authenticatedRequest(key, values.project);
  console.log('Reading SOURCE project: ' + values.project);
  const backup = await exportFirestore(values.project, request, count => console.log('Read ' + count + ' documents…'));
  const contents = JSON.stringify(backup, null, 2) + '\n';
  await fs.writeFile(values.out, contents, { flag: 'wx', mode: 0o600 });
  const sha256 = crypto.createHash('sha256').update(contents).digest('hex');
  console.log('Backup saved: ' + values.out);
  console.log('Documents: ' + backup.documentCount + '; collections: ' + backup.collectionCount);
  console.log('SHA256: ' + sha256);
  console.log('Keep this file private. Authentication accounts, rules, indexes and file contents are separate backups.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
