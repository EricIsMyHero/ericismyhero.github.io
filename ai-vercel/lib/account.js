// User-initiated export and resumable deletion. Job state and paths never come from the browser.
import * as firestore from './firestore.js';
import { verifyIdToken } from './payments.js';
import { r2Delete } from './r2.js';
import { usagePath } from './ai.js';

const deleted = 'Deleted account';
const initialTasks = uid => [
  ...['material_requests', 'subject_chats', 'pdf_ratings', 'push_tokens', 'push_log', 'donations', 'premium_codes'].map(path => ({ type: 'scan', path })),
  { type: 'scan', path: 'analytics/pdf_opens/events' },
  { type: 'scan', path: 'analytics/teacher_ratings/reviews' },
  { type: 'delete', path: usagePath(uid) }, { type: 'tree', path: `users/${uid}` },
];

export function recentLogin(token, uid, now = Date.now()) {
  // Only call AFTER Firebase has verified this same token.
  try {
    const c = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return c.sub === uid && Number.isFinite(c.auth_time) && now / 1000 - c.auth_time >= -60 && now / 1000 - c.auth_time < 300;
  } catch (_) { return false; }
}

export async function exportProfile(uid, db = firestore, env = process.env) {
  const records = [], pending = [`users/${uid}`];
  while (pending.length) {
    const path = pending.pop(), doc = await db.getDoc(path, env);
    if (doc) records.push({ path, data: doc.data });
    if (records.length > 10000) throw new Error('export_too_large');
    for (const col of await db.listCollections(path, env)) {
      let pageToken;
      do {
        const page = await db.listDocs(path + '/' + col, { pageSize: 100, pageToken, showMissing: true }, env);
        pending.push(...page.docs.map(d => d.path)); pageToken = page.nextPageToken;
      } while (pageToken);
    }
  }
  return records;
}

// Each step is idempotent. The persisted queue can replay after a timeout without deleting other users' content.
export async function deletionStep(task, uid, db = firestore, removeFile = r2Delete, env = process.env) {
  const { type, path } = task;
  if (type === 'delete') { await db.deleteDoc(path, env); return []; }
  if (type === 'tree') {
    const cols = await db.listCollections(path, env);
    return [...cols.map(col => ({ type: 'scan', path: path + '/' + col, mode: 'tree' })), { type: 'delete', path }];
  }
  if (type === 'scan') {
    const page = await db.listDocs(path, { pageSize: 30, pageToken: task.pageToken, showMissing: true }, env);
    const tasks = page.docs.map(d => ({ type: task.mode === 'tree' ? 'tree' : 'record', path: d.path }));
    if (page.nextPageToken) tasks.push({ ...task, pageToken: page.nextPageToken });
    return tasks;
  }
  const doc = await db.getDoc(path, env), d = doc?.data || {};
  const collection = path.split('/')[0];
  if (collection === 'subject_chats' && path.split('/').length === 2) return [{ type: 'scan', path: path + '/messages' }];
  if (collection === 'pdf_ratings') {
    const vote = await db.getDoc(path + '/votes/' + uid, env);
    if (vote) await db.anonymizeVote(vote, env);
    return [];
  }
  if (collection === 'material_requests' && path.split('/').length === 2) {
    const patch = {};
    if (d.uid === uid) Object.assign(patch, { uid: null, name: deleted, text: '[Deleted]', status: 'closed' });
    if (d.lastMessageBy === uid) patch.lastMessageBy = null;
    if (Array.isArray(d.upvoterIds) && d.upvoterIds.includes(uid)) patch.upvoterIds = d.upvoterIds.filter(id => id !== uid);
    if (doc && Object.keys(patch).length) await db.patchDoc(path, patch, { ifUpdateTime: doc.updateTime }, env);
    return [{ type: 'scan', path: path + '/messages' }];
  }
  if (!doc) return [];
  if ((collection === 'material_requests' || collection === 'subject_chats') && d.uid === uid) {
    for (const a of d.attachments || []) {
      // Never allow a stored attachment to delete another user's objects.
      if (typeof a.key === 'string' && a.key.startsWith(`request-files/${path.split('/')[1]}/${uid}/`)) await removeFile(a.key, env);
    }
    await db.patchDoc(path, { uid: null, name: deleted, text: '[Deleted]', attachments: [] }, { ifUpdateTime: doc.updateTime }, env);
  } else if (collection === 'push_log' && (d.fromUid === uid || d.toUid === uid)) {
    await db.deleteDoc(path, env);
  } else if (collection === 'premium_codes' && d.redeemedByUid === uid) {
    await db.patchDoc(path, { redeemedByUid: null }, { ifUpdateTime: doc.updateTime }, env);
  } else if (d.uid === uid && collection === 'donations') {
    const supporter = await db.getDoc('supporters/' + doc.id, env);
    if (supporter) await db.patchDoc(supporter.path, { name: null, anonymous: true }, {}, env);
    await db.patchDoc(path, { uid: null, name: null, email: null }, { ifUpdateTime: doc.updateTime }, env);
  } else if (d.uid === uid) await db.deleteDoc(path, env);
  return [];
}

