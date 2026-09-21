import type { Project } from '../data/portfolio';

export function safeLink(value: unknown, allowLocal = false): string | undefined {
  if (typeof value !== 'string') return;
  const text = value.trim();
  if (!text || text === '#') return;
  if (allowLocal && /^\/(?!\/)/.test(text) && !/[\\\s]/.test(text)) return text;
  try {
    const url = new URL(text);
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch { /* Hide invalid links instead of navigating to a broken placeholder. */ }
}

export function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return stringList(parsed); } catch { /* Accept comma/newline-separated entries too. */ }
  return value.split(/[,\n]/).map(item => item.trim()).filter(Boolean);
}

export function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object').map((item, index) => ({
    ...item,
    id: String(item.id ?? `project-${index}`),
    title: typeof item.title === 'string' ? item.title : 'Untitled Project',
    description: typeof item.description === 'string' ? item.description : '',
    techStack: stringList(item.techStack ?? item.tech_stack),
    features: stringList(item.features),
    featured: item.featured === true,
    videoUrl: safeLink(item.videoUrl) ?? '',
    problem: typeof item.problem === 'string' ? item.problem : '',
    contribution: typeof item.contribution === 'string' ? item.contribution : '',
    result: typeof item.result === 'string' ? item.result : '',
    architecture: Array.isArray(item.architecture) ? item.architecture.filter((n: any) => n && typeof n.label === 'string' && typeof n.description === 'string').map((n: any) => ({ label: n.label, description: n.description })) : [],
    githubLink: safeLink(item.githubLink ?? item.github_link) ?? '',
    demoLink: safeLink(item.demoLink ?? item.demo_link) ?? '',
    image: typeof item.image === 'string' ? item.image : undefined,
  }));
}
