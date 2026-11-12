import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const key = new Uint8Array(65).fill(4), vapidKey = Buffer.from(key).toString('base64url');
function browser(meta, optIn = true, optOutDuringSubscribe = false, switchUserDuringSubscribe = false) {
  const data = new Map([['push_meta', JSON.stringify(meta)]]); if (optIn) data.set('push_on', '1');
  const calls = [], counts = { prompts: 0, tokens: 0, unsubscribes: 0 };
  let userId = 'same-uid', switched = false;
  let subscription = { options: { applicationServerKey: new Uint8Array(65).fill(3).buffer }, unsubscribe: async () => { counts.unsubscribes++; subscription = null; return true; } };
  const reg = { pushManager: { getSubscription: async () => subscription } };
  const options = { projectId: 'target-project', appId: 'target-app' };
  const messaging = () => ({ getToken: async () => { counts.tokens++; subscription = { options: { applicationServerKey: key.buffer } }; return 'new-token'; } });
  messaging.isSupported = () => true;
  const Notification = { permission: 'granted', requestPermission: async () => { counts.prompts++; return 'granted'; } };
  const window = { UNEC: {}, PushManager: function () {}, Notification };
  const context = vm.createContext({ window, Notification, atob, Uint8Array, console: { warn() {} },
    firebase: { apps: [{ options }], app: () => ({ options }), messaging },
    getCurrentUser: () => { const uid = userId; return { uid, getIdToken: async () => uid + '-token' }; },
    navigator: { userAgent: 'test', platform: '', serviceWorker: { register: async () => reg, ready: Promise.resolve(reg) } },
    document: { readyState: 'loading', addEventListener() {}, querySelectorAll: () => [] },
    localStorage: { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) },
    fetch: async (url, init) => {
      const payload = init ? JSON.parse(init.body) : null; calls.push(payload);
      if (payload?.action === 'subscribe' && optOutDuringSubscribe) data.delete('push_on');
      if (payload?.action === 'subscribe' && switchUserDuringSubscribe && !switched) {
        switched = true; userId = 'other-uid'; void window.UNEC.push.sync();
      }
      return { ok: true, json: async () => payload ? { ok: true } : { enabled: true, vapidKey } };
    }
  });
  vm.runInContext(fs.readFileSync(new URL('../scripts/push.js', import.meta.url), 'utf8'), context);
  return { push: window.UNEC.push, data, calls, counts };
}
const legacy = () => ({ token: 'old-token', uid: 'same-uid', lang: 'az', ts: Date.now() });
test('a fresh legacy push token rotates to the new project despite the same UID, without prompting again', async () => {
  const b = browser(legacy()); await b.push.sync();
  const meta = JSON.parse(b.data.get('push_meta'));
  assert.equal(b.counts.tokens, 1); assert.equal(b.counts.unsubscribes, 1); assert.equal(b.counts.prompts, 0);
  assert.equal(meta.token, 'new-token'); assert.equal(meta.projectId, 'target-project'); assert.equal(meta.appId, 'target-app');
  assert.deepEqual(b.calls.filter(x => x?.action === 'unsubscribe'), [{ action: 'unsubscribe', token: 'old-token' }]);
});
test('current project tokens stay fresh, and opted-out users are never subscribed automatically', async () => {
  const b = browser({ ...legacy(), projectId: 'target-project', appId: 'target-app' }); await b.push.sync();
  assert.equal(b.calls.length, 0);
  const off = browser(legacy(), false); await off.push.sync(); assert.equal(off.calls.length, 0); assert.equal(off.counts.prompts, 0);
});
test('a concurrent opt-out cleans up an in-flight subscription instead of re-enabling delivery', async () => {
  const b = browser(legacy(), true, true); await b.push.sync();
  assert.equal(b.data.get('push_on'), undefined);
  assert.ok(b.calls.some(x => x?.action === 'unsubscribe' && x.token === 'new-token'));
  assert.equal(JSON.parse(b.data.get('push_meta')).token, 'old-token');
});
test('an account change during token rotation is queued and ultimately relinks to the latest user', async () => {
  const b = browser(legacy(), true, false, true); await b.push.sync();
  assert.equal(JSON.parse(b.data.get('push_meta')).uid, 'other-uid');
  assert.deepEqual(b.calls.filter(x => x?.action === 'subscribe').map(x => x.idToken), ['same-uid-token', 'other-uid-token']);
});
