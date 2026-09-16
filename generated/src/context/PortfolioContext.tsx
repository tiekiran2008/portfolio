import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { defaultData, type PortfolioData } from '../data/portfolio';
import { useAuth } from './AuthContext';
import { isAdmin } from '../lib/adminAuth';
import { loadContent, persistContent, normalizeContent, type EditableContent } from '../lib/portfolioRepository';
export type { Project, Skill, Experience, Message } from '../data/portfolio';

interface PortfolioContextType {
  data: PortfolioData;
  loading: boolean;
  loadError: string | null;
  revision: number | null;
  reloadData: () => Promise<void>;
  saveData: (draft: EditableContent, expectedRevision: number) => Promise<void>;
  updateData: (next: Partial<PortfolioData> | ((prev: PortfolioData) => Partial<PortfolioData>)) => void;
  isTerminalMode: boolean;
  toggleTerminalMode: () => void;
}
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);
export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [data, setData] = useState<PortfolioData>({ ...defaultData, ...normalizeContent(defaultData) });
  const [revision, setRevision] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const generation = useRef(0);
  const applySnapshot = useCallback((snapshot: Awaited<ReturnType<typeof loadContent>>) => {
    setData(prev => ({ ...prev, ...snapshot.content }));
    setRevision(snapshot.revision);
  }, []);
  const reloadData = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    try {
      const snapshot = await loadContent();
      if (current === generation.current) { applySnapshot(snapshot); setLoadError(null); }
    } catch (error) {
      if (current === generation.current) setLoadError(error instanceof Error ? error.message : 'Unable to load content.');
      throw error;
    } finally { if (current === generation.current) setLoading(false); }
  }, [applySnapshot]);
  useEffect(() => {
    void reloadData().catch(() => {});
    const refresh = () => { if (document.visibilityState === 'visible') void reloadData().catch(() => {}); };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    document.addEventListener('visibilitychange', refresh);
    // Poll public content as a fallback without requiring a Realtime publication.
    const timer = window.setInterval(refresh, 30000);
    return () => { ++generation.current; clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('online', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [reloadData]);
  useEffect(() => {
    let active = true;
    setData(prev => ({ ...prev, messages: [] }));
    if (supabaseConfigured && isAdmin(session)) {
      void supabase.from('messages').select('*').then(({ data: messages, error }) => {
        if (active && !error) setData(prev => ({ ...prev, messages: messages ?? [] }));
      });
    }
    return () => { active = false; };
  }, [session?.user.id]);
  const saveData = useCallback(async (draft: EditableContent, expectedRevision: number) => {
    ++generation.current; // Discard reads started before this write.
    setLoading(false);
    const snapshot = await persistContent(draft, expectedRevision);
    applySnapshot(snapshot); // Server-returned content, never an optimistic draft.
    try { await reloadData(); }
    catch { throw new Error('Saved in Supabase, but the verification reload failed. Your saved data is retained; use Reload saved content before editing again.'); }
  }, [applySnapshot, reloadData]);
  // Used by the existing contact form/messages UI only. Public edits must use saveData.
  const updateData: PortfolioContextType['updateData'] = next => setData(prev => {
    const patch = typeof next === 'function' ? next(prev) : next;
    return { ...prev, messages: patch.messages ?? prev.messages };
  });
  useEffect(() => {
    setIsTerminalMode(localStorage.getItem('terminalMode') === 'true');
  }, []);
  useEffect(() => { document.body.classList.toggle('terminal-mode', isTerminalMode); }, [isTerminalMode]);
  const toggleTerminalMode = () => setIsTerminalMode(prev => { localStorage.setItem('terminalMode', String(!prev)); return !prev; });
  return <PortfolioContext.Provider value={{ data, loading, loadError, revision, reloadData, saveData, updateData, isTerminalMode, toggleTerminalMode }}>{children}</PortfolioContext.Provider>;
};
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
