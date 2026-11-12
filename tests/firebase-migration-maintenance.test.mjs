import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { migrationPaused } from '../ai-vercel/lib/maintenance.js';
import { prepareFreeze } from '../tools/firebase-migration-freeze-prepare.mjs';

test('migration maintenance is opt-in and blocks all service handlers before credentials or writes', async () => {
  assert.equal(migrationPaused({}), false); assert.equal(migrationPaused({ FIREBASE_MIGRATION_MAINTENANCE: '1' }), true);
  const previous = process.env.FIREBASE_MIGRATION_MAINTENANCE;
  process.env.FIREBASE_MIGRATION_MAINTENANCE = '1';
  try {
    for (const file of fs.readdirSync(new URL('../ai-vercel/api/', import.meta.url)).filter(name => name.endsWith('.js'))) {
      const { default: handler } = await import('../ai-vercel/api/' + file);
      const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end() { return this; } };
      await handler({ method: 'GET', headers: {} }, res);
      assert.equal(res.code, file === 'firebase-config.js' ? 200 : 503, file);
      assert.equal(res.headers['Cache-Control'], 'no-store', file);
      if (file === 'firebase-config.js') { assert.equal(res.data.maintenance, true); assert.ok(!res.data.apiKey); }
      else assert.equal(res.headers['Retry-After'], '60');
    }
  } finally { if (previous === undefined) delete process.env.FIREBASE_MIGRATION_MAINTENANCE; else process.env.FIREBASE_MIGRATION_MAINTENANCE = previous; }
});

test('freeze preparation preserves original rules and provides separate rollback/deploy files without altering them', () => {
  const rules = 'rules_version = "2"; service cloud.firestore { match /databases/{db}/documents {} }';
  const config = { projectId: 'source-project', apiKey: 'public-test-api-key-123456789' };
  const files = prepareFreeze('source-project', config, rules);
  assert.equal(files['firestore.source-before-freeze.rules'], rules);
  assert.match(files['firestore.migration-freeze.rules'], /allow read, write: if false/);
  assert.equal(JSON.parse(files['firebase.rollback.json']).firestore.rules, 'firestore.source-before-freeze.rules');
  assert.throws(() => prepareFreeze('wrong-project', config, rules), /source project/);
  assert.throws(() => prepareFreeze('source-project', { ...config, maintenance: true }, rules), /source project/);
});
