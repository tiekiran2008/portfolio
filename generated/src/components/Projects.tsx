import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePortfolio, Project } from '../context/PortfolioContext';
import { X, ExternalLink, Github } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const ProjectCard: React.FC<{ project: Project, index: number, onClick: () => void }> = ({ project, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (isHovered) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Math.random(),
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        size: Math.random() * 10 + 5,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isHovered]);

  return (
    <div 
      className="relative h-[300px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      ref={cardRef}
    >
      <motion.div
        initial={{ opacity: 0, x: -100, rotateY: -45 }}
        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
        animate={{ 
          scale: isHovered ? 1.05 : 1, 
          y: isHovered ? -10 : 0,
          zIndex: isHovered ? 10 : 1,
          boxShadow: isHovered ? "0 25px 50px -12px rgba(0,255,171,0.4)" : "0 0 0px rgba(0,0,0,0)",
          borderColor: isHovered ? "rgba(0,255,171,0.6)" : "rgba(31, 41, 55, 1)"
        }}
        style={{ 
          rotateX: isHovered ? rotateX : 0, 
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d', 
          perspective: '1000px' 
        }}
        onClick={onClick}
        className="glass-panel p-8 rounded-2xl cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between border border-gray-800"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FFAB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.5, rotate: 180 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 rounded-sm pointer-events-none bg-[#00FFAB]"
            style={{ width: p.size, height: p.size, marginTop: -p.size/2, marginLeft: -p.size/2, transform: "translateZ(20px)" }}
          />
        ))}

        <div 
          className="relative z-10 transition-transform duration-300 ease-out"
          style={{ transform: isHovered ? "translateZ(40px)" : "translateZ(0px)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-[#00FFAB] transition-colors">{project.title}</h3>
            <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-[#00FFFF] transition-colors" />
          </div>
          <p className="text-gray-400 text-sm line-clamp-3 mb-6">{project.description}</p>
        </div>

        <div 
          className="relative z-10 flex flex-wrap gap-2 mt-auto transition-transform duration-300 ease-out"
          style={{ transform: isHovered ? "translateZ(60px)" : "translateZ(0px)" }}
        >
          {project.techStack.slice(0, 3).map((tech, i) => (
            <span key={i} className="px-3 py-1 text-xs font-mono rounded-full bg-gray-900 border border-gray-700 text-gray-300 shadow-sm">
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-gray-900 border border-gray-700 text-gray-500 shadow-sm">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const Projects: React.FC = () => {
  const { data } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <SectionWrapper id="projects" hoverDirection="left">
        <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] inline-block text-center w-full">
          &gt; Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {data.projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onClick={() => setSelectedProject(project)} />
          ))}
        </div>
      </SectionWrapper>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 sm:p-12 relative border border-[#00FFAB]/30 shadow-[0_0_50px_rgba(0,255,171,0.1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-900/50 hover:bg-[#00FFAB]/20 text-gray-400 hover:text-[#00FFAB] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 pr-12">{selectedProject.title}</h2>
              
              <div className="flex flex-wrap gap-3 mb-8">
                {selectedProject.techStack.map((tech, i) => (
                  <span key={i} className="px-4 py-2 text-sm font-mono rounded-full bg-[#00FFAB]/10 border border-[#00FFAB]/30 text-[#00FFAB]">
                    {tech}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-12">
                {selectedProject.description}
              </p>

              <div className="flex flex-wrap gap-6">
                <a
                  href={selectedProject.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00FFAB] text-black font-bold hover:bg-[#00FFFF] transition-colors shadow-[0_0_20px_rgba(0,255,171,0.4)]"
                >
                  <Github className="w-5 h-5" />
                  GITHUB
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