export async function accountAction(action, b, env = process.env, services = {}) {
  const db = services.db || firestore;
  const user = await (services.verify || verifyIdToken)(b.idToken, env);
  if (!user) return { status: 401, json: { error: 'login_required' } };
  const path = 'account_deletions/' + user.uid;
  try {
    if (action === 'account-export') return { status: 200, json: {
      schemaVersion: 1, exportedAt: new Date().toISOString(),
      account: user, scope: 'Account profile and private study records; public discussions are not included.',
      records: await exportProfile(user.uid, db, env),
    } };
    if (b.confirm !== 'DELETE') return { status: 400, json: { error: 'confirmation_required' } };
    if (!recentLogin(b.idToken, user.uid)) return { status: 403, json: { error: 'recent_login_required' } };
    let job = await db.getDoc(path, env);
    if (!job) {
      try { job = await db.createDoc('account_deletions', user.uid, { tasks: initialTasks(user.uid), processed: 0, leaseUntil: null, startedAt: new Date() }, env); }
      catch (e) { if (e.code !== 'exists') throw e; job = await db.getDoc(path, env); }
    }
    if (Date.parse(job.data.leaseUntil) > Date.now()) return { status: 409, json: { error: 'deletion_busy' } };
    job = await db.patchDoc(path, { leaseUntil: new Date(Date.now() + 45000).toISOString() }, { ifUpdateTime: job.updateTime }, env);
    const tasks = job.data.tasks || [], deadline = Date.now() + 6000; let processed = job.data.processed || 0;
    try {
      do {
        if (!tasks.length) break;
        const next = await deletionStep(tasks[0], user.uid, db, services.removeFile || r2Delete, env);
        tasks.shift(); tasks.unshift(...next); processed++;
        // Checkpoint every step: interrupted batches safely resume on the next call.
        job = await db.patchDoc(path, { tasks, processed }, { ifUpdateTime: job.updateTime }, env);
      } while (Date.now() < deadline);
    } finally {
      await db.patchDoc(path, { leaseUntil: null }, { ifUpdateTime: job.updateTime }, env);
    }
    if (tasks.length) return { status: 200, json: { ok: true, more: true, processed } };
    // A retry after signing in may recreate the profile in the existing client.
    if (await db.getDoc(`users/${user.uid}`, env)) {
      await db.patchDoc(path, { tasks: [{ type: 'tree', path: `users/${user.uid}` }] }, {}, env);
      return { status: 200, json: { ok: true, more: true, processed } };
    }
    const response = await (services.deleteAuth || fetch)(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: b.idToken }),
    });
    if (!response.ok) {
      const info = await response.json().catch(() => ({}));
      return { status: 403, json: { error: info.error?.message === 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN' ? 'recent_login_required' : 'auth_delete_failed' } };
    }
    await db.deleteDoc(path, env).catch(() => {});
    return { status: 200, json: { ok: true, more: false, processed } };
  } catch (e) {
    console.error('[account]', e.message);
    return { status: e.code === 'conflict' ? 409 : 503, json: { error: e.code === 'conflict' ? 'deletion_busy' : 'account_service_unavailable' } };
  }
}
