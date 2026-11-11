import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { STUDY_KEYS, studyAction, mergeStudyValue } from '../ai-vercel/lib/study.js';
import push from '../ai-vercel/api/push.js';

const empty = () => Object.fromEntries(STUDY_KEYS.map(key => [key, []]));
const copy = value => JSON.parse(JSON.stringify(value));
function memoryDb() {
  const docs = new Map(); let revision = 0;
  const conflict = code => { const error = new Error(code); error.code = code; throw error; };
  return { docs,
    async getDoc(path) { return docs.has(path) ? copy(docs.get(path)) : null; },
    async createDoc(collection, id, data) {
      const path = collection + '/' + id;
      if (docs.has(path)) conflict('exists');
      const doc = { path, data: copy(data), updateTime: String(++revision) }; docs.set(path, doc); return copy(doc);
    },
    async patchDoc(path, data, options) {
      const doc = docs.get(path); if (doc?.updateTime !== options.ifUpdateTime) conflict('conflict');
      const next = { path, data: copy(data), updateTime: String(++revision) }; docs.set(path, next); return copy(next);
    }
  };
}
const services = db => ({ db, verify: async token => token === 'alice' || token === 'bob' ? { uid: token } : null });
const favoriteChange = (base, value) => ({ key: 'favorites', base, value });

