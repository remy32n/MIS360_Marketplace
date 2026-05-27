import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export function getApiUrl(): string {
  return BASE_URL;
}

async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    }
    return await SecureStore.getItemAsync('auth_token');
  } catch {
    return null;
  }
}

export async function apiRequest<T = any>(method: string, path: string, data?: any): Promise<T> {
  const token = await getToken();
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const response = await axios({
    method: method as any,
    url,
    data,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.data;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => apiRequest('GET', queryKey[0] as string),
      staleTime: 30_000,
      retry: 1,
    },
  },
});
