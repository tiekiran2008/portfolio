import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { getAuthState, subscribeAuth, signOut } from '../lib/adminAuth';

const AuthContext = createContext<ReturnType<typeof getAuthState> | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useSyncExternalStore(subscribeAuth, getAuthState);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return { ...context, user: context.session?.user ?? null, signOut };
};
