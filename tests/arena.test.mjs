import test from 'node:test';
import assert from 'node:assert/strict';
import { arenaAction, arenaPaths } from '../ai-vercel/lib/arena.js';

function fixture() {
  const records = new Map();
  let version = 0, now = new Date('2026-11-27T19:59:00Z');
  const fail = code => { throw Object.assign(new Error(code), { code }); };
  const store = (path, data) => records.set(path, { path, data, updateTime: String(++version) });
  const db = {
    getDoc: async path => structuredClone(records.get(path)),
    createDoc: async (collection, id, data) => {
      const path = collection + '/' + id;
      if (records.has(path)) fail('exists');
      store(path, data);
    },
    patchDoc: async (path, data, { ifUpdateTime }) => {
      if (records.get(path)?.updateTime !== ifUpdateTime) fail('conflict');
      store(path, data);
    },
    deleteDoc: async path => records.delete(path),
    runQuery: async (query, env, parent) => [...records.values()]
      .filter(row => row.path.startsWith(parent + '/scores/'))
      .filter(row => row.data.rank >= Number(query.where?.fieldFilter.value.integerValue ?? 0))
      .sort((a, b) => b.data.rank - a.data.rank).slice(0, query.limit)
  };
  const users = {
    a: { uid: 'owner-1', email: 'aysu@example.test' },
    b: { uid: 'owner-2', email: 'elvin@example.test' }
  };
  const call = value => arenaAction(value, {}, { db, now: () => now, verify: async token => users[token] });
  const ring = (score, won = false) => ({ board: 'ring-escape--easy', score, won });
  return {
    records, store, ring, setTime: time => { now = new Date(time); },
    read: (board, idToken) => call({ action: 'arena-list', board, idToken }),
    submit: (idToken, results) => call({
      action: 'arena-submit', idToken, results, uid: 'impersonated', email: 'forged@example.test',
      player: 'Fake', gender: 'female', look: {
        head: 'cap', effect: '<script>', gender: 'female', mood: 'smug', backdrop: 'rainy-baku',
        pet: 'router', border: 'talabaplus', pose: 'diploma'
      }
    })
  };
}

test('anonymous visitors see authenticated global scores using the email prefix and public cosmetics', async () => {
  const { submit, read, ring, records } = fixture();
  assert.equal((await submit('', [ring(550)])).status, 401);
  assert.equal((await submit('a', [ring(550)])).status, 200);
  assert.equal((await submit('b', [ring(950, true)])).status, 200);
  const { status, json } = await read('ring-escape--easy');
  assert.equal(status, 200);
  assert.equal(json.mine, null);
  assert.deepEqual(json.rows.map(row => [row.player, row.score]), [['elvin', 950], ['aysu', 550]]);
  const published = JSON.stringify(json);
  assert.doesNotMatch(published, /example\.test|owner-|impersonated|gender|<script>/);
  assert.equal(json.rows[0].look.head, 'cap');
  const { mood, backdrop, pet, border, pose } = json.rows[0].look;
  assert.deepEqual([mood, backdrop, pet, border, pose], ['smug', 'rainy-baku', 'router', 'talabaplus', 'diploma']);
  assert.equal((await read('ring-escape--easy', 'a')).json.mine.score, 550);
  assert.equal(records.size, 2);
});

test('racing submissions and replay cannot replace a better result or create duplicate records', async () => {
  const { submit, read, ring, records } = fixture();
  await submit('a', [ring(100)]);
  await Promise.all([550, 840, 740, 900, 600].map(score => submit('a', [ring(score, score === 900)])));
  await submit('a', [ring(430)]);
  const { rows } = (await read('ring-escape--easy')).json;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].score, 840);
  assert.equal(records.size, 1);
});

test('validates bounds and board IDs, ranks waves, and respects account deletion', async () => {
  const { submit, read, ring, store } = fixture();
  assert.equal((await read('../users')).status, 400);
  assert.equal((await submit('a', [ring(999, true)])).status, 400);
  const batch = await submit('a', [
    ring(1100),
    { board: 'semester-waves', reached: 7, cleared: 6 },
    { board: 'tower-descent--standard', score: 600, won: true }
  ]);
  assert.deepEqual(batch.json.accepted, ['semester-waves', 'tower-descent--standard']);
  await submit('b', [{ board: 'semester-waves', reached: 8, cleared: 5 }]);
  assert.deepEqual((await read('semester-waves')).json.rows.map(row => row.reached), [8, 7]);
  store('account_deletions/owner-1', {});
  assert.equal((await submit('a', [ring(800)])).status, 409);
  assert.equal(arenaPaths('owner-1').length, 15);
  assert(arenaPaths('owner-1').every(path => !path.includes('owner-1')));
});

test('the daily leaderboard rolls over at Baku midnight independently of other scoreboards', async () => {
  const { submit, read, ring, setTime } = fixture();
  const board = 'semester-defense--daily';
  await submit('a', [ring(550), { board, day: '2026-11-27', score: 1850, won: true }]);
  await submit('b', [{ board, day: '2026-11-27', score: 500, won: false }]);
  const yesterday = (await read(board, 'a')).json;
  assert.equal(yesterday.day, '2026-11-27');
  assert.equal(yesterday.rows[0].player, 'aysu');
  assert.equal(yesterday.mine.score, 1850);
  setTime('2026-11-27T20:00:00Z');
  assert.deepEqual((await read(board, 'a')).json, { rows: [], mine: null, day: '2026-11-28' });
  assert.equal((await submit('b', [{ board, day: '2026-11-27', score: 2300, won: true }])).status, 400);
  await submit('a', [{ board, day: '2026-11-28', score: 100, won: false }]);
  assert.equal((await read(board)).json.rows[0].score, 100);
  assert.equal((await read('ring-escape--easy')).json.rows[0].score, 550);
});
