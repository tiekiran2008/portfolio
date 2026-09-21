import React, { useState } from 'react';
import type { Project } from '../data/portfolio';
import { safeLink } from '../lib/projectData';

export const ProjectStory: React.FC<{ project: Project }> = ({ project }) => {
  const [active, setActive] = useState<number | null>(null);
  const video = safeLink(project.videoUrl);
  const directVideo = video && /\.(mp4|webm)(?:[?#]|$)/i.test(video);
  const nodes = project.architecture ?? [];
  return <div className="space-y-6 mb-8">
    {video && <section><h3 className="text-xl font-bold mb-3 text-white">Demo preview</h3>{directVideo ? <video key={video} controls playsInline preload="none" poster={project.image} className="w-full max-h-96 rounded-xl bg-black"><source src={video} /><a href={video}>Watch demo</a></video> : <a className="enhancement-button" href={video} target="_blank" rel="noopener noreferrer">Watch project demo ↗</a>}</section>}
    <div className="grid sm:grid-cols-2 gap-4">{([['Problem', project.problem], ['My contribution', project.contribution], ['Result', project.result]] as const).filter(([, text]) => text).map(([label, text]) => <section key={label} className="rounded-xl border border-[#00FFAB]/20 p-4"><h3 className="text-[#00FFAB] font-mono mb-2">{label}</h3><p className="text-gray-300 whitespace-pre-wrap break-words">{text}</p></section>)}</div>
    {nodes.length > 0 && <section><h3 className="text-xl font-bold text-white mb-3">Architecture</h3><p className="text-sm text-gray-400 mb-3">Select a component to explore its role.</p><ol className="flex flex-wrap items-center gap-3">{nodes.map((node, index) => <li key={index} className="flex items-center gap-3"><button type="button" aria-pressed={active === index} className="enhancement-button" onClick={() => setActive(index)}>{node.label}</button>{index < nodes.length - 1 && <span aria-hidden="true" className="text-[#00FFFF]">→</span>}</li>)}</ol>{active !== null && nodes[active] && <p className="mt-4 border-l-2 border-[#00FFFF] pl-4 text-gray-300 whitespace-pre-wrap" aria-live="polite">{nodes[active].description}</p>}</section>}
  </div>;
}
