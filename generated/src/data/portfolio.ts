export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  demoLink: string;
  githubLink: string;
  image?: string;
  features?: string[];
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

export interface PortfolioData {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  messages: Message[];
  certificates: Certificate[];
  resumeUrl: string;
}

export const defaultData: PortfolioData = {
  projects: [
    {
      id: '1',
      title: 'AI_Digital_Fatigue_System',
      description: 'The AI Digital Fatigue & Focus Optimization System is a beginner-friendly AI project that analyzes screen-time behavior, focus level, and tiredness data to detect digital fatigue and provide smart work–break recommendations.',
      techStack: ['Python', 'Numpy', 'Pandas', 'Matplotlib', 'Git & Github'],
      demoLink: '#',
      githubLink: 'https://github.com/tiekiran2008/AI-Digital-Fatigue-System',
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
  certificates: [],
  resumeUrl: '',
  messages: []
};

export interface Certificate {
  logo?: string;
  description?: string;
  skills?: string[];
  id: string;
  name: string;
  issuer: string;
  date: string;
  image?: string;
  credentialUrl?: string;
}

// Published certificates are managed through Admin and stored in Supabase.

export const profile = {
  name: 'KIRAN KUMAR E',
  roles: ['AI/ML Engineer', 'AI Agents Builder', 'Automation Expert', 'Intelligent Systems Builder'],
  tagline: 'Architecting the future through intelligent systems, autonomous agents, and scalable machine learning solutions.',
  biography: "I’m KIRAN KUMAR E, an AI/ML Engineer focused on building intelligent, automated, and practical solutions. I work with Machine Learning, AI Agents, Computer Vision, Generative AI, chatbots, and automation to solve real-world problems. I enjoy building scalable AI applications, exploring emerging technologies, and continuously improving my skills to create impactful products.",
  careerGoals: "My goal is to combine AI/ML, AI Agents, and automation to build intelligent systems, solve real-world problems, and develop innovative products that create meaningful impact in the future.",
  focusAreas: ['AIML', 'AI AGENTS', 'AUTOMATION', 'WEB DEVELOPMENT'],
  contactIntro: "I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
  email: 'kiran08461kumar@gmail.com',
  resumeUrl: '', // Add a real public PDF URL or /resume.pdf after adding the file to public/.
  social: {
    github: 'https://github.com/tiekiran2008',
    linkedin: 'https://www.linkedin.com/in/kiran-kumar-e-24a27b372/',
    instagram: 'https://www.instagram.com/tie_kiran_008_/',
  },
};

export const navigation = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills & Tools', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
  { name: 'Certificates & Licenses', href: '#certificates' },
  { name: 'Contact', href: '#contact' },
];
