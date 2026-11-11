// Private study records. UID always comes from the verified Firebase token.
import { verifyIdToken } from './payments.js';
import * as firestore from './firestore.js';

export const STUDY_KEYS = ['favorites', 'unec_compass_saved', 'unec_gpa_subjects', 'unec_gpa_history', 'exam_countdowns'];
const sets = new Set(['favorites', 'unec_compass_saved']);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const invalid = () => { throw new Error('invalid_study_data'); };
const text = (v, max) => typeof v === 'string' && v.length <= max;
const id = v => Number.isSafeInteger(v) && v >= 0;

export function validateStudyValue(key, value) {
  if (!STUDY_KEYS.includes(key) || !Array.isArray(value) || value.length > (key === 'unec_gpa_history' ? 20 : 500)) return invalid();
  if (sets.has(key)) {
    if (!value.every(v => text(v, 512) && (key !== 'favorites' || /^(pdf|pdf-extra)\/[^\u0000-\u001f]+$/.test(v)))) return invalid();
    return [...new Set(value)];
  }
  const seen = new Set();
  return value.map(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return invalid();
    if (key === 'unec_gpa_history') {
      if (!id(row.ts) || !text(row.label, 32) || !Number.isFinite(Number(row.gpa)) || Number(row.gpa) < 0 || Number(row.gpa) > 100 || seen.has(row.ts)) return invalid();
      seen.add(row.ts);
      return { gpa: Number(row.gpa).toFixed(2), label: row.label, ts: row.ts };
    }
    if (!id(row.id) || seen.has(row.id) || !text(row.name, 200)) return invalid();
    seen.add(row.id);
    if (key === 'unec_gpa_subjects') {
      if (!Number.isFinite(Number(row.credit)) || Number(row.credit) < 1 || Number(row.credit) > 60 || !Number.isFinite(Number(row.score)) || Number(row.score) < 0 || Number(row.score) > 100) return invalid();
      return { id: row.id, name: row.name, credit: Number(row.credit), score: Number(row.score) };
    }
    if (!text(row.date, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(Date.parse(row.date)) || new Date(row.date).toISOString().slice(0, 10) !== row.date) return invalid();
    return { id: row.id, name: row.name, date: row.date };
  });
}

// Apply only changes made since this device's base. Another device's additions
// and edits to different fields survive; an old device cannot resurrect a deleted row.
export function mergeStudyValue(key, latest, base, value) {
  if (sets.has(key)) {
    const removed = new Set(base.filter(v => !value.includes(v)));
    return [...new Set([...latest.filter(v => !removed.has(v)), ...value.filter(v => !base.includes(v))])];
  }
  if (key === 'unec_gpa_history') {
    return [...new Map([...latest, ...value].map(row => [row.ts, row])).values()].sort((a, b) => a.ts - b.ts).slice(-20);
  }
  const before = new Map(base.map(row => [row.id, row]));
  const after = new Map(value.map(row => [row.id, row]));
  const merged = new Map(latest.filter(row => !before.has(row.id) || after.has(row.id)).map(row => [row.id, { ...row }]));
  for (const row of value) {
    const old = before.get(row.id);
    if (!old) merged.set(row.id, { ...row });
    else if (merged.has(row.id)) {
      const target = merged.get(row.id);
      for (const field of Object.keys(row)) if (!same(old[field], row[field])) target[field] = row[field];
    }
  }
  return [...merged.values()];
}

export async function studyAction(action, body, env = process.env, services = {}) {
  const user = await (services.verify || verifyIdToken)(body.idToken, env);
  if (!user) return { status: 401, json: { error: 'login_required' } };
  const db = services.db || firestore;
  const path = `users/${user.uid}/study_data/main`;
  let changes = [];
  try {
    if (action === 'study-save') {
      if (JSON.stringify(body.changes).length > 150000 || !Array.isArray(body.changes) || !body.changes.length || body.changes.length > STUDY_KEYS.length) return { status: 400, json: { error: 'invalid_study_data' } };
      const seen = new Set();
      changes = body.changes.map(change => {
        if (!change || seen.has(change.key)) return invalid();
        seen.add(change.key);
        return { key: change.key, base: validateStudyValue(change.key, change.base), value: validateStudyValue(change.key, change.value) };
      });
    } else if (action !== 'study-load') return { status: 400, json: { error: 'invalid_action' } };
  } catch (_) { return { status: 400, json: { error: 'invalid_study_data' } }; }

  if (await db.getDoc('account_deletions/' + user.uid, env)) return { status: 409, json: { error: 'account_deleting' } };
  for (let attempt = 0; attempt < 5; attempt++) {
    const doc = await db.getDoc(path, env);
    const values = Object.fromEntries(STUDY_KEYS.map(key => [key, doc?.data?.values?.[key] || []]));
    if (action === 'study-load') return { status: 200, json: { values } };
    for (const change of changes) values[change.key] = validateStudyValue(change.key, mergeStudyValue(change.key, values[change.key], change.base, change.value));
    const record = { values, updatedAt: new Date().toISOString() };
    try {
      if (doc) await db.patchDoc(path, record, { ifUpdateTime: doc.updateTime }, env);
      else await db.createDoc(`users/${user.uid}/study_data`, 'main', record, env);
      return { status: 200, json: { values } };
    } catch (error) {
      if (!['exists', 'conflict'].includes(error.code)) throw error;
    }
  }
  return { status: 409, json: { error: 'study_busy' } };
}
