// Conservative final catch-up. Source is never written; removals/conflicts stop.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { parseArgs, isDeepStrictEqual as same } from 'node:util';
import { pathToFileURL } from 'node:url';
import { authenticatedRequest } from './firebase-firestore-backup.mjs';
import { decodeText } from './firebase-migration-check.mjs';
import { makePlan, userIdentity, loadDestination } from './firebase-migration-restore.mjs';
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const digest = x => crypto.createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const canonicalRules = text => text.replace(/\r\n/g, '\n').trim();
function identity(user, expected) { const value = userIdentity(user, expected); delete value.lastLoginAt; return value; }

export function planDelta(base, latest, actual) {
  const bDocs = new Map(base.documents.map(x => [x.path, x])), nDocs = new Map(latest.documents.map(x => [x.path, x])), aDocs = new Map(actual.documents.map(x => [x.path, x]));
  const bUsers = new Map(base.users.map(x => [x.localId, x])), nUsers = new Map(latest.users.map(x => [x.localId, x])), aUsers = new Map(actual.users.map(x => [x.localId, x]));
  if (base.documents.some(x => !nDocs.has(x.path)) || base.users.some(x => !nUsers.has(x.localId))) throw new Error('Source removals require explicit review. No data was changed.');
  if (actual.documents.some(x => !nDocs.has(x.path)) || actual.users.some(x => !nUsers.has(x.localId))) throw new Error('Unexpected destination records require review. No data was changed.');
  const documents = [], users = [];
  for (const doc of latest.documents) {
    const before = bDocs.get(doc.path), current = aDocs.get(doc.path);
    if (current && same(current.fields, doc.fields)) continue;
    if ((!current && before) || (current && (!before || !same(current.fields, before.fields)))) throw new Error('Destination document conflict. No data was changed.');
    if (current && !current.updateTime) throw new Error('A destination document has no concurrency version.');
    documents.push({ ...doc, ...(current ? { updateTime: current.updateTime } : {}) });
  }
  for (const fresh of latest.users) {
    const before = bUsers.get(fresh.localId), current = aUsers.get(fresh.localId);
    if (current && !same(identity(current, fresh), identity(fresh, fresh)) && (!before || !same(identity(current, before), identity(before, before)))) {
      const observed = identity(current, fresh), wanted = identity(fresh, fresh), previous = before && identity(before, before);
      const fields = Object.keys(wanted).filter(key => !same(observed[key], wanted[key]) && (!previous || !same(observed[key], previous[key])));
      throw new Error('Destination account conflict. Fields: ' + (fields.join(', ') || 'mixed identity state') + '. No data was changed.');
    }
    if (!current && before) throw new Error('A destination account unexpectedly disappeared. No data was changed.');
    if (!before || !current || !same(before, fresh)) {
      const user = { ...fresh };
      const timestamps = [fresh.lastLoginAt || 0, current?.lastLoginAt || 0].map(Number);
      if (!timestamps.every(Number.isSafeInteger)) throw new Error('Invalid account login timestamp.');
      if (Math.max(...timestamps)) user.lastLoginAt = String(Math.max(...timestamps));
      users.push(user);
    }
  }
  return { users, documents, creates: documents.filter(x => !x.updateTime).length, updates: documents.filter(x => x.updateTime).length };
}

export async function sourceRules(source, request) {
  try {
    const release = await request(`https://firebaserules.googleapis.com/v1/projects/${source}/releases/cloud.firestore`);
    if (typeof release.rulesetName !== 'string' || !release.rulesetName.startsWith(`projects/${source}/rulesets/`)) throw new Error('Unexpected source rules release.');
    const set = await request('https://firebaserules.googleapis.com/v1/' + release.rulesetName);
    if (set.source?.files?.length !== 1 || typeof set.source.files[0].content !== 'string') throw new Error('Review the source ruleset before cutover.');
    return set.source.files[0].content;
  } catch (error) {
    if (error.message.includes('HTTP 403')) throw new Error('Source service-account permission needed: Firebase Rules Viewer (roles/firebaserules.viewer). Grant it on the SOURCE project, then rerun. No pause was activated.');
    throw error;
  }
}

