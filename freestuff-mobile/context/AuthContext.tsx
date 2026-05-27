import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ORG' | 'ADMIN';
  orgId?: string;
  orgName?: string;
}

interface SignupData {
  email: string;
  password: string;
  accountType: 'STUDENT' | 'ORG';
  orgName?: string;
  contactEmail?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isOrg: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, value);
    return;
  }
  return SecureStore.setItemAsync(TOKEN_KEY, value);
}

async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
    return;
  }
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiRequest<any>('GET', '/api/auth/me');
        setUser(data.user ?? data);
      } catch {
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: User }>('POST', '/api/auth/login', { email, password });
    await setToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload: SignupData) => {
    const data = await apiRequest<{ token: string; user: User }>('POST', '/api/auth/signup', payload);
    await setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isStudent: user?.role === 'STUDENT',
        isOrg: user?.role === 'ORG',
        isAdmin: user?.role === 'ADMIN',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
