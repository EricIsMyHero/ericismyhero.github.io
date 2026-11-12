import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { migrationReadiness } from '../ai-vercel/lib/migration-readiness.js';
const privateKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({ type: 'pkcs8', format: 'pem' });
const account = { type: 'service_account', project_id: 'target-project', client_email: 'sdk@target-project.iam.gserviceaccount.com', private_key: privateKey };
const pair = crypto.createECDH('prime256v1'); pair.generateKeys();
const env = { FIREBASE_PROJECT_ID: 'target-project', FIREBASE_API_KEY: 'public-test-api-key-123456789', FIREBASE_AUTH_DOMAIN: 'target-project.firebaseapp.com', FIREBASE_APP_ID: '1:123:web:abcd', FIREBASE_MESSAGING_SENDER_ID: '123', FIREBASE_SERVICE_ACCOUNT: JSON.stringify(account), FIREBASE_VAPID_KEY: pair.getPublicKey().toString('base64url') };
test('paused readiness verifies coherent project/JSON/PEM/push settings without exposing secrets', () => {
  const result = migrationReadiness(env);
  assert.deepEqual(result, { configurationReady: true, configurationIssues: [], serviceAccountProjectId: 'target-project' });
  assert.ok(!JSON.stringify(result).includes('PRIVATE KEY'));
  assert.ok(!JSON.stringify(result).includes(env.FIREBASE_API_KEY));
});
test('readiness detects stale source service credentials and env importer quote corruption', () => {
  const stale = migrationReadiness({ ...env, FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ ...account, project_id: 'source-project' }) });
  assert.equal(stale.configurationReady, false); assert.ok(stale.configurationIssues.includes('FIREBASE_SERVICE_ACCOUNT'));
  const quoted = migrationReadiness({ ...env, FIREBASE_SERVICE_ACCOUNT: "'" + env.FIREBASE_SERVICE_ACCOUNT + "'", FIREBASE_VAPID_KEY: 'wrong-key' });
  assert.deepEqual(quoted.configurationIssues, ['FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_VAPID_KEY']);
});
