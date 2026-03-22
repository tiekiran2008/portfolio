import React from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { SectionWrapper } from './SectionWrapper';

export const Experience: React.FC = () => {
  const { data } = usePortfolio();

  return (
    <SectionWrapper id="experience" hoverDirection="right">
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] inline-block text-center w-full">
        &gt; Experience
      </h2>

      <div className="relative border-l-2 border-gray-800 ml-4 sm:ml-8 w-full">
        {data.experience.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -150, rotateY: -45 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
            className="mb-16 pl-10 relative group"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gray-800 border-2 border-[#00FFAB] group-hover:bg-[#00FFAB] transition-colors duration-300 shadow-[0_0_10px_rgba(0,255,171,0.5)]" />
            <div className="absolute left-0 top-4 w-10 h-[2px] bg-gray-800 group-hover:bg-[#00FFAB]/50 transition-colors duration-300" />
            
            <motion.div 
              whileHover="hover"
              variants={{
                hover: { scale: 0.95, rotateX: 5, rotateY: 10, zIndex: 10 }
              }}
              className="glass-panel p-8 rounded-2xl border border-gray-800 hover:border-[#00FFAB]/60 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,255,171,0.3)]"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                {exp.logo && (
                  <motion.div 
                    variants={{
                      hover: { 
                        rotate: [0, -10, 10, -10, 10, 0],
                        transition: { duration: 0.5, ease: "easeInOut" }
                      }
                    }}
                    className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0"
                  >
                    <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </motion.div>
                )}
                <div>
                  <span className="text-sm font-mono text-[#00FFFF] mb-2 block">{exp.period}</span>
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#00FFAB] transition-colors">{exp.role}</h3>
                  <h4 className="text-lg text-gray-400">{exp.company}</h4>
                </div>
              </div>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap space-y-2">
                {exp.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};
