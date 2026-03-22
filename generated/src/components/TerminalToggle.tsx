import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Monitor } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const TerminalToggle: React.FC = () => {
  const { isTerminalMode, toggleTerminalMode } = usePortfolio();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTerminalMode}
      className="fixed top-6 right-20 z-50 p-3 rounded-full glass-panel border border-gray-700 hover:border-[#00FFAB] text-gray-400 hover:text-[#00FFAB] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,255,171,0.3)]"
      title={isTerminalMode ? "Switch to GUI Mode" : "Switch to Terminal Mode"}
    >
      {isTerminalMode ? <Monitor className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
    </motion.button>
  );
};
