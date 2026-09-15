import { profile } from '../data/portfolio';
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Brain, Globe } from 'lucide-react';
import { SectionWrapper } from './SectionWrapper';

const HoverBox = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    whileHover="hover"
    variants={{
      hover: { scale: 0.95, rotateX: 5, rotateY: -5, zIndex: 10 }
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`glass-panel border border-gray-800 rounded-xl bg-[#05070A]/50 backdrop-blur-md hover:border-[#00FFAB]/50 transition-colors duration-300 group ${className}`}
    style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
  >
    {children}
  </motion.div>
);

export const About: React.FC = () => {
  return (
    <SectionWrapper id="about">
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-white inline-block">
        &gt; About_Me
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <HoverBox className="p-8">
            <h3 className="text-[#00FFAB] text-2xl font-bold mb-4 tracking-wide">Biography</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {profile.biography}
            </p>
          </HoverBox>
          
          <HoverBox className="p-8">
            <h3 className="text-[#00FFAB] text-2xl font-bold mb-4 tracking-wide">Career Goals</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              {profile.careerGoals}
            </p>
          </HoverBox>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <h3 className="text-[#00FFAB] text-2xl font-bold mb-6 tracking-wide pl-2">Focus Areas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <HoverBox className="flex items-center gap-4 p-5">
              <motion.div 
                variants={{
                  hover: { 
                    scale: 1.15, 
                    boxShadow: "0 0 20px rgba(0, 255, 171, 0.6)",
                    backgroundColor: "rgba(0, 255, 171, 0.2)",
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }
                }}
                className="p-3 bg-[#00FFAB]/10 rounded-xl text-[#00FFAB]"
              >
                <Shield className="w-6 h-6" />
              </motion.div>
              <span className="text-white font-medium text-base group-hover:text-[#00FFAB] transition-colors duration-300">{profile.focusAreas[0]}</span>
            </HoverBox>
            
            <HoverBox className="flex items-center gap-4 p-5">
              <motion.div 
                variants={{
                  hover: { 
                    scale: 1.15, 
                    boxShadow: "0 0 20px rgba(0, 255, 171, 0.6)",
                    backgroundColor: "rgba(0, 255, 171, 0.2)",
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }
                }}
                className="p-3 bg-[#00FFAB]/10 rounded-xl text-[#00FFAB]"
              >
                <Cpu className="w-6 h-6" />
              </motion.div>
              <span className="text-white font-medium text-base group-hover:text-[#00FFAB] transition-colors duration-300">{profile.focusAreas[1]}</span>
            </HoverBox>
            
            <HoverBox className="flex items-center gap-4 p-5">
              <motion.div 
                variants={{
                  hover: { 
                    scale: 1.15, 
                    boxShadow: "0 0 20px rgba(0, 255, 171, 0.6)",
                    backgroundColor: "rgba(0, 255, 171, 0.2)",
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }
                }}
                className="p-3 bg-[#00FFAB]/10 rounded-xl text-[#00FFAB]"
              >
                <Brain className="w-6 h-6" />
              </motion.div>
              <span className="text-white font-medium text-base group-hover:text-[#00FFAB] transition-colors duration-300">{profile.focusAreas[2]}</span>
            </HoverBox>
            
            <HoverBox className="flex items-center gap-4 p-5">
              <motion.div 
                variants={{
                  hover: { 
                    scale: 1.15, 
                    boxShadow: "0 0 20px rgba(0, 255, 171, 0.6)",
                    backgroundColor: "rgba(0, 255, 171, 0.2)",
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.4 }
                  }
                }}
                className="p-3 bg-[#00FFAB]/10 rounded-xl text-[#00FFAB]"
              >
                <Globe className="w-6 h-6" />
              </motion.div>
              <span className="text-white font-medium text-base group-hover:text-[#00FFAB] transition-colors duration-300">{profile.focusAreas[3]}</span>
            </HoverBox>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
