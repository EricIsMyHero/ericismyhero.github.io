import test from 'node:test';
import assert from 'node:assert/strict';
import { premiumPolicy, reserveAiUsage, refundAiUsage, dayKey } from '../ai-vercel/lib/ai.js';
import { accountAction, deletionStep, exportProfile, recentLogin } from '../ai-vercel/lib/account.js';
import ask from '../ai-vercel/api/ask.js';
import redeem from '../ai-vercel/api/redeem-code.js';
import push from '../ai-vercel/api/push.js';
import { threadsConfig } from '../ai-vercel/lib/threads.js';
import crypto from 'node:crypto';
import { fromFields, toFields, _resetTokenCache } from '../ai-vercel/lib/firestore.js';

test('premium access requires a valid server receipt, with Baku day boundaries', () => {
  const now = new Date('2026-11-06T20:30:00Z');
  assert.equal(dayKey(now), '2026-11-07');
  assert.equal(premiumPolicy([{ data: { premiumLifetime: true } }], now).isPremium, false);
  assert.equal(premiumPolicy([{ data: { status: 'unused', plan: 'lifetime' } }], now).isPremium, false);
  assert.equal(premiumPolicy([{ data: { status: 'used', plan: '7d', redeemedAt: '2026-10-01T00:00:00Z' } }], now).isPremium, false);
  assert.equal(premiumPolicy([{ data: { status: 'used', plan: '7d', redeemedAt: '2026-11-05T00:00:00Z' } }], now).dailyLimit, 12);
  assert.equal(premiumPolicy([{ data: { status: 'used', plan: 'lifetime' } }], now).isPremium, true);
});

function memoryUsage() {
  let doc, version = 0;
  const conflict = code => { const e = new Error(code); e.code = code; throw e; };
  return { get: async () => doc && structuredClone(doc),
    create: async (collection, id, data) => { if (doc) conflict('exists'); doc = { data, updateTime: String(++version) }; },
    patch: async (path, data, opts) => { if (opts.ifUpdateTime !== doc?.updateTime) conflict('conflict'); doc = { data: { ...doc.data, ...data }, updateTime: String(++version) }; }
  };
}
test('concurrent reservations cannot spend the final quota twice; failures can refund it', async () => {
  const store = memoryUsage(), policy = { dailyLimit: 2, charLimit: 250, isPremium: false };
  await reserveAiUsage('uid', policy, {}, store, new Date('2026-11-06T10:00:00Z'));
  const requests = await Promise.all(Array.from({ length: 10 }, () => reserveAiUsage('uid', policy, {}, store, new Date('2026-11-06T10:00:04Z'))));
  assert.equal(requests.filter(r => !r.error).length, 1);
  assert.equal((await store.get()).data.count, 2);
  await refundAiUsage('uid', '2026-11-06', {}, store);
  assert.equal((await store.get()).data.count, 1);
  const tomorrow = await reserveAiUsage('uid', policy, {}, store, new Date('2026-11-07T10:00:04Z'));
  assert.equal(tomorrow.usage.remaining, 1);
});

const response = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(value) { this.value = value; return this; }, end() { return this; } });
test('AI, code redemption and account actions reject missing authentication, while preflight succeeds', async () => {
  for (const handler of [ask, redeem]) {
    const res = response(); await handler({ method: 'POST', headers: {}, body: { uid: 'victim', question: 'hi', code: 'TEST' } }, res);
    assert.equal(res.code, 401);
    const preflight = response(); await handler({ method: 'OPTIONS', headers: {} }, preflight); assert.equal(preflight.code, 204);
  }
  const res = response(); await push({ method: 'POST', headers: {}, body: { action: 'account-delete', confirm: 'DELETE' } }, res); assert.equal(res.code, 401);
});
test('notifications are optional by default and can only be made mandatory explicitly', () => {
  assert.equal(threadsConfig({}).requirePush, false);
});

