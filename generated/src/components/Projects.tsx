import { createPortal } from 'react-dom';
import { safeLink } from '../lib/projectData';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio, Project } from '../context/PortfolioContext';
import { X, ExternalLink, Github } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const ProjectCard: React.FC<{ project: Project, index: number, onClick: () => void }> = ({ project, onClick }) => (
  <button type="button" onClick={onClick} aria-haspopup="dialog" aria-label={`View details for ${project.title}`}
    className="glass-panel min-w-0 w-full h-full min-h-[300px] p-6 sm:p-8 rounded-2xl text-left cursor-pointer flex flex-col gap-4 border border-gray-800 hover:border-[#00FFAB]/50 transition-colors focus-visible:outline-2 focus-visible:outline-[#00FFAB]">
    {project.image && <img src={project.image} alt="" loading="lazy" decoding="async" draggable={false} className="w-full h-32 object-cover rounded-lg pointer-events-none" />}
    <span className="text-2xl font-bold text-white [overflow-wrap:anywhere]">{project.title}</span>
    <span className="text-gray-400 text-sm line-clamp-3">{project.description}</span>
    <span className="flex flex-wrap gap-2 mt-auto">{project.techStack.slice(0, 3).map((tech, i) => <span key={i} className="max-w-full [overflow-wrap:anywhere] px-3 py-1 text-xs font-mono rounded-full bg-gray-900 border border-gray-700 text-gray-300">{tech}</span>)}</span>
    <span className="text-sm text-[#00FFAB]">View details →</span>
  </button>
);

export const Projects: React.FC = () => {
  const { data } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedProject) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
      if (event.key !== 'Tab') return;
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus({ preventScroll: true }); };
  }, [selectedProject]);

  return (
    <>
      <SectionWrapper id="projects" stable>
        <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] inline-block text-center w-full">
          &gt; Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {data.projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onClick={() => setSelectedProject(project)} />
          ))}
        </div>
      </SectionWrapper>

      {createPortal(<AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
            onClick={event => { if (event.target === event.currentTarget) setSelectedProject(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel w-full max-w-4xl max-h-[90dvh] overflow-y-auto overscroll-contain rounded-3xl p-5 sm:p-12 [overflow-wrap:anywhere] relative border border-[#00FFAB]/30 shadow-[0_0_50px_rgba(0,255,171,0.1)]"
              ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="project-detail-title"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close project details"
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-900/50 hover:bg-[#00FFAB]/20 text-gray-400 hover:text-[#00FFAB] transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>

              {selectedProject.image && (
                <div className="w-full h-64 sm:h-80 mb-8 rounded-2xl overflow-hidden relative border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                </div>
              )}

              <h2 id="project-detail-title" className="text-3xl sm:text-5xl font-bold text-white mb-6 pr-12 relative z-10">{selectedProject.title}</h2>
              
              <div className="flex flex-wrap gap-3 mb-8 relative z-10">
                {selectedProject.techStack.map((tech, i) => (
                  <span key={i} className="max-w-full px-4 py-2 text-sm font-mono rounded-full bg-[#00FFAB]/10 border border-[#00FFAB]/30 text-[#00FFAB]">
                    {tech}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-lg whitespace-pre-line leading-relaxed mb-8">
                {selectedProject.description}
              </p>

              {Boolean(selectedProject.features?.length) && <div className="mb-8">
                <h3 className="text-xl text-white font-bold mb-3">Features</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-300">{selectedProject.features!.map((feature, index) => <li key={index}>{feature}</li>)}</ul>
              </div>}
              <div className="flex flex-wrap gap-4">
                {safeLink(selectedProject.githubLink) && <a
                  href={safeLink(selectedProject.githubLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00FFAB] text-black font-bold hover:bg-[#00FFFF] transition-colors shadow-[0_0_20px_rgba(0,255,171,0.4)]"
                >
                  <Github className="w-5 h-5" />
                  GITHUB
                </a>}
                {safeLink(selectedProject.demoLink) && <a href={safeLink(selectedProject.demoLink)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#00FFAB] text-[#00FFAB] font-bold hover:bg-[#00FFAB]/10"><ExternalLink className="w-5 h-5 shrink-0" />LIVE DEMO</a>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
};
