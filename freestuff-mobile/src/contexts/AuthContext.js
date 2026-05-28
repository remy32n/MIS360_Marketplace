import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          const data = await authAPI.getMe(storedToken);
          setUser(data.user);
          setOrg(data.org || null);
          setToken(storedToken);
        }
      } catch (err) {
        await AsyncStorage.removeItem('auth_token');
        setUser(null);
        setOrg(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    rehydrate();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    await AsyncStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setOrg(data.org || null);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setOrg(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      org,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin:   user?.role === 'ADMIN',
      isOrg:     user?.role === 'ORG',
      isStudent: user?.role === 'STUDENT',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
