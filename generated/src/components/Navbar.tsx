import React from 'react';
import { motion } from 'framer-motion';
import { Contrast } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const Navbar: React.FC = () => {
  const { isHighContrastMode, toggleHighContrastMode } = usePortfolio();

  const links = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills & Tools', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-[#05070A]/90 backdrop-blur-md border-b border-[#00FFAB]/10"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="w-10 hidden lg:block"></div> {/* Spacer for centering */}
        <ul className="flex items-center gap-6 sm:gap-12 overflow-x-auto no-scrollbar w-full justify-start lg:justify-center">
          {links.map((link) => (
            <li key={link.name}>
              <a 
                href={link.href}
                className="text-gray-300 hover:text-[#00FFFF] font-mono text-sm sm:text-base whitespace-nowrap transition-colors"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <button 
          onClick={toggleHighContrastMode}
          className={`p-2 ml-4 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ${isHighContrastMode ? 'text-[#00FFAB]' : 'text-gray-300 hover:text-white'}`}
          title="Toggle High Contrast Mode"
        >
          <Contrast className="w-5 h-5" />
        </button>
      </div>
    </motion.nav>
  );
};
