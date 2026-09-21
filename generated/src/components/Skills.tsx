import { DetailDialog } from './DetailDialog';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { usePortfolio, Skill } from '../context/PortfolioContext';
import { SectionWrapper } from './SectionWrapper';

const SkillChip: React.FC<{ skill: Skill }> = ({ skill }) => {
  const { data } = usePortfolio();
  const [showProjects, setShowProjects] = useState(false);
  const close = useCallback(() => setShowProjects(false), []);
  const canonical = (name: string) => name.toLowerCase().replace(/\bbasics\b/g, '').replace(/[^a-z0-9]/g, '');
  const matching = data.projects.filter(p => p.techStack.some(t => canonical(t) === canonical(skill.name)));
  const reducedMotion = useReducedMotion();
  const tx = useMotionValue(0), ty = useMotionValue(0);
  const dx = useMotionValue(0), dy = useMotionValue(0), dz = useMotionValue(0), zoom = useMotionValue(1);
  const spring = { stiffness: 190, damping: 25, mass: 0.6 };
  const rotateX = useSpring(tx, spring), rotateY = useSpring(ty, spring);
  const x = useSpring(dx, spring), y = useSpring(dy, spring), z = useSpring(dz, spring), scale = useSpring(zoom, spring);
  const reset = () => { tx.set(0); ty.set(0); dx.set(0); dy.set(0); dz.set(0); zoom.set(1); };
  useEffect(() => { if (reducedMotion) reset(); }, [reducedMotion]);
  const move = (event: React.PointerEvent<HTMLLIElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    // Measure the stationary slot, never the moving visual.
    const rect = event.currentTarget.getBoundingClientRect();
    const px = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5));
    const py = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5));
    tx.set(-py * 20); ty.set(px * 20);
    dx.set(px * 4); dy.set(py * 2 - 2); dz.set(12); zoom.set(1.04);
  };
  return (
    <li className="skill-chip-slot" onPointerEnter={move} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}
      onPointerDown={event => { if (!reducedMotion && event.pointerType !== 'mouse') { tx.set(2); ty.set(-2); dz.set(5); dy.set(-1); zoom.set(1.02); } }}
      onPointerUp={event => { if (event.pointerType !== 'mouse') reset(); }}>
      <motion.button type="button" onClick={() => setShowProjects(true)} aria-label={`See projects using ${skill.name}`} className="skill-chip skill-chip-tilt text-sm font-mono text-gray-300"
        style={reducedMotion ? undefined : { rotateX, rotateY, x, y, z, scale, transformStyle: 'preserve-3d' }}>
        {skill.name}
      </motion.button>
      {showProjects && <DetailDialog title={`Projects using ${skill.name}`} onClose={close}>{matching.length ? <ul className="space-y-3">{matching.map(project => <li key={project.id}><button className="enhancement-button w-full text-left" type="button" onClick={() => { setShowProjects(false); window.setTimeout(() => window.dispatchEvent(new CustomEvent('portfolio:open-project', { detail: project.id })), 0); }}>{project.title} →</button></li>)}</ul> : <p className="text-gray-300">No published project currently lists this skill in its technology stack.</p>}</DetailDialog>}
    </li>
  );
};

const SkillCard: React.FC<{ category: string, skills: Skill[], index: number }> = ({ category, skills, index }) => {
  const reducedMotion = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const sideways = useMotionValue(0);
  const depth = useMotionValue(0);
  const lift = useMotionValue(0);
  const size = useMotionValue(1);
  const spring = { stiffness: 170, damping: 24, mass: 0.7 };
  const rotateX = useSpring(tiltX, spring);
  const rotateY = useSpring(tiltY, spring);
  const x = useSpring(sideways, spring);
  const z = useSpring(depth, spring);
  const y = useSpring(lift, spring);
  const scale = useSpring(size, spring);
  const reset = () => { tiltX.set(0); tiltY.set(0); sideways.set(0); depth.set(0); lift.set(0); size.set(1); };
  useEffect(() => { if (reducedMotion) reset(); }, [reducedMotion]);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
    tiltX.set(-y * 12); tiltY.set(x * 12);
    sideways.set(x * 6); depth.set(14); lift.set(y * 3 - 5); size.set(1.015);
  };
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px 180px 0px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.16), ease: 'easeOut' }}
      className="skills-card-slot cyber-card-slot"
      onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}
      onPointerDown={event => { if (!reducedMotion && event.pointerType !== 'mouse') { tiltX.set(3); tiltY.set(-3); depth.set(10); lift.set(-3); size.set(1.01); } }}
      onPointerUp={event => { if (event.pointerType !== 'mouse') reset(); }}
    >
      <motion.div style={reducedMotion ? undefined : { rotateX, rotateY, x, z, y, scale, transformStyle: "preserve-3d" }} className="glass-panel skill-category-card skill-tilt-card rounded-xl">
        <h3 className="text-lg sm:text-xl font-mono text-[#00FFFF]">{category}</h3>
        <ul className="skill-chip-list">
          {skills.map(skill => (
            <SkillChip key={skill.id} skill={skill} />
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export const Skills: React.FC = () => {
  const { data } = usePortfolio();
  const categories = Array.from(new Set(data.skills.map(s => s.category)));
  return (
    <SectionWrapper id="skills" stable>
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-white inline-block text-center w-full">
        &gt; Skills &amp; Tools
      </h2>
      <div className="skills-grid">
        {categories.map((category, index) => (
          <SkillCard key={category} category={category} skills={data.skills.filter(s => s.category === category)} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
};
