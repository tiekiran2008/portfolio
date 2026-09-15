import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { defaultData, type PortfolioData, type Project, type Skill, type Experience, type Message } from '../data/portfolio';
import { normalizeProjects } from '../lib/projectData';
export type { Project, Skill, Experience, Message } from '../data/portfolio';

interface PortfolioContextType {
  data: PortfolioData;
  updateData: (newData: Partial<PortfolioData> | ((prev: PortfolioData) => Partial<PortfolioData>)) => void;
  isTerminalMode: boolean;
  toggleTerminalMode: () => void;
  isHighContrastMode: boolean;
  toggleHighContrastMode: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('portfolioData_v4');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData({ ...defaultData, ...parsed, projects: normalizeProjects(parsed.projects ?? defaultData.projects), messages: parsed.messages || [] });
      } catch { console.warn('Saved portfolio content could not be loaded. Using defaults.'); }
    }

    // Attempt to fetch data from Supabase
    const fetchSupabaseData = async () => {
      try {
        // Only attempt fetch if URL and Key are configured properly
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          const { data: projectsData, error: projectsError } = await supabase.from('projects').select('*');
          const { data: skillsData, error: skillsError } = await supabase.from('skills').select('*');
          const { data: experienceData, error: experienceError } = await supabase.from('experience').select('*');
          const { data: messagesData, error: messagesError } = await supabase.from('messages').select('*');

          if (!projectsError && !skillsError && !experienceError && projectsData && skillsData && experienceData) {
            // If tables exist and data is fetched successfully, use it
            if (projectsData.length > 0 || skillsData.length > 0 || experienceData.length > 0) {
              setData(prev => ({
                ...prev,
                projects: normalizeProjects(projectsData),
                skills: skillsData as Skill[],
                experience: experienceData as Experience[],
                messages: (!messagesError && messagesData) ? (messagesData as Message[]) : prev.messages
              }));
            }
          } else {
            console.log('Supabase tables might not be set up yet or are empty. Using default/local data.');
          }
        }
      } catch (err) {
        console.error('Error fetching from Supabase:', err);
      }
    };

    fetchSupabaseData();

    const savedMode = localStorage.getItem('terminalMode');
    if (savedMode === 'true') {
      setIsTerminalMode(true);
      document.body.classList.add('terminal-mode');
    }
    const savedContrastMode = localStorage.getItem('highContrastMode');
    if (savedContrastMode === 'true') {
      setIsHighContrastMode(true);
      document.body.classList.add('high-contrast-mode');
    }

    // Listen for cross-tab changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolioData_v4' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setData(prev => ({ ...prev, ...parsed, projects: normalizeProjects(parsed.projects ?? prev.projects), messages: parsed.messages || prev.messages || [] }));
        } catch (err) {
          console.error("Failed to parse storage data", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateData = (newData: Partial<PortfolioData> | ((prev: PortfolioData) => Partial<PortfolioData>)) => {
    setData(prev => {
      const resolvedData = typeof newData === 'function' ? newData(prev) : newData;
      const updated = { ...prev, ...resolvedData, projects: normalizeProjects(resolvedData.projects ?? prev.projects) };
      localStorage.setItem('portfolioData_v4', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTerminalMode = () => {
    const newMode = !isTerminalMode;
    setIsTerminalMode(newMode);
    localStorage.setItem('terminalMode', String(newMode));
    if (newMode) {
      document.body.classList.add('terminal-mode');
    } else {
      document.body.classList.remove('terminal-mode');
    }
  };

  const toggleHighContrastMode = () => {
    const newMode = !isHighContrastMode;
    setIsHighContrastMode(newMode);
    localStorage.setItem('highContrastMode', String(newMode));
    if (newMode) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  };

  return (
    <PortfolioContext.Provider value={{ 
      data, 
      updateData, 
      isTerminalMode, 
      toggleTerminalMode,
      isHighContrastMode,
      toggleHighContrastMode
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
