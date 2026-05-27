import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'ORG' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  orgId?: string;
  orgName?: string;
  orgType?: string;
  isVerified?: boolean;
  verificationStatus?: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  accountType: 'STUDENT' | 'ORG';
  orgName?: string;
  orgType?: string;
  contactEmail?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isOrg: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; }
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
  try { await SecureStore.deleteItemAsync(TOKEN_KEY); } catch {}
}

function mergeUserOrg(rawUser: any, org: any): User {
  return {
    id: rawUser.id,
    email: rawUser.email,
    role: rawUser.role,
    firstName: rawUser.firstName,
    lastName: rawUser.lastName,
    orgId: org?.id,
    orgName: org?.orgName,
    orgType: org?.orgType,
    verificationStatus: org?.verificationStatus,
    isVerified: org?.verificationStatus === 'VERIFIED',
  };
}

export { getToken };

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
        setUser(mergeUserOrg(data.user ?? data, data.org ?? null));
      } catch {
        await removeToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<{ user: User }> => {
    const data = await apiRequest<any>('POST', '/api/auth/login', { email, password });
    await setToken(data.token);
    const merged = mergeUserOrg(data.user, data.org ?? null);
    setUser(merged);
    return { user: merged };
  };

  const signup = async (payload: SignupData) => {
    await apiRequest('POST', '/api/auth/signup', payload);
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
