import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const ThemeToggle: React.FC = () => {
  const { isHighContrastMode, toggleHighContrastMode } = usePortfolio();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleHighContrastMode}
      className="fixed top-6 right-[136px] z-50 p-3 rounded-full glass-panel border border-gray-700 hover:border-[#00FFFF] text-gray-400 hover:text-[#00FFFF] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
      title={isHighContrastMode ? "Switch to Neon Theme" : "Switch to High Contrast Theme"}
    >
      {isHighContrastMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </motion.button>
  );
};
