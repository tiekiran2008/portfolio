# Admin password recovery

The source route is `/kiran-panel` (preserved). Recovery emails now return to
`/kiran-panel/reset-password`. No portfolio or admin layout was redesigned.

## Why recovery failed

- Auth.tsx only implemented login and email-request modes; there was no recovery form or updateUser call.
- Login compared a SHA-256 password against VITE_ADMIN_PASSWORD_HASH and set a localStorage flag. A Supabase password change could never change that fixed hash.
- The existing AuthProvider was not mounted and its listener did not handle PASSWORD_RECOVERY.

## Configuration before deploying

Supabase → Authentication → URL Configuration:

Site URL:
`https://portfolio-tan-beta-pn72bw278a.vercel.app`

Add this exact Redirect URL:
`https://portfolio-tan-beta-pn72bw278a.vercel.app/kiran-panel/reset-password`

Keep the old redirect allowed for previously sent links:
`https://portfolio-tan-beta-pn72bw278a.vercel.app/kiran-panel`

Vercel must build the `generated` directory. Its existing vercel.json already
rewrites SPA routes to /index.html and required no change.
Keep VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_ADMIN_EMAIL configured.
If VITE_SITE_URL is configured, set it to the Site URL above (without a trailing slash).
VITE_ADMIN_EMAIL must match the existing admin user in Supabase Authentication → Users.
VITE_ADMIN_PASSWORD_HASH is no longer read. No service-role key is used.

Login now uses Supabase signInWithPassword and retains the configured admin-email
UI restriction. Existing database/RLS policies are unchanged. The frontend email
check is not a replacement for database-side authorization.

## Behavior

The existing Supabase client is retained. Callback processing has a single owner:
auto URL detection is disabled; adminAuth.ts registers the auth listener before
calling setSession for hash tokens or exchangeCodeForSession for a code.
Initialization happens once per page load, including React StrictMode.
PASSWORD_RECOVERY also activates the form without callback parameters.
A sessionStorage boolean preserves UI recovery intent across reloads; it is not an
auth credential. Supabase alone handles sessions and passwords.

Recovery takes precedence over admin rendering, including on the homepage for old
links. Passwords must match and contain at least 8 characters; Supabase can enforce
stricter configured rules. Tokens/codes are removed from the URL after processing.
Invalid callbacks cannot fall back to another session for a password update.
After updateUser succeeds, the local session signs out and login displays
"Password updated successfully". If sign-out fails, use Back to Sign In to retry;
the UI does not submit the already-updated password again.

PKCE codes require the verifier from the browser that requested the email. A code
opened in another browser cannot be securely recovered by client code: request a
new email from that browser. Existing implicit hash links remain supported.

## Validation

Run from generated:
- `npm ci`
- `npm run lint`
- `npm run build`
- `node --test tests/adminAuth.test.cjs`

The automated tests mock Supabase and cover hash/code/event recovery, reloads,
expired/incomplete links, validation, update failure, sign-out failure and admin
identity restriction. They do not prove email delivery or production configuration.

## Live acceptance test after deployment

1. Open `/kiran-panel` while signed out.
2. Select Forgot password, enter the admin email, and send a fresh reset email.
3. Open the newest link in the same browser. Do not reuse an old/consumed link.
4. Confirm Reset Password appears, rather than the admin dashboard.
5. Try mismatched passwords and confirm the validation message.
6. Enter matching passwords of at least 8 characters and select Update Password.
7. Confirm the success message and normal admin login appear.
8. Sign in with the new password and confirm the admin panel opens.
9. Sign out and confirm the old password fails.
10. Open an expired/consumed link and confirm an error with no enabled update form.

A new Vercel deployment containing these changes is required. Real email delivery,
Supabase dashboard configuration and live account password reset need verification
with the user's inbox after deployment.
