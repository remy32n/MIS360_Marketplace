import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, tokenStore } from '../services/api';

type UserRole = 'STUDENT' | 'ORG' | 'ADMIN';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface Org {
  id: string;
  orgName: string;
  orgType: string;
  verificationStatus: string;
}

interface AuthContextType {
  user: User | null;
  org: Org | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrg: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ user: User; org: Org | null }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user ?? null);
        setOrg(response.data.org ?? null);
      } catch {
        setUser(null);
        setOrg(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.data.token) {
      tokenStore.set(response.data.token);
    }
    const u = response.data.user ?? response.data;
    const o = response.data.org ?? null;
    setUser(u);
    setOrg(o);
    return { user: u, org: o };
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
      setOrg(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        org,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOrg: user?.role === 'ORG',
        isStudent: user?.role === 'STUDENT',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
