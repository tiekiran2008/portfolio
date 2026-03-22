import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  hoverDirection?: 'left' | 'right';
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ id, children, className = "", hoverDirection }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Background elements move slower (parallax depth)
  const bgY1 = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const bgX1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgX2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  
  // Foreground elements move slightly faster
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  
  // 3D bend effect on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section id={id} ref={ref} className={`relative py-24 px-6 sm:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center overflow-hidden ${className}`} style={{ perspective: '1200px' }}>
      
      {/* Background Parallax Element */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <motion.div 
          className="absolute top-[20%] left-[10%] w-72 h-72 bg-[#00FFAB] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
          style={{ y: bgY1, x: bgX1 }}
        />
        <motion.div 
          className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#00FFFF] rounded-full mix-blend-screen filter blur-[120px] opacity-10"
          style={{ y: bgY2, x: bgX2 }}
        />
      </div>

      {/* Foreground Content with 3D Scroll Effect */}
      <motion.div
        style={{ 
          y: fgY,
          rotateX,
          scale,
          opacity,
          transformStyle: 'preserve-3d'
        }}
        whileHover={
          hoverDirection === 'left' ? { rotateY: -4, rotateX: 2, scale: 0.98 } :
          hoverDirection === 'right' ? { rotateY: 4, rotateX: 2, scale: 0.98 } :
          {}
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl flex flex-col items-center"
      >
        {children}
      </motion.div>
    </section>
  );
};
