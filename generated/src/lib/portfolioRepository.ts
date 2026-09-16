import { supabase, supabaseConfigured } from './supabase';
import { defaultData, type PortfolioData } from '../data/portfolio';
import { normalizeProjects, safeLink } from './projectData';

export type EditableContent = Omit<PortfolioData, 'messages'>;
export type ContentSnapshot = { content: EditableContent; revision: number };

const text = (value: unknown) => typeof value === 'string' ? value : '';

export function normalizeContent(raw: Partial<EditableContent>): EditableContent {
  return {
    projects: normalizeProjects(raw.projects ?? defaultData.projects),
    skills: (raw.skills ?? defaultData.skills).map(row => ({ id: String(row.id), name: text(row.name), category: text(row.category) })),
    experience: (raw.experience ?? defaultData.experience).map(row => ({ id: String(row.id), role: text(row.role), company: text(row.company), period: text(row.period), description: text(row.description), logo: text(row.logo) })),
    certificates: (raw.certificates ?? []).map(row => ({ id: String(row.id), name: text(row.name), issuer: text(row.issuer), date: text(row.date), image: text(row.image), credentialUrl: text(row.credentialUrl) })),
    resumeUrl: safeLink(raw.resumeUrl, true) ?? '',
  };
}

function configured() {
  if (!supabaseConfigured) throw new Error('Supabase is not configured. Check the Vercel Supabase environment variables.');
}

export async function loadContent(): Promise<ContentSnapshot> {
  configured();
  const { data, error } = await supabase.from('portfolio_content').select('content, revision').eq('id', 1).single();
  if (error) throw new Error(`Unable to load portfolio content: ${error.message}. Check the database migration and permissions.`);
  return { content: normalizeContent(data.content), revision: data.revision };
}

export function validateContent(content: EditableContent) {
  for (const [name, rows] of Object.entries({ projects: content.projects, skills: content.skills, experience: content.experience, certificates: content.certificates })) {
    const ids = rows.map(row => row.id);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw new Error(`${name}: every item needs a unique ID.`);
  }
  if (content.skills.some(row => !row.name.trim() || !row.category.trim())) throw new Error('Each skill needs a name and category.');
  if (content.projects.some(row => !row.title.trim())) throw new Error('Each project needs a title.');
  if (content.certificates.some(row => !row.name.trim() || !row.issuer.trim())) throw new Error('Each certificate needs a name and issuer.');
  for (const value of [content.resumeUrl, ...content.certificates.map(row => row.credentialUrl)]) {
    if (value?.trim() && !safeLink(value, true)) throw new Error('Resume and credential links must be valid HTTPS URLs or local file paths.');
  }
  for (const project of content.projects) {
    for (const value of [project.githubLink, project.demoLink]) {
      if (value?.trim() && value !== '#' && !safeLink(value)) throw new Error(`${project.title}: use a complete HTTP(S) URL or leave the link empty.`);
    }
  }
}

export async function persistContent(draft: EditableContent, revision: number): Promise<ContentSnapshot> {
  configured();
  validateContent(draft);
  // Only explicitly editable public fields go into this table. Contact messages never do.
  const content = normalizeContent(draft);
  const { data, error } = await supabase.from('portfolio_content')
    .update({ content, revision: revision + 1 })
    .eq('id', 1).eq('revision', revision).select('content, revision').maybeSingle();
  if (error) throw new Error(`Save failed: ${error.message}`);
  if (!data) throw new Error('Nothing was saved. Your admin permission may be missing, or another tab changed the portfolio. Reload the saved content before trying again.');
  return { content: normalizeContent(data.content), revision: data.revision };
}

export async function uploadAsset(file: File, kind: 'resume' | 'certificate'): Promise<string> {
  configured();
  const allowed = kind === 'resume' ? ['application/pdf'] : ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.type)) throw new Error(kind === 'resume' ? 'Select a PDF file.' : 'Select a PNG, JPEG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Files must be 5 MB or smaller.');
  const extension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const path = `${kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('portfolio-assets').upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from('portfolio-assets').getPublicUrl(path).data.publicUrl;
}
