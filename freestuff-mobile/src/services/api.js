import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// On web: use relative path so requests go through the port-5000 proxy → Express on 8080.
// On native: fall back to the env var or localhost.
function getBaseURL() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') {
    // Always use relative path on web — the proxy handles routing to port 8080
    return '';
  }
  return envUrl || 'http://localhost:8080';
}

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  signup: (data) =>
    api.post('/auth/signup', data).then(r => r.data),
  getMe: (token) =>
    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),
  lookupEmail: (email) =>
    api.post('/auth/lookup-email', { email }).then(r => r.data),
  resetPassword: (email, newPassword) =>
    api.post('/auth/reset-password', { email, newPassword }).then(r => r.data),
};

export const listingsAPI = {
  getAll:       (params) => api.get('/listings', { params }).then(r => r.data),
  getById:      (id) => api.get(`/listings/${id}`).then(r => r.data),
  create:       (data) => api.post('/listings', data).then(r => r.data),
  update:       (id, data) => api.put(`/listings/${id}`, data).then(r => r.data),
  remove:       (id) => api.delete(`/listings/${id}`).then(r => r.data),
  updateStatus: (id, status, reason) =>
    api.patch(`/listings/${id}/status`, { status, reason }).then(r => r.data),
  getPending:   () => api.get('/listings/admin/pending').then(r => r.data),
  getAllAdmin:   (params) => api.get('/listings/admin/all', { params }).then(r => r.data),
  getMyListings:() => api.get('/listings/mine').then(r => r.data),
};

export const engagementAPI = {
  getSaved:         () => api.get('/engagement/saved').then(r => r.data),
  saveListing:      (listingId) => api.post('/engagement/saved', { listingId }).then(r => r.data),
  unsaveListing:    (savedId) => api.delete(`/engagement/saved/${savedId}`).then(r => r.data),
  getNotifications: (params) => api.get('/engagement/notifications', { params }).then(r => r.data),
  markRead:         (id) => api.patch(`/engagement/notifications/${id}/read`).then(r => r.data),
  markAllRead:      () => api.patch('/engagement/notifications/read-all').then(r => r.data),
  getStats:         () => api.get('/engagement/stats').then(r => r.data),
};

export const usersAPI = {
  verifyOrgStatus: (orgId) => api.get(`/users/verifyOrgStatus/${orgId}`).then(r => r.data),
  getAllOrgs:       () => api.get('/orgs').then(r => r.data),
  updateOrgStatus: (orgId, status) =>
    api.patch(`/orgs/${orgId}/verify`, { status }).then(r => r.data),
};
