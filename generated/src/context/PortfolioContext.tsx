import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  demoLink: string;
  githubLink: string;
  image?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  logo?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

interface PortfolioData {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  messages: Message[];
}

interface PortfolioContextType {
  data: PortfolioData;
  updateData: (newData: Partial<PortfolioData> | ((prev: PortfolioData) => Partial<PortfolioData>)) => void;
  isTerminalMode: boolean;
  toggleTerminalMode: () => void;
  isHighContrastMode: boolean;
  toggleHighContrastMode: () => void;
}

const defaultData: PortfolioData = {
  projects: [
    {
      id: '1',
      title: 'AI_Digital_Fatigue_System',
      description: 'The AI Digital Fatigue & Focus Optimization System is a beginner-friendly AI project that analyzes screen-time behavior, focus level, and tiredness data to detect digital fatigue and provide smart work–break recommendations.',
      techStack: ['Python', 'Numpy', 'Pandas', 'Matplotlib', 'Git & Github'],
      demoLink: '#',
      githubLink: 'https://github.com/tiekiran2008/AI-Digital-Fatigue-System/commit/86135671610ae0f4475c8cffcfefdaf2fb39ea5e',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1000'
    }
  ],
  skills: [
    { id: '1', name: 'Python basics', category: 'PYTHON & LIBRARIES' },
    { id: '2', name: 'Numpy', category: 'PYTHON & LIBRARIES' },
    { id: '3', name: 'Pandas', category: 'PYTHON & LIBRARIES' },
    { id: '4', name: 'Matplotlib', category: 'PYTHON & LIBRARIES' },
    { id: '5', name: 'Flask', category: 'PYTHON & LIBRARIES' },
    
    { id: '6', name: 'Artificial Intelligence', category: 'AI & MACHINE LEARNING' },
    { id: '7', name: 'Machine Learning', category: 'AI & MACHINE LEARNING' },
    { id: '8', name: 'Deep Learning', category: 'AI & MACHINE LEARNING' },
    { id: '9', name: 'AI Agents', category: 'AI & MACHINE LEARNING' },
    { id: '10', name: 'Large Language Models', category: 'AI & MACHINE LEARNING' },
    { id: '11', name: 'NLP', category: 'AI & MACHINE LEARNING' },
    { id: '12', name: 'Neural Network', category: 'AI & MACHINE LEARNING' },
    { id: '13', name: 'Pytorch', category: 'AI & MACHINE LEARNING' },
    { id: '14', name: 'Tensorflow', category: 'AI & MACHINE LEARNING' },
    
    { id: '15', name: 'Git & Github', category: 'TOOLS & PLATFORMS' },
    { id: '16', name: 'Google Colab', category: 'TOOLS & PLATFORMS' },
    { id: '17', name: 'Jupyter Notebook', category: 'TOOLS & PLATFORMS' },
    
    { id: '18', name: 'Html', category: 'WEB DEVELOPMENT' },
    { id: '19', name: 'Css', category: 'WEB DEVELOPMENT' },
    { id: '20', name: 'Javascript', category: 'WEB DEVELOPMENT' },
  ],
  experience: [
    {
      id: '1',
      role: 'AIML INTERN',
      company: 'UPTOSKILLS',
      period: 'Feb 23 - May 23, 2026',
      description: 'Developing a strong foundation in Artificial Intelligence and Machine Learning concepts.\n\n~Gaining hands-on experience with AI/ML tools, technologies, and practical applications.\n\n~Collaborating on project-based tasks under the guidance of experienced mentors.',
      logo: 'https://storage.googleapis.com/aistudio-user-uploads-us-central1/014c5770-0d32-411a-85b2-c07a3915f013/image_2025-03-02_151121852.png'
    }
  ],
  messages: []
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('portfolioData_v4');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setData({ ...defaultData, ...parsed, messages: parsed.messages || [] });
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
                projects: projectsData as Project[],
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
          setData(prev => ({ ...prev, ...parsed, messages: parsed.messages || prev.messages || [] }));
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
      const updated = { ...prev, ...resolvedData };
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