test('the deployed API router keeps study data private and its responses out of caches', async () => {
  for (const action of ['study-load', 'study-save']) {
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await push({ method: 'POST', headers: {}, body: { action, uid: 'someone-else' } }, res);
    assert.equal(res.code, 401); assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});

test('study service authenticates, derives the owner and rejects non-study fields', async () => {
  const db = memoryDb();
  assert.equal((await studyAction('study-load', {}, {}, services(db))).status, 401);
  assert.equal((await studyAction('study-save', { idToken: 'alice', changes: [{ key: 'premiumLifetime', base: [], value: [] }] }, {}, services(db))).status, 400);
  const result = await studyAction('study-save', { idToken: 'alice', uid: 'bob', changes: [favoriteChange([], ['pdf/a.pdf'])] }, {}, services(db));
  assert.equal(result.status, 200);
  assert.ok(db.docs.has('users/alice/study_data/main'));
  assert.ok(!db.docs.has('users/bob/study_data/main'));
  const bob = await studyAction('study-load', { idToken: 'bob' }, {}, services(db));
  assert.deepEqual(bob.json.values.favorites, []);
  await db.createDoc('account_deletions', 'alice', { tasks: [] });
  assert.equal((await studyAction('study-save', { idToken: 'alice', changes: [favoriteChange([], [])] }, {}, services(db))).status, 409);
});

test('parallel device saves retain additions and old devices do not restore removed favorites', async () => {
  const db = memoryDb();
  const results = await Promise.all(['a', 'b'].map(name => studyAction('study-save', { idToken: 'alice', changes: [favoriteChange([], ['pdf/' + name + '.pdf'])] }, {}, services(db))));
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  let current = (await studyAction('study-load', { idToken: 'alice' }, {}, services(db))).json.values.favorites;
  assert.deepEqual([...current].sort(), ['pdf/a.pdf', 'pdf/b.pdf']);
  await studyAction('study-save', { idToken: 'alice', changes: [favoriteChange(current, ['pdf/b.pdf'])] }, {}, services(db));
  const stale = await studyAction('study-save', { idToken: 'alice', changes: [favoriteChange(['pdf/a.pdf', 'pdf/b.pdf'], ['pdf/a.pdf', 'pdf/b.pdf', 'pdf/c.pdf'])] }, {}, services(db));
  assert.deepEqual([...stale.json.values.favorites].sort(), ['pdf/b.pdf', 'pdf/c.pdf']);
});

test('row merging preserves independent edits and deleted rows; history remains bounded', () => {
  const base = [{ id: 1, name: 'ICT', credit: 6, score: 70 }];
  assert.deepEqual(mergeStudyValue('unec_gpa_subjects', [{ ...base[0], name: 'New name' }], base, [{ ...base[0], score: 90 }]), [{ id: 1, name: 'New name', credit: 6, score: 90 }]);
  assert.deepEqual(mergeStudyValue('unec_gpa_subjects', [], base, [{ ...base[0], score: 90 }]), []);
  const history = Array.from({ length: 20 }, (_, ts) => ({ ts, label: '1/1', gpa: '80.00' }));
  const merged = mergeStudyValue('unec_gpa_history', history, [], [{ ts: 21, label: '1/1', gpa: '90.00' }]);
  assert.equal(merged.length, 20); assert.equal(merged[0].ts, 1); assert.equal(merged.at(-1).ts, 21);
});

test('invalid grades, duplicate IDs, impossible dates and oversized payloads are rejected', async () => {
  const db = memoryDb();
  for (const change of [
    { key: 'unec_gpa_subjects', base: [], value: [{ id: 1, name: '', credit: 6, score: 101 }] },
    { key: 'exam_countdowns', base: [], value: [{ id: 1, name: 'Test', date: '2026-02-30' }] },
    { key: 'unec_gpa_subjects', base: [], value: Array(2).fill({ id: 1, name: '', credit: 6, score: 80 }) },
    favoriteChange([], Array(501).fill('pdf/a.pdf')),
  ]) assert.equal((await studyAction('study-save', { idToken: 'alice', changes: [change] }, {}, services(db))).status, 400);
  assert.equal(db.docs.size, 0);
});

function device(db, initial = {}) {
  const local = initial instanceof Map ? initial : new Map(Object.entries(initial));
  const window = new EventTarget(), document = new EventTarget(); document.hidden = false;
  const navigator = { onLine: true };
  class CustomEvent extends Event { constructor(type, options) { super(type); this.detail = options?.detail; } }
  let transport = async (url, options) => {
    const body = JSON.parse(options.body), result = await studyAction(body.action, body, {}, services(db));
    return { ok: result.status < 400, json: async () => copy(result.json) };
  };
  const context = vm.createContext({ window, document, navigator, CustomEvent, AbortController, console,
    localStorage: { getItem: key => local.get(key) ?? null, setItem: (key, value) => local.set(key, value), removeItem: key => local.delete(key) },
    setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1,
    fetch: (...args) => transport(...args)
  });
  vm.runInContext(fs.readFileSync(new URL('../scripts/study-data.js', import.meta.url), 'utf8'), context);
  const store = window.UNECStudy;
  return { store, local, navigator,
    login: uid => store.setUser({ uid, getIdToken: async () => uid }),
    set: (key, value) => store.setItem(key, JSON.stringify(value)),
    get: key => JSON.parse(store.getItem(key)),
    storageEvent() { const event = new Event('storage'); event.key = 'unec_study_v1:alice'; window.dispatchEvent(event); },
    transport: fn => { const previous = transport; transport = (...args) => fn(previous, ...args); }
  };
}

test('browser migration is claimed once; sign-out and a different account expose no previous records', async () => {
  const db = memoryDb(), d = device(db, { favorites: '["pdf/legacy.pdf"]' });
  assert.deepEqual(d.get('favorites'), ['pdf/legacy.pdf']);
  d.login('alice'); await d.store.sync();
  assert.deepEqual(d.get('favorites'), ['pdf/legacy.pdf']);
  d.store.setUser(null); assert.deepEqual(d.get('favorites'), []);
  d.login('bob'); await d.store.sync(); assert.deepEqual(d.get('favorites'), []);
  d.login('alice'); await d.store.sync(); assert.deepEqual(d.get('favorites'), ['pdf/legacy.pdf']);
  assert.ok(!d.local.has('favorites'));
});

test('offline edits survive reload and reach the second device; stale edits preserve cloud additions', async () => {
  const db = memoryDb(), first = device(db), second = device(db);
  first.login('alice'); await first.store.sync();
  second.login('alice'); await second.store.sync();
  first.navigator.onLine = false; first.set('favorites', ['pdf/offline.pdf']); await first.store.sync();
  assert.equal(first.store.getStatus(), 'pending');
  second.set('favorites', ['pdf/online.pdf']); await second.store.sync();
  const reloaded = device(db, Object.fromEntries(first.local)); reloaded.login('alice'); await reloaded.store.sync();
  assert.deepEqual(reloaded.get('favorites').sort(), ['pdf/offline.pdf', 'pdf/online.pdf']);
  await second.store.sync(); assert.deepEqual(second.get('favorites').sort(), ['pdf/offline.pdf', 'pdf/online.pdf']);
});

test('an edit made during a save remains pending, then syncs without losing a remote favorite', async () => {
  const db = memoryDb(), d = device(db); d.login('alice'); await d.store.sync();
  await studyAction('study-save', { idToken: 'alice', changes: [favoriteChange([], ['pdf/remote.pdf'])] }, {}, services(db));
  let release, entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  let first = true;
  d.transport(async (previous, ...args) => { if (first) { first = false; entered(); await wait; } return previous(...args); });
  d.set('favorites', ['pdf/first.pdf']); const saving = d.store.sync(); await ready;
  d.set('favorites', ['pdf/first.pdf', 'pdf/late.pdf']); release(); await saving;
  assert.equal(d.store.getStatus(), 'pending');
  await d.store.sync();
  assert.deepEqual(d.get('favorites').sort(), ['pdf/first.pdf', 'pdf/late.pdf', 'pdf/remote.pdf']);
});

test('two offline browser tabs merge their pending journals rather than overwriting each other', async () => {
  const db = memoryDb(), shared = new Map(), first = device(db, shared), second = device(db, shared);
  first.login('alice'); await first.store.sync(); second.login('alice'); await second.store.sync();
  first.navigator.onLine = false; second.navigator.onLine = false;
  first.set('favorites', ['pdf/first-tab.pdf']); second.set('favorites', ['pdf/second-tab.pdf']);
  first.storageEvent(); second.storageEvent();
  assert.deepEqual(first.get('favorites').sort(), ['pdf/first-tab.pdf', 'pdf/second-tab.pdf']);
  assert.deepEqual(second.get('favorites').sort(), ['pdf/first-tab.pdf', 'pdf/second-tab.pdf']);
  first.navigator.onLine = true; await first.store.sync(); second.storageEvent();
  second.navigator.onLine = true; await second.store.sync();
  assert.deepEqual(second.get('favorites').sort(), ['pdf/first-tab.pdf', 'pdf/second-tab.pdf']);
});

test('an old account response cannot overwrite a newly signed-in account', async () => {
  const db = memoryDb(), d = device(db);
  let release, entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const wait = new Promise(resolve => { release = resolve; });
  let first = true;
  d.transport(async (previous, ...args) => { if (first) { first = false; entered(); await wait; } return previous(...args); });
  d.login('alice'); d.set('favorites', ['pdf/alice.pdf']); const old = d.store.sync(); await ready;
  d.login('bob'); release(); await old;
  assert.deepEqual(d.get('favorites'), []);
  await d.store.sync(); assert.deepEqual(d.get('favorites'), []);
});

test('GPA includes all attempted credits and zero earned credits for failed subjects', () => {
  const context = vm.createContext({ window: { addEventListener() {} }, t: key => key });
  vm.runInContext(fs.readFileSync(new URL('../scripts/gpa.js', import.meta.url), 'utf8'), context);
  assert.equal(context.calculateGPA([{ score: 90, credit: 6 }, { score: 50, credit: 6 }]), '45.00');
  assert.equal(context.calculateGPA([{ score: 90, credit: 3 }, { score: 60, credit: 6 }]), '70.00');
  assert.equal(context.calculateGPA([{ score: 50, credit: 6 }]), '0.00');
  assert.equal(context.calculateGPA([]), '0.00');
  assert.equal(context.calculateGPA([{ score: 100, credit: 6 }, { score: Infinity, credit: 6 }]), '100.00');
});

test('skipping a Pomodoro never awards minutes or badges; finishing a full focus session does', () => {
  const nodes = new Map(), timers = new Map(); let nextId = 0, now = Date.now(), badges = 0;
  const document = { addEventListener() {}, querySelector: () => null, getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { textContent: '', innerHTML: '', style: {}, classList: { add() {}, toggle() {} }, setAttribute() {} });
    return nodes.get(id);
  } };
  class Clock extends Date { static now() { return now; } }
  const window = { addEventListener() {}, UNECStudy: { getItem: () => '[]' } };
  const context = vm.createContext({ window, document, Date: Clock, t: key => key,
    localStorage: { getItem: () => null, setItem() {} }, badgeOnPomodoro: () => badges++,
    setInterval(fn) { timers.set(++nextId, fn); return nextId; }, clearInterval(id) { timers.delete(id); }
  });
  vm.runInContext(fs.readFileSync(new URL('../scripts/timer.js', import.meta.url), 'utf8'), context);
  window.initTimer(); window.pomodoroSkip();
  assert.equal(nodes.get('pstat-done').textContent, 0); assert.equal(nodes.get('pstat-mins').textContent, 0); assert.equal(badges, 0);
  window.pomodoroSkip(); window.pomodoroToggle(); now += 25 * 60 * 1000;
  for (const tick of [...timers.values()]) tick();
  assert.equal(nodes.get('pstat-done').textContent, 1); assert.equal(nodes.get('pstat-mins').textContent, 25); assert.equal(badges, 1);
});
