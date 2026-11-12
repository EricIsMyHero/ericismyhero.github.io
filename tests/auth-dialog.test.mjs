import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function fixture() {
  const status = { textContent: '', dataset: {}, style: { removeProperty() {} }, closest: () => true };
  const context = vm.createContext({ window: {}, document: { addEventListener() {}, querySelectorAll: () => [status] }, t: key => key });
  vm.runInContext(fs.readFileSync(new URL('../scripts/firebase.js', import.meta.url), 'utf8'), context);
  return { context, status };
}
test('login errors use one neutral credential message and popup cancellation is silent', () => {
  const { context } = fixture();
  for (const code of ['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential', 'auth/invalid-login-credentials']) assert.equal(context._authErrorMessage(code), 'authBadCredentials');
  assert.equal(context._authErrorMessage('auth/popup-closed-by-user'), '');
  assert.equal(context._authErrorMessage('auth/network-request-failed'), 'authNetwork');
});
test('password reset remains neutral for nonexistent accounts without sending real mail', async () => {
  const { context, status } = fixture();
  vm.runInContext('_auth={sendPasswordResetEmail:async()=>{throw {code:"auth/user-not-found"}}}', context);
  await context.sendPasswordReset('test@example.invalid');
  assert.equal(status.textContent, 'authResetSent'); assert.equal(status.dataset.status, 'success');
});
test('existing passwords are passed to Firebase unchanged and uninitialized Auth has visible feedback', async () => {
  const { context, status } = fixture();
  await context.signInWithEmail('test@example.invalid', 'sixchr'); assert.equal(status.textContent, 'authNotReady');
  vm.runInContext('_auth={signInWithEmailAndPassword:async(email,password)=>{globalThis.captured={email,password}}}', context);
  await context.signInWithEmail('test@example.invalid', 'sixchr');
  assert.equal(context.captured.password, 'sixchr');
});
