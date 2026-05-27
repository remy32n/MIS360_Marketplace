import axios from 'axios';

const TOKEN_KEY = 'fs_auth_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 interceptor — clear local state and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const publicPaths = ['/login', '/signup'];
    if (err.response?.status === 401 && !publicPaths.includes(window.location.pathname)) {
      tokenStore.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  signup: (data: any) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
};

export const listingsAPI = {
  getAll: (params?: any) => api.get('/listings', { params }),
  getMine: () => api.get('/listings/mine'),
  getById: (id: string) => api.get(`/listings/${id}`),
  create: (data: any) => api.post('/listings', data),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  remove: (id: string) => api.delete(`/listings/${id}`),
  updateStatus: (id: string, status: string, reason?: string) => api.patch(`/listings/${id}/status`, { status, reason }),
  getPending: () => api.get('/listings/admin/pending'),
  getAllAdmin: (params?: any) => api.get('/listings/admin/all', { params }),
};

export const orgsAPI = {
  getAll: () => api.get('/orgs'),
  updateStatus: (id: string, status: string) => api.patch(`/orgs/${id}/verify`, { status }),
};

export const engagementAPI = {
  getSaved: () => api.get('/engagement/saved'),
  saveListing: (listingId: string) => api.post('/engagement/saved', { listingId }),
  unsaveListing: (savedId: string) => api.delete(`/engagement/saved/${savedId}`),
  getNotifications: (params?: any) => api.get('/engagement/notifications', { params }),
  markRead: (id: string) => api.patch(`/engagement/notifications/${id}/read`),
  markAllRead: () => api.patch('/engagement/notifications/read-all'),
  getStats: () => api.get('/engagement/stats'),
};

export default api;