/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BootScreen } from './components/BootScreen';
import { CustomCursor } from './components/CustomCursor';
import { Background } from './components/Background';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Certificates } from './components/Certificates';
import { Projects } from './components/Projects';
import { Experience } from './components/Experience';
import { Contact } from './components/Contact';
import { TerminalToggle } from './components/TerminalToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { AdminPanel } from './components/AdminPanel';
import { ScrollToTop } from './components/ScrollToTop';
import { Auth } from './components/Auth';
import { ADMIN_PATH, RECOVERY_PATH, isAdmin } from './lib/adminAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, recovery } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-gray-300 flex items-center justify-center" role="status">Checking session...</div>;
  if (recovery || !isAdmin(session)) return <Auth />;

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

      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Experience />
        <Contact />
      </main>
    </div>
  );
};

const RecoveryBoundary = ({ children }: { children: React.ReactNode }) => {
  const { recovery } = useAuth();
  // Also catch old reset links that returned to the homepage.
  return recovery ? <Auth /> : <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <RecoveryBoundary>
            <Routes>
              <Route path="/" element={<MainPortfolio />} />
              <Route path={ADMIN_PATH} element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path={RECOVERY_PATH} element={<Auth />} />
            </Routes>
          </RecoveryBoundary>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
}
