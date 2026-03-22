/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BootScreen } from './components/BootScreen';
import { CustomCursor } from './components/CustomCursor';
import { Background } from './components/Background';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { TerminalToggle } from './components/TerminalToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { AdminPanel } from './components/AdminPanel';
import { ScrollToTop } from './components/ScrollToTop';
import { Auth } from './components/Auth';
import { Settings } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Auth />;
  }
  
  return <>{children}</>;
};

const MainPortfolio = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [konamiCode, setKonamiCode] = useState<string[]>([]);
  const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKonamiCode((prev) => {
        const newCode = [...prev, e.key];
        if (newCode.length > secretCode.length) {
          newCode.shift();
        }
        if (newCode.join(',') === secretCode.join(',')) {
          alert('EASTER EGG UNLOCKED: God Mode Activated (Just kidding, but you found it!)');
        }
        return newCode;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="relative min-h-screen selection:bg-[#00FFAB] selection:text-black">
      <CustomCursor />
      <Background />
      <TerminalToggle />
      <ThemeToggle />
      <Navbar />
      <ScrollToTop />
      
      <Link 
        to="/admin" 
        className="fixed top-6 right-6 z-[101] p-3 rounded-full glass-panel border border-gray-700 hover:border-[#00FFFF] text-gray-400 hover:text-[#00FFFF] transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        title="Admin Panel"
      >
        <Settings className="w-5 h-5" />
      </Link>

      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPortfolio />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </PortfolioProvider>
  );
}

