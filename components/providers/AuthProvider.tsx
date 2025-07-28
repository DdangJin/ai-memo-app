'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/use-auth';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  error: any;
  signUp: any;
  signIn: any;
  signOut: any;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
