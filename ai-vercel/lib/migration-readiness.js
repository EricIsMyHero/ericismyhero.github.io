import crypto from 'node:crypto';

// Offline checks only. Public output contains fixed field names, never values.
export function migrationReadiness(env = process.env) {
  const issues = [];
  const project = env.FIREBASE_PROJECT_ID || '';
  if (!project) issues.push('FIREBASE_PROJECT_ID');
  if (!env.FIREBASE_API_KEY || env.FIREBASE_API_KEY.length < 20) issues.push('FIREBASE_API_KEY');
  if (env.FIREBASE_AUTH_DOMAIN !== project + '.firebaseapp.com') issues.push('FIREBASE_AUTH_DOMAIN');
  const number = env.FIREBASE_APP_ID?.match(/^1:(\d+):web:[A-Za-z0-9]+$/)?.[1];
  if (!number) issues.push('FIREBASE_APP_ID');
  if (!number || env.FIREBASE_MESSAGING_SENDER_ID !== number) issues.push('FIREBASE_MESSAGING_SENDER_ID');
  let serviceAccountProjectId = '';
  try {
    const account = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || '');
    serviceAccountProjectId = typeof account.project_id === 'string' && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(account.project_id) ? account.project_id : '';
    if (!project || serviceAccountProjectId !== project || account.type !== 'service_account' || !account.client_email?.endsWith('@' + project + '.iam.gserviceaccount.com')) throw new Error();
    const key = crypto.createPrivateKey(account.private_key);
    if (key.asymmetricKeyType !== 'rsa' || key.asymmetricKeyDetails.modulusLength < 2048) throw new Error();
  } catch (_) { issues.push('FIREBASE_SERVICE_ACCOUNT'); }
  try {
    const value = env.FIREBASE_VAPID_KEY || '';
    const publicKey = Buffer.from(value, 'base64url');
    if (!/^[A-Za-z0-9_-]+={0,2}$/.test(value) || publicKey.length !== 65 || publicKey[0] !== 4) throw new Error();
    crypto.ECDH.convertKey(publicKey, 'prime256v1');
  } catch (_) { issues.push('FIREBASE_VAPID_KEY'); }
  return { configurationReady: issues.length === 0, configurationIssues: issues, serviceAccountProjectId };
}
