import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { parseEnv } from 'node:util';
import { makeFirebaseEnv } from '../tools/firebase-migration-env.mjs';
import firebaseConfig from '../ai-vercel/api/firebase-config.js';

const project = 'target-project';
const web = { projectId: project, apiKey: 'test-public-api-key-123456789', authDomain: project + '.firebaseapp.com', messagingSenderId: '12345', appId: '1:12345:web:abcd1234' };
const key = { type: 'service_account', project_id: project, client_email: 'firebase-adminsdk-test@' + project + '.iam.gserviceaccount.com', private_key: crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' }) };
const journal = { schemaVersion: 1, source: 'source-project', target: project, status: 'verified', fingerprint: 'test-only-fingerprint' };
const pair = crypto.createECDH('prime256v1'); pair.generateKeys(); const vapid = pair.getPublicKey().toString('base64url');

test('private env values round-trip with Node’s dotenv parser, preserving JSON and PEM bytes', () => {
  const result = makeFirebaseEnv(web, key, '\uFEFF' + vapid + '\r\n', journal, project);
  const env = parseEnv(result.contents);
  assert.equal(result.count, 9); assert.equal(Object.keys(env).length, 9);
  assert.deepEqual(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT), key);
  assert.equal(env.FIREBASE_PROJECT_ID, project); assert.equal(env.FIREBASE_VAPID_KEY, vapid);
  assert.equal(env.FIREBASE_STORAGE_BUCKET, ''); assert.equal(env.FIREBASE_MEASUREMENT_ID, '');
  assert.deepEqual(result.optionalEmpty, ['FIREBASE_STORAGE_BUCKET', 'FIREBASE_MEASUREMENT_ID']);
  assert.ok(!Object.keys(env).some(name => name.startsWith('R2_') || name.startsWith('PAYMENT_')));
});

test('env preparation refuses mismatched projects, incomplete migrations, wrong sender IDs and malformed push keys', () => {
  assert.throws(() => makeFirebaseEnv(web, { ...key, project_id: 'source-project' }, vapid, journal, project), /destination/);
  assert.throws(() => makeFirebaseEnv(web, key, vapid, { ...journal, status: 'running' }, project), /verified/);
  assert.throws(() => makeFirebaseEnv({ ...web, messagingSenderId: '999' }, key, vapid, journal, project), /inconsistent/);
  assert.throws(() => makeFirebaseEnv(web, key, 'not-a-vapid-key', journal, project), /length or format/);
  assert.throws(() => makeFirebaseEnv(web, key, Buffer.alloc(65, 4).toString('base64url'), journal, project), /P-256/);
});

test('Auth/Firestore configuration does not require an unused Firebase Storage bucket', () => {
  const names = ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID', 'FIREBASE_MEASUREMENT_ID'];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    Object.assign(process.env, { FIREBASE_API_KEY: web.apiKey, FIREBASE_AUTH_DOMAIN: web.authDomain, FIREBASE_PROJECT_ID: project, FIREBASE_MESSAGING_SENDER_ID: web.messagingSenderId, FIREBASE_APP_ID: web.appId });
    delete process.env.FIREBASE_STORAGE_BUCKET; delete process.env.FIREBASE_MEASUREMENT_ID;
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    firebaseConfig({ method: 'GET', headers: {} }, res);
    assert.equal(res.code, 200); assert.equal(res.data.projectId, project); assert.equal(res.data.storageBucket, '');
  } finally {
    for (const [name, value] of Object.entries(saved)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
  }
});