export async function confirmPause(source, sourceConfig, deployedRules, freezeRules, fetcher = fetch) {
  if (sourceConfig.projectId !== source || !sourceConfig.apiKey || canonicalRules(deployedRules) !== canonicalRules(freezeRules)) throw new Error('Source client configuration or deployed freeze rules do not match.');
  const response = await fetcher('https://ericismyhero-github-io.vercel.app/api/firebase-config', { cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Cannot verify backend maintenance.');
  const config = await response.json();
  if (!config.maintenance || config.projectId !== source || !config.deployment) throw new Error('Backend must be paused on the SOURCE project before final exports.');
  const auth = await fetcher('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(sourceConfig.apiKey), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: 'invalid-migration-probe' }), signal: AbortSignal.timeout(30000)
  });
  const body = await auth.json();
  const blocked = body.error?.details?.some(x => x.reason === 'API_KEY_HTTP_REFERRER_BLOCKED') || /refer(?:er|rer).*blocked/i.test(body.error?.message || '');
  if (auth.status !== 403 || !blocked) throw new Error('Source web API key is not blocked by the temporary website-referrer restriction.');
  return config.deployment;
}

export async function writeDelta(plan, delta, request, progress = () => {}) {
  for (let i = 0; i < delta.users.length; i += 1000) {
    const result = await request(`https://identitytoolkit.googleapis.com/v1/projects/${plan.target}/accounts:batchCreate`, { method: 'POST', body: JSON.stringify({ ...plan.hashConfig, allowOverwrite: true, users: delta.users.slice(i, i + 1000) }) });
    if (result.error?.length) throw new Error('Authentication catch-up failed. Keep all files; report the error count: ' + result.error.length);
  }
  let batch = [], bytes = 0, count = 0;
  const flush = async () => {
    if (!batch.length) return;
    await request(`https://firestore.googleapis.com/v1/projects/${plan.target}/databases/(default)/documents:commit`, { method: 'POST', body: JSON.stringify({ writes: batch }) });
    count += batch.length; batch = []; bytes = 0; progress('Documents caught up: ' + count + '/' + delta.documents.length);
  };
  for (const doc of delta.documents) {
    const write = { update: { name: `projects/${plan.target}/databases/(default)/documents/` + doc.path, fields: doc.fields }, currentDocument: doc.updateTime ? { updateTime: doc.updateTime } : { exists: false } };
    const size = Buffer.byteLength(JSON.stringify(write));
    if (size > 8000000) throw new Error('Document exceeds safe commit size.');
    if (batch.length >= 100 || bytes + size > 8000000) await flush();
    batch.push(write); bytes += size;
  }
  await flush();
}

async function main() {
  const { values: v } = parseArgs({ options: {
    source: { type: 'string' }, target: { type: 'string' }, location: { type: 'string', default: 'europe-west12' }, plan: { type: 'boolean' }, apply: { type: 'boolean' }, 'check-pause': { type: 'boolean' },
    'latest-auth': { type: 'string', default: 'auth-latest.json' }, 'latest-firestore': { type: 'string', default: 'firestore-latest.json' }
  } });
  if (!v.source || !v.target || v.source === v.target || [v.plan, v.apply, v['check-pause']].filter(Boolean).length !== 1) throw new Error('Specify different --source/--target and exactly one of --plan, --check-pause, --apply.');
  const text = async name => decodeText(await fs.readFile(name)), json = async name => JSON.parse(await text(name));
  const sourceKey = await json('firebase-old-key.json'), targetKey = await json('firebase-new-key.json');
  const options = { scope: 'https://www.googleapis.com/auth/cloud-platform', label: 'Firebase cutover' };
  const sourceRequest = authenticatedRequest(sourceKey, v.source, fetch, options), targetRequest = authenticatedRequest(targetKey, v.target, fetch, options);
  const rules = await sourceRules(v.source, sourceRequest);
  if (v['check-pause']) {
    const deployment = await confirmPause(v.source, await json('firebase-source-web-config.json'), rules, await text('firestore.migration-freeze.rules'));
    const marker = { source: v.source, target: v.target, deployment, safeAfter: new Date(Date.now() + 360000).toISOString() };
    try {
      const previous = await json('firebase-source-paused.json');
      if (previous.source !== v.source || previous.target !== v.target || previous.deployment !== deployment || !Number.isFinite(Date.parse(previous.safeAfter))) throw new Error('A different pause marker exists. Keep all files and review before continuing.');
      console.log('SOURCE PAUSE STILL VERIFIED. Existing drain deadline: ' + previous.safeAfter); return;
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await fs.writeFile('firebase-source-paused.json', JSON.stringify(marker, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log('SOURCE PAUSE VERIFIED. Wait 6 minutes before taking new auth-final.json and firestore-final.json exports.'); return;
  }
  let marker;
  if (v.apply) {
    marker = await json('firebase-source-paused.json');
    const deployment = await confirmPause(v.source, await json('firebase-source-web-config.json'), rules, await text('firestore.migration-freeze.rules'));
    if (marker.source !== v.source || marker.target !== v.target || marker.deployment !== deployment || !Number.isFinite(Date.parse(marker.safeAfter))) throw new Error('Pause marker does not match this maintenance deployment.');
  }
  const hashText = await text('firebase-hash-config.txt');
  const base = makePlan(await json('auth-backup.json'), await json('firestore-backup.json'), hashText, v.source, v.target);
  const journal = await json('firebase-migration-state.json');
  if (journal.status !== 'verified' || journal.fingerprint !== base.fingerprint || journal.source !== v.source || journal.target !== v.target) throw new Error('Original verified restore journal does not match.');
  const freshData = await json(v['latest-firestore']);
  if (marker && (!Number.isFinite(Date.parse(freshData.exportedAt)) || Date.parse(freshData.exportedAt) < Date.parse(marker.safeAfter) || (await fs.stat(v['latest-auth'])).mtimeMs < Date.parse(marker.safeAfter))) throw new Error('Take fresh final exports AFTER the pause drain deadline.');
  const latest = makePlan(await json(v['latest-auth']), freshData, hashText, v.source, v.target);
  let actual = await loadDestination(latest, targetRequest, v.location);
  const delta = planDelta(base, latest, actual);
  console.log('Accounts to copy/update: ' + delta.users.length);
  console.log('Documents to create: ' + delta.creates + '; documents to update: ' + delta.updates);
  if (v.plan) { console.log('PLAN READY. No cloud data changed. Source rule-inspection permission verified.'); return; }
  const fingerprint = digest({ base: base.fingerprint, latest: latest.fingerprint, marker });
  let state;
  try { state = await json('firebase-cutover-state.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (state && state.fingerprint !== fingerprint) throw new Error('Cutover inputs changed. Keep the previous journal and review before proceeding.');
  if (!state) {
    const suffix = crypto.randomUUID();
    await fs.writeFile('firebase-target-before-cutover-' + suffix + '.json', JSON.stringify(actual), { flag: 'wx', mode: 0o600 });
    state = { fingerprint, status: 'running', source: v.source, target: v.target };
    await fs.writeFile('firebase-cutover-state.json', JSON.stringify(state), { flag: 'wx', mode: 0o600 });
  }
  await confirmPause(v.source, await json('firebase-source-web-config.json'), await sourceRules(v.source, sourceRequest), await text('firestore.migration-freeze.rules'));
  await writeDelta(latest, delta, targetRequest, console.log);
  actual = await loadDestination(latest, targetRequest, v.location);
  if (planDelta(base, latest, actual).documents.length) throw new Error('Document verification incomplete; rerun with the SAME final exports.');
  const users = new Map(actual.users.map(x => [x.localId, x]));
  if (users.size !== latest.users.length || latest.users.some(x => !users.has(x.localId) || !same(identity(users.get(x.localId), x), identity(x, x)))) throw new Error('Account identity verification incomplete.');
  state.status = 'verified'; state.verifiedAt = new Date().toISOString();
  await fs.writeFile('firebase-cutover-state.json', JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
  console.log('FINAL COPY VERIFIED: ' + actual.users.length + ' users; ' + actual.documents.length + ' documents. Keep maintenance enabled until Vercel cutover is checked.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
