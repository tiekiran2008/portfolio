import React, { useEffect } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { usePortfolio, Skill } from '../context/PortfolioContext';
import { SectionWrapper } from './SectionWrapper';

const SkillCard: React.FC<{ category: string, skills: Skill[], index: number }> = ({ category, skills, index }) => {
  const reducedMotion = useReducedMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const depth = useMotionValue(0);
  const lift = useMotionValue(0);
  const size = useMotionValue(1);
  const spring = { stiffness: 170, damping: 24, mass: 0.7 };
  const rotateX = useSpring(tiltX, spring);
  const rotateY = useSpring(tiltY, spring);
  const z = useSpring(depth, spring);
  const y = useSpring(lift, spring);
  const scale = useSpring(size, spring);
  const reset = () => { tiltX.set(0); tiltY.set(0); depth.set(0); lift.set(0); size.set(1); };
  useEffect(() => { if (reducedMotion) reset(); }, [reducedMotion]);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
    tiltX.set(-y * 12); tiltY.set(x * 12);
    depth.set(14); lift.set(-5); size.set(1.015);
  };
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.16), ease: 'easeOut' }}
      className="skills-card-slot cyber-card-slot"
      onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}
      onPointerDown={event => { if (!reducedMotion && event.pointerType !== 'mouse') { tiltX.set(3); tiltY.set(-3); depth.set(10); lift.set(-3); size.set(1.01); } }}
      onPointerUp={event => { if (event.pointerType !== 'mouse') reset(); }}
    >
      <motion.div style={reducedMotion ? undefined : { rotateX, rotateY, z, y, scale, transformStyle: "preserve-3d" }} className="glass-panel skill-category-card skill-tilt-card rounded-xl">
        <h3 className="text-lg sm:text-xl font-mono text-[#00FFFF]">{category}</h3>
        <ul className="skill-chip-list">
          {skills.map(skill => (
            <li key={skill.id} className="skill-chip text-sm font-mono text-gray-300">{skill.name}</li>
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
    <SectionWrapper id="skills">
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
