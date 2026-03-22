import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { SectionWrapper } from './SectionWrapper';
import { DataVisualizer } from './DataVisualizer';

const SkillCard: React.FC<{ category: string, skills: any[], index: number }> = ({ category, skills, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Increased tilt angles for a more pronounced 3D effect
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ zIndex: 10 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-panel p-8 rounded-xl border border-gray-800 hover:border-[#00FFFF]/50 transition-colors duration-300 group"
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: 'preserve-3d', 
        transformPerspective: 1000 
      }}
    >
      <motion.h3 
        className="text-xl font-mono text-[#00FFFF] mb-6 border-b border-gray-800 pb-4 group-hover:border-[#00FFFF]/30 transition-colors"
        style={{ translateZ: 50 }}
      >
        {category}
      </motion.h3>
      <motion.div className="flex flex-wrap gap-3" style={{ translateZ: 75 }}>
        {skills.map((skill, i) => (
          <motion.span
            key={skill.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ 
              y: -5, 
              scale: 1.1, 
              boxShadow: "0 0 25px rgba(0,255,171,0.8), 0 0 50px rgba(0,255,171,0.4)",
              backgroundColor: "rgba(0,255,171,0.2)",
              color: "#ffffff"
            }}
            className="px-4 py-2 rounded-full text-sm font-mono bg-[#00FFAB]/5 border border-[#00FFAB]/20 text-gray-300 hover:text-[#00FFAB] hover:border-[#00FFAB] transition-all cursor-default"
          >
            {skill.name}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export const Skills: React.FC = () => {
  const { data } = usePortfolio();
  
  const categories = Array.from(new Set(data.skills.map(s => s.category))) as string[];

  return (
    <SectionWrapper id="skills">
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-white inline-block text-center w-full">
        &gt; Skills & Tools
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {categories.map((category, index) => (
          <SkillCard 
            key={category} 
            category={category} 
            skills={data.skills.filter(s => s.category === category)} 
            index={index} 
          />
        ))}
      </div>

      <DataVisualizer skills={data.skills} />
    </SectionWrapper>
  );
};
