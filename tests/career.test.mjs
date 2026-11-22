import assert from 'node:assert/strict';
import test from 'node:test';
import { adminCareer, publicCareer } from '../ai-vercel/lib/career.js';

const ID = 'c4f06ddd-3fb7-4c3d-82f4-fb0ebb358884';
const NOW = new Date('2026-11-19T19:59:59Z');
const fields = {
  title: 'Tələbələr üçün proqram',
  company: 'Təşkilat',
  type: 'volunteer',
  category: 'other',
  deadline: '2026-11-19',
  applyUrl: 'https://example.org/apply',
};

function database() {
  const docs = new Map();
  let revision = 0;
  const write = (id, data) => {
    const doc = { id, data, updateTime: String(++revision) };
    docs.set(id, doc);
    return doc;
  };
  return {
    getDoc: async path => docs.get(path.split('/').pop()),
    createDoc: async (collection, id, data) => write(id, data),
    patchDoc: async (path, patch, { ifUpdateTime }) => {
      const id = path.split('/').pop();
      const current = docs.get(id);
      if (current.updateTime !== ifUpdateTime) {
        throw Object.assign(new Error('firestore conflict'), { code: 'conflict' });
      }
      return write(id, { ...current.data, ...patch });
    },
    listDocs: async () => ({ docs: [...docs.values()] }),
    runQuery: async query => [...docs.values()].filter(doc =>
      doc.data.status === query.where.fieldFilter.value.stringValue),
  };
}

test('career drafts require valid metadata and stay private until approved', async () => {
  const db = database();
  for (const patch of [{ type: 'invalid' }, { deadline: '2026-02-30' }, { applyUrl: 'javascript:alert(1)' }]) {
    const response = await adminCareer({ ...fields, ...patch, id: ID, action: 'save' }, db, NOW);
    assert.equal(response.status, 400);
  }
  const { json: { row } } = await adminCareer({ ...fields, id: ID, action: 'save' }, db, NOW);
  assert.equal(row.status, 'draft');
  assert.deepEqual(await publicCareer(db, NOW), []);
  await adminCareer({ action: 'publish', id: ID, revision: row.revision }, db, NOW, {});
  assert.deepEqual(await publicCareer(db, NOW), [{ id: ID, ...fields }]);
  assert.deepEqual(await publicCareer(db, new Date('2026-11-19T20:00:00Z')), []);
});

