# Portfolio admin and persistence

## One-time rollout

1. In the portfolio Supabase project's SQL Editor, run
   `supabase/20260916_portfolio_persistence.sql` in full. It requires the existing
   confirmed Auth user `kiran08461kumar@gmail.com`. If that email is not your owner,
   verify the intended user before changing the bootstrap email in SQL.
2. Deploy this commit on Vercel. Keep `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` and `VITE_ADMIN_EMAIL` set for Production.
3. Sign in at `/kiran-panel`. Wait for saved content to load, edit, then Save Changes.

The migration is repeatable and copies existing projects, skills and experience
only on the first run. It does not delete or change the old tables or their policies.
Run it BEFORE deploying this code; until the migration exists, the editor blocks
saves and displays the database error.

## Where content lives

- `public.portfolio_content`: one public portfolio record (`id = 1`) with a JSONB
  document holding projects, skills, experience, certificates and resumeUrl.
  One atomic update saves additions/edits/deletions across all sections, including
  deleting the last item. Revision matching prevents stale-editor overwrites.
- `public.portfolio_admins`: trusted Auth user IDs allowed to update that record.
  Browser users cannot add themselves. The frontend email check is not the write
  authorization boundary: database RLS checks the authenticated user's ID.
- Storage bucket `portfolio-assets`: public resume PDFs and certificate thumbnails.
  New uploads use unique names, maximum 5 MB, and owner-only insert permission.
- Existing `messages`: unchanged contact storage, separate from public content.

After rollout, the old projects/skills/experience tables are legacy copies; the app
reads and writes portfolio_content. Do not edit those old tables to update the site.
The small public document avoids assumptions about legacy ID types or column naming
and lets a Save Changes operation succeed or fail as a whole.

## Admin workflow

Skills & Tools is first, followed by Projects, Certificates, Resume, Experience,
and Messages. Add/edit/delete items, then click Save Changes. Changes publish only
after Supabase confirms the write. The context then reloads content from Supabase.
Other open tabs refresh on focus/visibility and every 30 seconds while visible.

Failures retain the draft and show the actual error. Polling never replaces a dirty
admin draft. If another editor has saved first, use Reload saved content and reapply
your edits. If you had old browser-only edits, use Import previous browser-only
edits, review the draft, and Save Changes. The migration cannot access browser storage.

Certificate fields: name, issuer, date, image URL/upload, credential link.
Resume: PDF upload or URL; upload first, then Save Changes to publish the URL.
The homepage order is View Projects → Resume → Contact Me. An unconfigured Resume
button is disabled, not a fake link. Uploaded assets are public; upload only files
intended for the public portfolio. Removing a link does not delete the Storage file,
so existing external links are not broken. Unused files can be removed in Storage.

Project details continue to use the reusable dialog. Features now persist alongside
the project and have an admin editor. Skills and Projects components already read
PortfolioContext and therefore need no separate reload wiring.

`src/data/portfolio.ts` still holds static profile/social/about copy and initial
fallback content. Database arrays, including empty ones, take precedence. Published
editable data is not saved to localStorage. The old portfolioData_v4 value is retained
only for the explicit import button, never silently loaded over the database.

## Why the old flow failed

Admin called updateData before attempting database writes and unconditionally showed
success. Supabase returns errors in result.error; those errors were ignored. Removed
projects/skills were never deleted in Supabase. Empty arrays were skipped on save and
empty database results could revive fallback content. Certificates and resume were
static config, not part of the editor's database payload.

## Validation

From `generated/`: `npm run lint`, `npm run build`, `node --test tests/*.test.cjs`.
Tests include persistence error/conflict handling, empty-array deletions, and a local
PostgreSQL migration/RLS test using PGlite with Supabase auth/storage test schemas.
They do not prove live project schema compatibility or deployment health.

After migration and deployment: add one skill, one project, one certificate and a
resume; save; visit the portfolio; hard refresh; open an incognito window; check all
four sections. Edit then delete the test records and save again. Verify removed items
stay removed. Test the new project's popup and the resume button. Confirm anonymous
and non-owner writes fail, then regression-check admin login/password recovery.

## Project storytelling and interactive additions

In Admin → Projects, mark one Featured build and optionally add a demo video URL,
Problem, My contribution, Result, and ordered architecture components. Save changes
using the existing save button. These fields persist in portfolio_content.content;
no SQL migration is needed. Use real measured results. Empty fields stay hidden.
Direct MP4/WebM links play on demand in the project popup; other video links open
in a new tab. Videos are URL-based, not uploaded to the image-only asset bucket.
Architecture components form an ordered flow; visitors select a component for its role.

Skill chips open matching projects by technology name (ignoring punctuation, case
and “basics”). Update a project's Tech stack to associate additional skills.
Certificates can be opened, zoomed and verified through their credential links.
