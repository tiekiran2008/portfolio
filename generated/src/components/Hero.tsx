import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, BrainCircuit } from 'lucide-react';

const roles = [
  'AI/ML Engineer',
  'AI Agents Builder',
  'Automation Expert',
  'Intelligent Systems Builder'
];

export const Hero: React.FC = () => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fullName = "KIRAN KUMAR E";
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedName(fullName.substring(0, i + 1));
      i++;
      if (i >= fullName.length) clearInterval(interval);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && typedText === currentRole) {
      // Add a slight delay before deletion starts
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && typedText === '') {
      // Delay before typing the next role
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
      }, 500);
    } else {
      // Dynamic typing and deleting speeds
      const typingSpeed = isDeleting ? 30 : 80;
      timeout = setTimeout(() => {
        setTypedText((prev) =>
          isDeleting
            ? currentRole.substring(0, prev.length - 1)
            : currentRole.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentRoleIndex]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="z-10"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            Hi, I'm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] text-glow-cyan">
              {typedName}
              <span className="inline-block w-1 h-12 sm:h-16 bg-[#00FFAB] ml-1 animate-pulse align-middle" style={{ opacity: typedName.length === fullName.length ? 0 : 1 }} />
            </span>
          </h1>
          
          <div className="h-12 sm:h-16 flex items-center">
            <p className="text-xl sm:text-2xl font-mono text-gray-400 flex items-center">
              &gt; {typedText}
              <motion.span 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block w-3 h-6 sm:h-7 bg-[#00FFAB] ml-2 shadow-[0_0_10px_rgba(0,255,171,0.8)] rounded-sm" 
              />
            </p>
          </div>

          <p className="mt-6 text-gray-500 max-w-lg text-lg leading-relaxed">
            Architecting the future through intelligent systems, autonomous agents, and scalable machine learning solutions.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-md bg-[#00FFAB]/10 border border-[#00FFAB] text-[#00FFAB] font-mono hover:bg-[#00FFAB] hover:text-[#05070A] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,171,0.2)] hover:shadow-[0_0_30px_rgba(0,255,171,0.6)]"
            >
              INITIATE_PROJECTS
            </motion.a>
            <motion.a
              href="#contact"
              animate={{ y: [0, -8, 0] }}
              transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-md border border-gray-700 text-gray-300 font-mono hover:border-[#00FFFF] hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all duration-300"
            >
              CONTACT ME
            </motion.a>
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-md border border-gray-700 text-gray-300 font-mono hover:border-[#00FFAB] hover:text-[#00FFAB] transition-all duration-300"
            >
              RESUME
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[400px] sm:h-[500px] flex items-center justify-center z-0"
        >
          {/* Holographic Brain/Shield Effect */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-[#00FFFF]/20 animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-[#00FFAB]/20 border-dashed animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#00FFAB]/10 to-[#00FFFF]/10 blur-2xl animate-pulse-glow" />
          
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10 text-[#00FFAB] opacity-80 mix-blend-screen drop-shadow-[0_0_30px_rgba(0,255,171,0.8)]"
          >
            <BrainCircuit className="w-32 h-32 sm:w-40 sm:h-40" strokeWidth={1} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