test('concurrent approval posts once to the career channel and records the message ID', async () => {
  const db = database();
  const { json: { row } } = await adminCareer({ ...fields, id: ID, action: 'save' }, db, NOW);
  const command = { action: 'publish', id: ID, revision: row.revision };
  let sends = 0;
  const sender = async (url, init) => {
    sends++;
    assert.equal(new URL(url).pathname, '/botfake-token/sendMessage');
    const { chat_id, text } = JSON.parse(init.body);
    assert.equal(chat_id, '@unecstudentshubcareer');
    assert.match(text, /#Könüllülük/);
    assert.match(text, /19\.11\.2026/);
    return Response.json({ ok: true, result: { message_id: 25 } });
  };
  const replies = await Promise.all([command, command].map(cmd =>
    adminCareer(cmd, db, NOW, { CAREER_TELEGRAM_BOT_TOKEN: 'fake-token' }, sender)));
  assert.equal(sends, 1);
  assert.deepEqual(replies.map(r => r.status).sort(), [200, 409]);
  const published = replies.find(reply => reply.status === 200).json.row;
  assert.equal(published.telegramMessageId, 25);
  await adminCareer({ action: 'close', id: ID, revision: published.revision }, db, NOW);
  assert.deepEqual(await publicCareer(db, NOW), []);
});

test('ambiguous Telegram sends require reconciliation before a retry', async () => {
  const db = database();
  const { json: { row } } = await adminCareer({ ...fields, deadline: '', id: ID, action: 'save' }, db, NOW);
  const cmd = { action: 'publish', id: ID, revision: row.revision };
  let sends = 0;
  const sender = async () => { sends++; throw new Error('timeout'); };
  const env = { CAREER_TELEGRAM_BOT_TOKEN: 'fake-token' };
  const unknown = (await adminCareer(cmd, db, NOW, env, sender)).json.row;
  assert.equal(unknown.telegramStatus, 'unknown');
  assert.equal((await publicCareer(db, NOW)).length, 1);
  await adminCareer({ ...cmd, revision: unknown.revision }, db, NOW, env, sender);
  assert.equal(sends, 1);
  const verified = await adminCareer({
    ...cmd, action: 'reconcile', revision: unknown.revision, messageId: 42,
  }, db, NOW);
  assert.equal(verified.json.row.telegramMessageId, 42);
});

test('training announcements preserve descriptions, event schedules and locations independently of the deadline', async () => {
  const db = database();
  const details = {
    description: 'CV hazırlığı\n🔹 Müsahibəyə hazırlıq',
    schedule: '21–22 noyabr 2026, 09:00–16:00',
    location: 'Kənd Təsərrüfatı Nazirliyinin inzibati binası',
  };
  const command = { ...fields, ...details, deadline: '', type: 'training', id: ID, action: 'save' };
  assert.equal((await adminCareer({ ...command, description: 'a'.repeat(8001) }, db, NOW)).status, 400);
  const { json: { row } } = await adminCareer(command, db, NOW);
  let payload;
  const published = await adminCareer({ action: 'publish', id: ID, revision: row.revision }, db, NOW,
    { CAREER_TELEGRAM_BOT_TOKEN: 'fake-token' }, async (_url, options) => {
      payload = JSON.parse(options.body);
      return Response.json({ ok: true, result: { message_id: 50 } });
    });
  assert.equal(published.status, 200);
  assert(payload.text.startsWith('#Təlim'));
  assert(payload.text.includes(details.description));
  assert(payload.text.includes('📅 Tarix və saat: ' + details.schedule));
  assert(payload.text.includes('📍 Məkan: ' + details.location));
  assert.doesNotMatch(payload.text, /Son müraciət:/);
  const [opportunity] = await publicCareer(db, NOW);
  assert.deepEqual(opportunity, { ...fields, ...details, deadline: '', type: 'training', id: ID });
});

test('optional fields can be left blank or cleared while a long announcement stays complete on the site', async () => {
  const db = database();
  const company = 'T'.repeat(500);
  const description = '📌'.repeat(4000);
  const saved = await adminCareer({ id: ID, action: 'save' }, db, NOW);
  assert.equal(saved.status, 200);
  const editing = { id: ID, action: 'save', revision: saved.json.row.revision, company, description };
  assert.equal((await adminCareer({ ...editing, company: company + 'X' }, db, NOW)).status, 400);
  const { json: { row } } = await adminCareer({ ...editing, type: '', deadline: '', location: '', applyUrl: '' }, db, NOW);
  let payload;
  const published = await adminCareer({ id: ID, revision: row.revision, action: 'publish' }, db, NOW,
    { CAREER_TELEGRAM_BOT_TOKEN: 'fake-token' }, async (_url, options) => {
      payload = JSON.parse(options.body);
      return Response.json({ ok: true, result: { message_id: 51 } });
    });
  assert.equal(published.json.row.telegramStatus, 'sent');
  assert.match(payload.text, /…\n\nKaryera lövhəsi:/);
  assert.ok(payload.text.length <= 4096);
  assert.doesNotMatch(payload.text, /undefined|Son müraciət:|Müraciət:/);
  const [visible] = await publicCareer(db, NOW);
  assert.equal(visible.description, description);
  assert.equal(visible.company, company);
  assert.equal(visible.applyUrl, '');
  const cleared = await adminCareer({ id: ID, revision: published.json.row.revision, action: 'save', company: '' }, db, NOW);
  assert.equal(cleared.json.row.company, '');
  assert.equal(cleared.json.row.description, description);
});
