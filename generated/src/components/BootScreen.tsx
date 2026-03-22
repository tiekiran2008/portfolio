import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const bootSequence = [
    'INIT SYSTEM KERNEL...',
    'LOADING NEURAL WEIGHTS [██████████] 100%',
    'ESTABLISHING SECURE CONNECTION...',
    'BYPASSING FIREWALLS...',
    'ACCESS GRANTED.',
    'WAKING UP AI AGENT...',
    'SYSTEM ONLINE.'
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setLogs((prev) => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black text-[#00FFAB] font-mono text-sm sm:text-lg">
      <div className="w-full max-w-2xl p-8">
        {logs.map((log, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2"
          >
            &gt; {log}
          </motion.div>
        ))}
        {logs.length < bootSequence.length && (
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-3 h-5 bg-[#00FFAB] ml-2 align-middle"
          />
        )}
      </div>
    </div>
  );
};
