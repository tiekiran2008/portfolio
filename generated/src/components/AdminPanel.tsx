import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio, Project, Skill, Experience } from '../context/PortfolioContext';
import { Plus, Trash2, Save, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AdminPanel: React.FC = () => {
  const { data, updateData } = usePortfolio();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'experience' | 'messages'>('projects');
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSignOut = async () => {
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const handleSave = async () => {
    try {
      updateData(localData);
      
      // Sync with Supabase if configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Projects
        if (localData.projects.length > 0) {
          await supabase.from('projects').upsert(localData.projects);
        }
        
        // Skills
        if (localData.skills.length > 0) {
          await supabase.from('skills').upsert(localData.skills);
        }
        
        // Experience
        if (localData.experience.length > 0) {
          await supabase.from('experience').upsert(localData.experience);
        }
      }
      
      alert('Data saved successfully!');
    } catch (err) {
      console.error("Failed to save to Supabase:", err);
      alert('Local data saved, but failed to sync with Supabase. Check console for details.');
    }
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project description',
      techStack: ['React'],
      demoLink: '#',
      githubLink: '#'
    };
    setLocalData({ ...localData, projects: [...localData.projects, newProject] });
  };

  const handleRemoveProject = (id: string) => {
    setLocalData({ ...localData, projects: localData.projects.filter(p => p.id !== id) });
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    setLocalData({
      ...localData,
      projects: localData.projects.map(p => {
        if (p.id === id) {
          if (field === 'techStack') {
            return { ...p, [field]: value.split(',').map(s => s.trim()) };
          }
          return { ...p, [field]: value };
        }
        return p;
      })
    });
  };

  // Similar functions for skills and experience...
  const handleAddSkill = () => {
    const newSkill: Skill = { id: Date.now().toString(), name: 'New Skill', category: 'Category' };
    setLocalData({ ...localData, skills: [...localData.skills, newSkill] });
  };

  const handleRemoveSkill = (id: string) => {
    setLocalData({ ...localData, skills: localData.skills.filter(s => s.id !== id) });
  };

  const handleSkillChange = (id: string, field: keyof Skill, value: string) => {
    setLocalData({
      ...localData,
      skills: localData.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const handleAddExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: 'New Role',
      company: 'Company',
      period: '2024 - Present',
      description: 'Description'
    };
    setLocalData({ ...localData, experience: [...localData.experience, newExp] });
  };

  const handleRemoveExperience = (id: string) => {
    setLocalData({ ...localData, experience: localData.experience.filter(e => e.id !== id) });
  };

  const handleExperienceChange = (id: string, field: keyof Experience, value: string) => {
    setLocalData({
      ...localData,
      experience: localData.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const handleRemoveMessage = async (id: string) => {
    const updatedMessages = (localData.messages || []).filter(m => m.id !== id);
    setLocalData({ ...localData, messages: updatedMessages });
    
    // Immediately delete from Supabase if configured
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      try {
        await supabase.from('messages').delete().eq('id', id);
      } catch (err) {
        console.error("Failed to delete message from Supabase:", err);
      }
    }
    
    // Update context as well
    updateData({ messages: updatedMessages });
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 sm:p-12 font-sans relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-[#00FFAB] font-mono">&gt; ADMIN_PANEL</h1>
          <div className="flex gap-4">
            <button onClick={handleSignOut} className="px-4 py-2 rounded-md border border-gray-700 hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> SIGN_OUT
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-md border border-gray-700 hover:border-white transition-colors flex items-center gap-2">
              <X className="w-4 h-4" /> CLOSE
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-[#00FFAB] text-black font-bold hover:bg-[#00FFFF] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,171,0.3)]">
              <Save className="w-4 h-4" /> SAVE_CHANGES
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4 overflow-x-auto">
          {(['projects', 'skills', 'experience', 'messages'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md font-mono uppercase transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-[#00FFAB]/20 text-[#00FFAB] border border-[#00FFAB]' 
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tab} {tab === 'messages' && localData.messages?.length > 0 && `(${localData.messages.length})`}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'projects' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-300">Manage Projects</h2>
                <button onClick={handleAddProject} className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-[#00FFAB] transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {localData.projects.map(project => (
                <div key={project.id} className="glass-panel p-6 rounded-xl border border-gray-800 relative group">
                  <button onClick={() => handleRemoveProject(project.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleProjectChange(project.id, 'title', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={project.techStack.join(', ')}
                      onChange={(e) => handleProjectChange(project.id, 'techStack', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="Tech Stack (comma separated)"
                    />
                    <input
                      type="text"
                      value={project.demoLink}
                      onChange={(e) => handleProjectChange(project.id, 'demoLink', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="Demo Link"
                    />
                    <input
                      type="text"
                      value={project.githubLink}
                      onChange={(e) => handleProjectChange(project.id, 'githubLink', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="GitHub Link"
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none md:col-span-2"
                      placeholder="Description"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'skills' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-300">Manage Skills</h2>
                <button onClick={handleAddSkill} className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-[#00FFAB] transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localData.skills.map(skill => (
                  <div key={skill.id} className="glass-panel p-4 rounded-xl border border-gray-800 relative flex flex-col gap-3">
                    <button onClick={() => handleRemoveSkill(skill.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleSkillChange(skill.id, 'name', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none text-sm"
                      placeholder="Skill Name"
                    />
                    <input
                      type="text"
                      value={skill.category}
                      onChange={(e) => handleSkillChange(skill.id, 'category', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none text-sm"
                      placeholder="Category"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'experience' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-300">Manage Experience</h2>
                <button onClick={handleAddExperience} className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-[#00FFAB] transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {localData.experience.map(exp => (
                <div key={exp.id} className="glass-panel p-6 rounded-xl border border-gray-800 relative group">
                  <button onClick={() => handleRemoveExperience(exp.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="Role"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => handleExperienceChange(exp.id, 'period', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none md:col-span-2"
                      placeholder="Period (e.g. 2023 - Present)"
                    />
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                      className="bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none md:col-span-2"
                      placeholder="Description"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-300">Contact Messages</h2>
              </div>
              {(!localData.messages || localData.messages.length === 0) ? (
                <div className="text-center py-12 text-gray-500 border border-gray-800 rounded-xl border-dashed">
                  No messages yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {[...localData.messages].reverse().map(msg => (
                    <div key={msg.id} className="glass-panel p-6 rounded-xl border border-gray-800 relative group">
                      <button onClick={() => handleRemoveMessage(msg.id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-[#00FFAB]">{msg.name}</h3>
                        <a href={`mailto:${msg.email}`} className="text-sm text-gray-400 hover:text-white transition-colors">{msg.email}</a>
                        <p className="text-xs text-gray-500 mt-1">{new Date(msg.date).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                        <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
