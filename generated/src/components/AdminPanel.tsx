import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio, Project, Skill, Experience } from '../context/PortfolioContext';
import { Plus, Trash2, Save, X, LogOut, Upload, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { normalizeContent, uploadAsset } from '../lib/portfolioRepository';
import type { PortfolioData } from '../data/portfolio';
import { signOut } from '../lib/adminAuth';

export const AdminPanel: React.FC = () => {
  const { data, updateData, saveData, reloadData, loading, loadError, revision } = usePortfolio();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'skills' | 'certificates' | 'resume' | 'experience' | 'messages'>('skills');
  const [localData, setDraft] = useState(data);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const [baseRevision, setBaseRevision] = useState<number | null>(revision);
  const setLocalData: React.Dispatch<React.SetStateAction<PortfolioData>> = next => {
    setDirty(true); setStatus(''); setDraft(next);
  };

  useEffect(() => {
    if (!dirty && !saving && !uploading) { setDraft(data); setBaseRevision(revision); }
  }, [data, revision, dirty, saving, uploading]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      alert('Unable to sign out. Please try again.');
    }
  };

  const handleSave = async () => {
    if (baseRevision === null || saving || uploading) return;
    setSaving(true); setSaveError(''); setStatus('');
    try {
      await saveData(localData, baseRevision);
      setDirty(false);
      setStatus('Saved to Supabase. Portfolio updated.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Save failed. Your draft has been kept.');
    } finally { setSaving(false); }
  };

  const handleReload = async () => {
    if (dirty && !window.confirm('Discard unsaved edits and reload saved content?')) return;
    try { await reloadData(); setDirty(false); setSaveError(''); setStatus('Saved content reloaded.'); }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Reload failed.'); }
  };

  const importPreviousEdits = () => {
    try {
      const stored = localStorage.getItem('portfolioData_v4');
      if (!stored) { setSaveError('No previous browser-only edits were found in this browser.'); return; }
      const legacy = JSON.parse(stored);
      if (!window.confirm('Load previous browser-only projects, skills and experience into this draft? Review them, then Save Changes to publish.')) return;
      setLocalData(prev => ({ ...prev, ...normalizeContent({ ...prev, projects: legacy.projects ?? prev.projects, skills: legacy.skills ?? prev.skills, experience: legacy.experience ?? prev.experience }) }));
      setStatus('Previous edits loaded into your draft. Review them before saving to Supabase.');
    } catch { setSaveError('Previous browser-only edits could not be read.'); }
  };

  const handleAsset = async (file: File | undefined, certificateId?: string) => {
    if (!file) return;
    setUploading(true); setSaveError('');
    try {
      const url = await uploadAsset(file, certificateId ? 'certificate' : 'resume');
      setLocalData(prev => certificateId
        ? { ...prev, certificates: prev.certificates.map(row => row.id === certificateId ? { ...row, image: url } : row) }
        : { ...prev, resumeUrl: url });
      setStatus('Upload complete. Click Save Changes to publish it.');
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: 'New Project',
      description: 'Project description',
      techStack: ['React'],
      demoLink: '',
      githubLink: ''
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
          if (field === 'techStack' || field === 'features') {
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
    const newSkill: Skill = { id: crypto.randomUUID(), name: 'New Skill', category: 'Category' };
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
      id: crypto.randomUUID(),
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, type: 'projects' | 'experience', field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (type === 'projects') {
        handleProjectChange(id, field as keyof Project, base64String);
      } else {
        handleExperienceChange(id, field as keyof Experience, base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id).select('id').single();
    if (error) { setSaveError(`Message deletion failed: ${error.message}`); return; }
    const messages = localData.messages.filter(message => message.id !== id);
    setDraft(prev => ({ ...prev, messages }));
    updateData({ messages });
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white p-6 sm:p-12 font-sans relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-[#00FFAB] font-mono">&gt; ADMIN_PANEL</h1>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleSignOut} className="px-4 py-2 rounded-md border border-gray-700 hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> SIGN_OUT
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 rounded-md border border-gray-700 hover:border-white transition-colors flex items-center gap-2">
              <X className="w-4 h-4" /> CLOSE
            </button>
            <button disabled={saving || uploading || loading || baseRevision === null || !!loadError} onClick={handleSave} className="px-4 py-2 rounded-md bg-[#00FFAB] text-black font-bold hover:bg-[#00FFFF] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,171,0.3)]">
              <Save className="w-4 h-4" /> {saving ? 'SAVING...' : 'SAVE_CHANGES'}
            </button>
          </div>
        </div>

        {(saveError || loadError) && <p role="alert" className="mb-4 p-4 border border-red-500/30 rounded-xl text-red-400 break-words">{saveError || loadError}</p>}
        {status && <p role="status" className="mb-4 text-[#00FFAB]">{status}</p>}
        {dirty && <p className="text-sm text-gray-400 mb-3">You have unsaved changes.</p>}
        <button type="button" disabled={saving || uploading} onClick={handleReload} className="mb-6 px-4 py-2 border border-gray-700 rounded">Reload saved content</button>
<button type="button" disabled={saving || uploading || baseRevision === null} onClick={importPreviousEdits} className="mb-6 ml-3 px-4 py-2 border border-gray-700 rounded">Import previous browser-only edits</button>
        <fieldset disabled={saving || uploading || baseRevision === null} className="min-w-0">
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4 overflow-x-auto">
          {(['skills', 'projects', 'certificates', 'resume', 'experience', 'messages'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md font-mono uppercase transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-[#00FFAB]/20 text-[#00FFAB] border border-[#00FFAB]' 
                  : 'text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {tab === 'skills' ? 'Skills & Tools' : tab} {tab === 'messages' && localData.messages?.length > 0 && `(${localData.messages.length})`}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'resume' && <div className="glass-panel p-6 rounded-xl border border-gray-800 space-y-4">
            <h2 className="text-xl font-bold">Resume</h2>
            <label className="block">Resume URL
              <input type="url" value={localData.resumeUrl} onChange={e => setLocalData(prev => ({ ...prev, resumeUrl: e.target.value }))} placeholder="https://.../resume.pdf" className="mt-2 w-full bg-black/50 border border-gray-700 rounded p-3" />
            </label>
            <label className="block text-[#00FFAB]">Upload PDF (maximum 5 MB)
              <input type="file" accept="application/pdf,.pdf" onChange={e => { void handleAsset(e.target.files?.[0]); e.target.value = ''; }} className="block mt-2 max-w-full text-gray-300" />
            </label>
            <p className="text-sm text-gray-400">Click Save Changes after uploading or editing the URL. The PDF will be public on your portfolio.</p>
            <button onClick={() => setLocalData(prev => ({ ...prev, resumeUrl: '' }))} className="text-red-400">Remove resume link</button>
          </div>}
          {activeTab === 'certificates' && <>
            <div className="flex justify-between gap-4"><h2 className="text-xl font-bold">Certificates</h2>
              <button onClick={() => setLocalData(prev => ({ ...prev, certificates: [...prev.certificates, { id: crypto.randomUUID(), name: 'New Certificate', description: '', skills: [], issuer: '', date: '', image: '', credentialUrl: '' }] }))} className="text-[#00FFAB]">+ Add Certificate</button>
            </div>
            {localData.certificates.map(certificate => <div key={certificate.id} className="glass-panel p-6 rounded-xl border border-gray-800 space-y-4">
              <button aria-label={`Delete ${certificate.name}`} onClick={() => setLocalData(prev => ({ ...prev, certificates: prev.certificates.filter(row => row.id !== certificate.id) }))} className="text-red-400">Delete</button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['name', 'issuer', 'date', 'image', 'credentialUrl'] as const).map(field => <label key={field} className="block text-sm min-w-0">{({ name: 'Certificate name', issuer: 'Issuer', date: 'Date', image: 'Image URL', credentialUrl: 'Credential link' })[field]}
                  <input value={certificate[field] ?? ''} onChange={e => setLocalData(prev => ({ ...prev, certificates: prev.certificates.map(row => row.id === certificate.id ? { ...row, [field]: e.target.value } : row) }))} className="mt-2 w-full bg-black/50 border border-gray-700 rounded p-3" />
                </label>)}
                <label className="block text-sm sm:col-span-2">Description
                  <textarea rows={4} value={certificate.description ?? ''} onChange={e => setLocalData(prev => ({ ...prev, certificates: prev.certificates.map(row => row.id === certificate.id ? { ...row, description: e.target.value } : row) }))} className="mt-2 w-full bg-black/50 border border-gray-700 rounded p-3 resize-y" />
                </label>
                <label className="block text-sm sm:col-span-2">Skills / Technologies learned (one per line)
                  <textarea rows={3} value={(certificate.skills ?? []).join('\n')} onChange={e => setLocalData(prev => ({ ...prev, certificates: prev.certificates.map(row => row.id === certificate.id ? { ...row, skills: e.target.value.split('\n') } : row) }))} placeholder={'React\nTypeScript'} className="mt-2 w-full bg-black/50 border border-gray-700 rounded p-3 resize-y" />
                </label>
                <label className="block text-sm">Upload thumbnail (maximum 5 MB)
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void handleAsset(e.target.files?.[0], certificate.id); e.target.value = ''; }} className="block mt-2 max-w-full" />
                </label>
              </div>
            </div>)}
          </>}

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
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black/30 p-4 rounded border border-gray-800">
                      <div className="flex-1 w-full">
                        <label className="text-xs text-gray-500 mb-1 block">Project Image URL (or upload)</label>
                        <input
                          type="text"
                          value={project.image || ''}
                          onChange={(e) => handleProjectChange(project.id, 'image', e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">OR</span>
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-[#00FFAB] rounded transition-colors whitespace-nowrap border border-gray-700">
                          <Upload className="w-4 h-4" />
                          <span>Upload Base64</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, project.id, 'projects', 'image')}
                          />
                        </label>
                      </div>
                      {project.image && (
                        <div className="w-12 h-12 rounded border border-gray-700 overflow-hidden shrink-0 bg-black/50 flex items-center justify-center">
                          <img src={project.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <label className="md:col-span-2 text-sm">Features (comma separated)
                      <input value={(project.features ?? []).join(', ')} onChange={e => handleProjectChange(project.id, 'features', e.target.value)} className="mt-2 w-full bg-black/50 border border-gray-700 rounded p-2" />
                    </label>
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
                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black/30 p-4 rounded border border-gray-800">
                      <div className="flex-1 w-full">
                        <label className="text-xs text-gray-500 mb-1 block">Company Logo URL (or upload)</label>
                        <input
                          type="text"
                          value={exp.logo || ''}
                          onChange={(e) => handleExperienceChange(exp.id, 'logo', e.target.value)}
                          className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-[#00FFAB] outline-none"
                          placeholder="Logo URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">OR</span>
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-[#00FFAB] rounded transition-colors whitespace-nowrap border border-gray-700">
                          <Upload className="w-4 h-4" />
                          <span>Upload Base64</span>
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, exp.id, 'experience', 'logo')}
                          />
                        </label>
                      </div>
                      {exp.logo && (
                        <div className="w-12 h-12 rounded border border-gray-700 overflow-hidden shrink-0 bg-white flex items-center justify-center p-1">
                          {exp.logo.startsWith('data:application/pdf') ? (
                            <span className="text-[10px] text-black font-bold">PDF</span>
                          ) : (
                            <img src={exp.logo} alt="Preview" className="w-full h-full object-contain" />
                          )}
                        </div>
                      )}
                    </div>
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
        </fieldset>
      </div>
    </div>
  );
};
