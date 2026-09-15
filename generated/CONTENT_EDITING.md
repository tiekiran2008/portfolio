# Editing portfolio content

Edit `src/data/portfolio.ts`:
- `profile`: biography, career goals, focus areas, hero text, contact email, social URLs and resume URL.
- `defaultData`: projects, skills and experience used when no saved content exists.
- `certificates`: certificate cards, including name, issuer, display date, image and credentialUrl.
- `navigation`: section order in the navigation bar. Page order is in App.tsx.

Existing admin edits remain supported. Saved browser content (`portfolioData_v4`) and
successful Supabase reads override defaultData. Updating defaults does not erase
existing projects. Edit those existing entries through your admin panel or existing
Supabase records. Certificates and profile are frontend config, not new database tables.

Certificate example (replace every example value with your actual credential):

```ts
{
  id: 'my-certificate',
  name: 'Your certificate title',
  issuer: 'Your issuer',
  date: 'September 2026',
  image: '/certificates/my-certificate.png',
  credentialUrl: '/certificates/my-certificate.pdf',
}
```

Place certificate files in `generated/public/certificates/`, or use complete HTTPS
URLs. No real certificate records or files were supplied, so the list starts empty.
The section provides a neutral empty state. Missing links do not create fake buttons.

Projects all use this structure:
`id, title, description, techStack: string[], features?: string[], githubLink, demoLink, image?`.
The description is the full project text (line breaks are preserved in the dialog).
Features are optional frontend content; this change does not add a Supabase column.
Admin saves omit features from the database payload to preserve the existing schema.
For production projects loaded from Supabase, add features only if your existing
schema already supports them; otherwise use the description for feature details.

Old or imported project data is normalized: string/JSON/array tech stacks and snake_case
aliases are accepted, missing lists become empty arrays, and invalid or placeholder
links are hidden. Every card opens the same detail dialog; no project ID receives
special behavior. The dialog is mounted at document.body above navigation and supports
Escape, focus trapping, focus restoration and mobile scrolling.

LinkedIn is centralized as:
https://www.linkedin.com/in/kiran-kumar-e-24a27b372/

GitHub's default project URL now opens the repository rather than a single commit.
A resume button appears after profile.resumeUrl is populated; the repository had no
resume.pdf, so an unconfigured link no longer leads to a missing file.

Validation:
- npm run lint
- npm run build
- node --test tests/adminAuth.test.cjs tests/projectData.test.cjs

A Vercel deployment is needed after frontend or public-file changes.
External URL syntax is checked in code; this is not proof that third-party sites
remain reachable or that private credentials can be viewed without signing in.
