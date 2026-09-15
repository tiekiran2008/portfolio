import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const ADMIN_PATH = '/kiran-panel';
export const RECOVERY_PATH = `${ADMIN_PATH}/reset-password`;
const recoveryKey = 'admin_password_recovery';
const url = new URL(window.location.href);
const hash = new URLSearchParams(url.hash.slice(1));
const hasCallback = url.searchParams.has('code') || hash.has('access_token') || hash.has('refresh_token');
const hasError = hash.has('error') || url.searchParams.has('error') || hash.has('error_code') || url.searchParams.has('error_code');
const recoveryRequested = url.pathname === RECOVERY_PATH || hash.get('type') === 'recovery' || hasCallback || hasError;

function rememberRecovery(active: boolean) {
  // UI intent only: this flag never authenticates or authorizes a user.
  try {
    if (active) sessionStorage.setItem(recoveryKey, 'true');
    else sessionStorage.removeItem(recoveryKey);
  } catch { /* Continue without persistence when storage is unavailable. */ }
}
function rememberedRecovery() {
  try { return sessionStorage.getItem(recoveryKey) === 'true'; } catch { return false; }
}

type AuthState = {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  recoveryError: string | null;
  notice: string | null;
};
let state: AuthState = {
  session: null, loading: true,
  recovery: recoveryRequested || rememberedRecovery(), recoveryError: null, notice: null,
};
const listeners = new Set<() => void>();
function publish(changes: Partial<AuthState>) {
  state = { ...state, ...changes };
  listeners.forEach(listener => listener());
}
export const getAuthState = () => state;
export const subscribeAuth = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

// Subscribe before processing callbacks. Never await Supabase inside this listener.
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    rememberRecovery(true);
    publish({ session, recovery: true, recoveryError: null });
  } else {
    // SIGNED_IN / USER_UPDATED must not dismiss the recovery form.
    publish({ session });
  }
});
if (import.meta.hot) import.meta.hot.dispose(() => subscription.unsubscribe());

function clearCallback() {
  const clean = new URL(window.location.href);
  for (const key of ['code', 'error', 'error_code', 'error_description']) clean.searchParams.delete(key);
  if (hasCallback || hasError || hash.get('type') === 'recovery') clean.hash = '';
  window.history.replaceState(window.history.state, '', clean.pathname + clean.search + clean.hash);
}

// One promise per page load prevents StrictMode from exchanging a one-use code twice.
export const authReady = (async () => {
  if (state.recovery) rememberRecovery(true);
  try {
    if (hasError) throw new Error('This reset link is invalid or expired. Request a new reset email.');
    let session: Session | null;
    const code = url.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw new Error('Unable to verify this reset link. Request a new email and open it in the same browser where you requested it.');
      session = data.session;
    } else if (hash.has('access_token') || hash.has('refresh_token')) {
      const access_token = hash.get('access_token');
      const refresh_token = hash.get('refresh_token');
      if (!access_token || !refresh_token) throw new Error('This reset link is incomplete. Request a new reset email.');
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw new Error('This reset link is invalid or expired. Request a new reset email.');
      session = data.session;
    } else {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      session = data.session;
    }
    if (state.recovery && !session) throw new Error('No recovery session found. Request a new reset email and open its link.');
    publish({ session });
  } catch (error) {
    publish({ session: null, recoveryError: error instanceof Error ? error.message : 'Unable to verify the reset link. Please try again.' });
  } finally {
    clearCallback();
    publish({ loading: false });
  }
})();

export function isAdmin(session: Session | null) {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && session?.user.email?.toLowerCase() === adminEmail);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
  try { localStorage.removeItem('admin_auth'); } catch { /* Legacy flag is no longer used. */ }
  publish({ session: null });
}

export async function finishRecovery(success = false) {
  await signOut();
  rememberRecovery(false);
  publish({ recovery: false, recoveryError: null, notice: success ? 'Password updated successfully' : null });
}

export async function updateRecoveryPassword(password: string, confirmation: string) {
  if (password.length < 8) throw new Error('Use at least 8 characters for your new password.');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  if (state.loading || !state.recovery || state.recoveryError || !state.session) {
    throw new Error('Your recovery session is unavailable. Request a new reset email.');
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  // Keep recovery mode if sign-out fails, allowing a separate retry without another update.
  publish({ notice: 'Password updated successfully' });
  await finishRecovery(true);
}
