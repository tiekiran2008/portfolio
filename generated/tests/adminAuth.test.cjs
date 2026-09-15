const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
const source = fs.readFileSync('src/lib/adminAuth.ts', 'utf8')
  .replaceAll('import.meta.env.VITE_ADMIN_EMAIL', "'admin@example.com'")
  .replaceAll('import.meta.hot', 'undefined');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const session = { user: { id: 'test-user', email: 'admin@example.com' }, access_token: 'test-access', refresh_token: 'test-refresh' };

async function setup(path, options = {}) {
  let listener;
  const calls = [];
  const storage = options.storage || new Map();
  const location = { href: 'https://example.com' + path };
  const auth = {
    onAuthStateChange(cb) { listener = cb; return { data: { subscription: { unsubscribe() {} } } }; },
    async getSession() { return { data: { session: options.session || null }, error: null }; },
    async setSession(tokens) { calls.push(['setSession', tokens]); return { data: { session }, error: options.callbackError || null }; },
    async exchangeCodeForSession(code) { calls.push(['exchange', code]); return { data: { session }, error: options.callbackError || null }; },
    async updateUser(value) { calls.push(['update', value]); listener('USER_UPDATED', session); return { error: options.updateError || null }; },
    async signOut() { calls.push(['signOut']); if (options.signOutError) return { error: options.signOutError }; listener('SIGNED_OUT', null); return { error: null }; },
  };
  const context = {
    exports: {}, require: () => ({ supabase: { auth } }), URL, URLSearchParams,
    window: { location, history: { state: null, replaceState(_s, _t, path) { location.href = new URL(path, location.href).href; } } },
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    localStorage: { removeItem() {} },
  };
  vm.runInNewContext(compiled, context);
  const api = context.exports;
  await api.authReady;
  return { api, calls, storage, location, emit: (...args) => listener(...args) };
}

test('hash recovery survives auth events, updates password and signs out', async () => {
  const { api, calls, location, emit, storage } = await setup('/kiran-panel#access_token=a&refresh_token=b&type=recovery');
  assert.equal(api.getAuthState().recovery, true);
  assert.equal(api.getAuthState().session.user.id, 'test-user');
  assert.equal(location.href, 'https://example.com/kiran-panel');
  emit('SIGNED_IN', session);
  emit('TOKEN_REFRESHED', session);
  assert.equal(api.getAuthState().recovery, true);
  await api.updateRecoveryPassword('new-password', 'new-password');
  assert.deepEqual(calls.map(x => x[0]), ['setSession', 'update', 'signOut']);
  assert.equal(calls[1][1].password, 'new-password');
  assert.equal(api.getAuthState().recovery, false);
  assert.equal(api.getAuthState().session, null);
  assert.equal(api.getAuthState().notice, 'Password updated successfully');
  assert.equal(storage.size, 0);
});

test('PKCE code is exchanged once even if initialization is awaited again', async () => {
  const { api, calls, location } = await setup('/kiran-panel/reset-password?code=one-use');
  await api.authReady;
  assert.equal(calls.filter(x => x[0] === 'exchange').length, 1);
  assert.equal(api.getAuthState().recovery, true);
  assert.equal(location.href.includes('code='), false);
});

test('PASSWORD_RECOVERY event opens recovery without URL markers', async () => {
  const { api, emit } = await setup('/kiran-panel');
  emit('PASSWORD_RECOVERY', session);
  assert.equal(api.getAuthState().recovery, true);
  await api.updateRecoveryPassword('new-password', 'new-password');
  assert.equal(api.getAuthState().notice, 'Password updated successfully');
});

test('reload retains recovery UI intent with a restored Supabase session', async () => {
  const { api } = await setup('/kiran-panel', { session, storage: new Map([['admin_password_recovery', 'true']]) });
  assert.equal(api.getAuthState().recovery, true);
});

test('invalid/expired/incomplete callbacks cannot update an existing account session', async () => {
  for (const path of ['/kiran-panel#access_token=a', '/kiran-panel/reset-password#error=access_denied&error_code=otp_expired', '/kiran-panel/reset-password']) {
    const { api, calls } = await setup(path);
    assert.ok(api.getAuthState().recoveryError);
    await assert.rejects(api.updateRecoveryPassword('new-password', 'new-password'), /unavailable/);
    assert.equal(calls.some(x => x[0] === 'update'), false);
  }
});

test('PKCE failure does not fall back to an old signed-in session', async () => {
  const { api } = await setup('/kiran-panel/reset-password?code=expired', { callbackError: new Error('invalid'), session });
  assert.equal(api.getAuthState().session, null);
  assert.match(api.getAuthState().recoveryError, /same browser/);
});

test('short and mismatched passwords are rejected before making API requests', async () => {
  const { api, calls } = await setup('/kiran-panel/reset-password', { session });
  await assert.rejects(api.updateRecoveryPassword('short', 'short'), /8 characters/);
  await assert.rejects(api.updateRecoveryPassword('new-password', 'different'), /do not match/);
  assert.equal(calls.some(x => x[0] === 'update'), false);
});

test('update failure retains recovery form and does not sign out', async () => {
  const { api, calls } = await setup('/kiran-panel/reset-password', { session, updateError: new Error('Password policy rejected') });
  await assert.rejects(api.updateRecoveryPassword('new-password', 'new-password'), /policy/);
  assert.equal(api.getAuthState().recovery, true);
  assert.equal(api.getAuthState().notice, null);
  assert.equal(calls.some(x => x[0] === 'signOut'), false);
});

test('sign-out failure preserves successful-update notice and recovery mode', async () => {
  const { api } = await setup('/kiran-panel/reset-password', { session, signOutError: new Error('network') });
  await assert.rejects(api.updateRecoveryPassword('new-password', 'new-password'), /network/);
  assert.equal(api.getAuthState().recovery, true);
  assert.equal(api.getAuthState().notice, 'Password updated successfully');
});

test('admin access requires the configured email and a Supabase session', async () => {
  const { api } = await setup('/kiran-panel');
  assert.equal(api.isAdmin(null), false);
  assert.equal(api.isAdmin({ user: { email: 'other@example.com' } }), false);
  assert.equal(api.isAdmin(session), true);
});