test('a failed AI provider call refunds the server quota and reports an error instead of a fabricated answer', async () => {
  const previousFetch = globalThis.fetch;
  const saved = { FIREBASE_API_KEY: process.env.FIREBASE_API_KEY, FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT };
  let stored, providerCalls = 0;
  const privateKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
  process.env.FIREBASE_API_KEY = 'test-only';
  process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: 'test-only', client_email: 'test@example.invalid', private_key: privateKey });
  _resetTokenCache();
  const document = () => ({ name: 'projects/test-only/databases/(default)/documents/ai_usage/test', fields: toFields(stored), updateTime: new Date().toISOString() });
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
  globalThis.fetch = async (url, opts = {}) => {
    if (url.includes('accounts:lookup')) return json({ users: [{ localId: 'me' }] });
    if (url.includes('oauth2.googleapis.com')) return json({ access_token: 'test-only-token', expires_in: 3600 });
    if (url.includes(':runQuery')) return json([]);
    if (url.includes('api.groq.com')) { providerCalls++; return json({ error: 'upstream down' }, 503); }
    if (url.includes('firestore.googleapis.com')) {
      if (opts.method === 'POST') { stored = fromFields(JSON.parse(opts.body).fields); return json(document()); }
      if (opts.method === 'PATCH') { stored = { ...stored, ...fromFields(JSON.parse(opts.body).fields) }; return json(document()); }
      return stored ? json(document()) : json({}, 404);
    }
    throw new Error('Unexpected network request: ' + url);
  };
  try {
    const invalid = response(); await ask({ method: 'POST', headers: {}, body: { idToken: 'x'.repeat(30), question: 'x'.repeat(251) } }, invalid);
    assert.equal(invalid.code, 400); assert.equal(providerCalls, 0);
    const res = response(); await ask({ method: 'POST', headers: {}, body: { idToken: 'x'.repeat(30), question: 'Explain this subject', context: 'study notes' } }, res);
    assert.equal(res.code, 502); assert.equal(res.value.error, 'provider_unavailable'); assert.equal(providerCalls, 1); assert.equal(stored.count, 0);
    const usage = response(); await ask({ method: 'POST', headers: {}, body: { idToken: 'x'.repeat(30), action: 'usage' } }, usage);
    assert.equal(usage.value.remaining, 5);
  } finally {
    globalThis.fetch = previousFetch; _resetTokenCache();
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

test('deletion removes only the owner’s message and files, and is retryable', async () => {
  const owned = { path: 'material_requests/r/messages/a', updateTime: '1', data: { uid: 'me', text: 'private', attachments: [{ key: 'request-files/r/me/a.pdf' }, { key: 'request-files/r/other/b.pdf' }] } };
  const writes = [], removed = [];
  const db = { getDoc: async () => owned, patchDoc: async (path, data) => { writes.push({ path, data }); owned.data = { ...owned.data, ...data }; } };
  await deletionStep({ type: 'record', path: owned.path }, 'me', db, async key => removed.push(key), {});
  assert.deepEqual(removed, ['request-files/r/me/a.pdf']);
  assert.equal(writes[0].data.uid, null); assert.equal(writes[0].data.text, '[Deleted]');
  await deletionStep({ type: 'record', path: owned.path }, 'me', db, async key => removed.push(key), {});
  assert.equal(writes.length, 1);
  owned.data = { uid: 'other', text: 'keep' };
  await deletionStep({ type: 'record', path: owned.path }, 'me', db, async key => removed.push(key), {});
  assert.equal(writes.length, 1);
});
test('deleting a request author keeps the thread and other participants', async () => {
  let patch;
  const db = { getDoc: async () => ({ data: { uid: 'me', upvoterIds: ['me', 'other'] }, updateTime: '1' }), patchDoc: async (path, data) => { patch = data; } };
  const next = await deletionStep({ type: 'record', path: 'material_requests/r' }, 'me', db);
  assert.deepEqual(patch.upvoterIds, ['other']); assert.equal(patch.uid, null);
  assert.deepEqual(next, [{ type: 'scan', path: 'material_requests/r/messages' }]);
});
test('missing parent documents still have their subcollections processed', async () => {
  const task = { type: 'record', path: 'subject_chats/missing-parent' };
  assert.deepEqual(await deletionStep(task, 'me', { getDoc: async () => null }), [{ type: 'scan', path: task.path + '/messages' }]);
  const scans = await deletionStep({ type: 'tree', path: 'users/me' }, 'me', { listCollections: async () => ['progress', 'quiz_results'] });
  assert.equal(scans.at(-1).type, 'delete');
});
test('export traverses only the authenticated user subtree, and deletion requires a recent login', async () => {
  const db = { getDoc: async path => ({ data: { own: path } }), listCollections: async path => path === 'users/me' ? ['progress'] : [], listDocs: async () => ({ docs: [{ path: 'users/me/progress/main' }] }) };
  const records = await exportProfile('me', db);
  assert.deepEqual(records.map(r => r.path).sort(), ['users/me', 'users/me/progress/main']);
  const now = Date.now(), token = claims => 'a.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.b';
  assert.equal(recentLogin(token({ sub: 'me', auth_time: Math.floor(now / 1000) }), 'me', now), true);
  assert.equal(recentLogin(token({ sub: 'other', auth_time: Math.floor(now / 1000) }), 'me', now), false);
  assert.equal(recentLogin(token({ sub: 'me', auth_time: now / 1000 - 301 }), 'me', now), false);
});

test('interrupted account deletion resumes, preserves other users, and deletes authentication last', async () => {
  const docs = new Map(Object.entries({
    'users/me': { name: 'Me' }, 'users/me/progress/main': { xp: 100 }, 'users/other': { name: 'Other' },
    'subject_chats/no-parent/messages/own': { uid: 'me', text: 'remove' },
    'subject_chats/no-parent/messages/theirs': { uid: 'other', text: 'keep' },
    'material_requests/r': { uid: 'me', name: 'Me', text: 'request', status: 'open', upvoterIds: ['me', 'other'] },
    'material_requests/r/messages/mine': { uid: 'me', text: 'remove', attachments: [{ key: 'request-files/r/me/test.pdf' }] },
    'material_requests/r/messages/theirs': { uid: 'other', text: 'keep' },
    'push_tokens/device': { uid: 'me' }, 'push_tokens/other-device': { uid: 'other' },
    'premium_codes/CODE': { status: 'used', redeemedByUid: 'me', plan: 'lifetime' },
    'donations/payment': { uid: 'me', name: 'Me', amount: 100 }, 'supporters/payment': { name: 'Me', amount: 100 },
    'pdf_ratings/rating': { count: 1, sum: 5, avg: 5 }, 'pdf_ratings/rating/votes/me': { stars: 5 },
    'analytics/pdf_opens/events/event': { uid: 'me' },
  }).map(([path, data]) => [path, { path, id: path.split('/').at(-1), data, updateTime: '0' }]));
  let version = 0, authDeleted = false, storageFailed = false;
  const db = {
    getDoc: async path => docs.has(path) ? structuredClone(docs.get(path)) : null,
    createDoc: async (col, id, data) => { const path = col + '/' + id; docs.set(path, { path, id, data: structuredClone(data), updateTime: String(++version) }); return structuredClone(docs.get(path)); },
    patchDoc: async (path, data, opts = {}) => {
      const previous = docs.get(path); assert.ok(previous, path);
      if (opts.ifUpdateTime) assert.equal(opts.ifUpdateTime, previous.updateTime);
      docs.set(path, { ...previous, data: { ...previous.data, ...structuredClone(data) }, updateTime: String(++version) }); return structuredClone(docs.get(path));
    },
    deleteDoc: async path => docs.delete(path),
    listCollections: async path => [...new Set([...docs.keys()].filter(key => key.startsWith(path + '/')).map(key => key.slice(path.length + 1).split('/')[0]))],
    listDocs: async (col, opts) => {
      assert.equal(opts.showMissing, true);
      const paths = [...new Set([...docs.keys()].filter(key => key.startsWith(col + '/')).map(key => col + '/' + key.slice(col.length + 1).split('/')[0]))].sort();
      return { docs: paths.map(path => structuredClone(docs.get(path) || { path, id: path.split('/').at(-1), data: {} })) };
    },
    anonymizeVote: async doc => { docs.delete(doc.path); docs.set('pdf_ratings/rating/votes/deleted-anonymous', { data: { stars: doc.data.stars } }); },
  };
  const idToken = 'a.' + Buffer.from(JSON.stringify({ sub: 'me', auth_time: Math.floor(Date.now() / 1000) })).toString('base64url') + '.b';
  const services = { db, verify: async () => ({ uid: 'me' }), removeFile: async () => { if (!storageFailed) { storageFailed = true; throw new Error('test storage outage'); } }, deleteAuth: async () => {
    assert.equal([...docs.keys()].some(path => path === 'users/me' || path.startsWith('users/me/')), false);
    assert.equal(docs.get('subject_chats/no-parent/messages/own').data.uid, null);
    authDeleted = true; return new Response('{}');
  } };
  const first = await accountAction('account-delete', { idToken, confirm: 'DELETE' }, {}, services);
  assert.equal(first.status, 503); assert.equal(authDeleted, false); assert.ok(docs.has('account_deletions/me'));
  let result;
  do { result = await accountAction('account-delete', { idToken, confirm: 'DELETE' }, {}, services); assert.equal(result.status, 200); } while (result.json.more);
  assert.equal(authDeleted, true); assert.equal(docs.has('account_deletions/me'), false);
  assert.equal(docs.get('users/other').data.name, 'Other');
  assert.equal(docs.get('subject_chats/no-parent/messages/theirs').data.text, 'keep');
  assert.equal(docs.get('material_requests/r/messages/theirs').data.text, 'keep');
  assert.equal(docs.get('material_requests/r').data.status, 'closed');
  assert.equal(docs.get('premium_codes/CODE').data.redeemedByUid, null); assert.equal(docs.get('premium_codes/CODE').data.status, 'used');
  assert.equal(docs.get('supporters/payment').data.name, null); assert.equal(docs.get('donations/payment').data.uid, null);
  assert.equal(docs.get('pdf_ratings/rating').data.avg, 5); assert.equal(docs.has('pdf_ratings/rating/votes/me'), false);
  assert.equal(docs.has('push_tokens/device'), false); assert.equal(docs.has('push_tokens/other-device'), true);
});
