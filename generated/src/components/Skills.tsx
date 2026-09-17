import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePortfolio, Skill } from '../context/PortfolioContext';
import { SectionWrapper } from './SectionWrapper';

const SkillCard: React.FC<{ category: string, skills: Skill[], index: number }> = ({ category, skills, index }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.16), ease: 'easeOut' }}
      className="skills-card-slot cyber-card-slot"
    >
      <div className="glass-panel skill-category-card cyber-pop-card rounded-xl">
        <h3 className="text-lg sm:text-xl font-mono text-[#00FFFF]">{category}</h3>
        <ul className="skill-chip-list">
          {skills.map(skill => (
            <li key={skill.id} className="skill-chip text-sm font-mono text-gray-300">{skill.name}</li>
          ))}
        </ul>
      </div>
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
