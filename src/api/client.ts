import axios, { InternalAxiosRequestConfig } from 'axios';
import { toast } from '../components/ui/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('seller_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Auto-display backend success message on mutations (POST, PATCH, PUT, DELETE)
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const msg =
        response.data?.message ||
        response.data?.data?.message ||
        response.data?.msg ||
        response.data?.data?.msg;
      if (msg && typeof msg === 'string') {
        toast.success(msg);
      }
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const rawMessage =
      error.response?.data?.message ||
      error.response?.data?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    const message = Array.isArray(rawMessage) ? rawMessage.join('. ') : String(rawMessage);

    // Show toast with exact backend message
    toast.error(message);

    if (status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/register')) {
      const loginPath = `${import.meta.env.BASE_URL || '/'}login`.replace(/\/+/g, '/');
      const registerPath = `${import.meta.env.BASE_URL || '/'}register`.replace(/\/+/g, '/');

      const refreshToken = localStorage.getItem('seller_refresh_token');
      if (refreshToken && !error.config?._retry && !error.config?.url?.includes('/auth/refresh')) {
        error.config._retry = true;
        try {
          return axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }).then((res) => {
            const data = res.data?.data || res.data;
            const newAccessToken = data?.tokens?.accessToken;
            if (newAccessToken) {
              localStorage.setItem('seller_token', newAccessToken);
              if (data?.tokens?.refreshToken) {
                localStorage.setItem('seller_refresh_token', data.tokens.refreshToken);
              }
              error.config.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(error.config);
            }
          }).catch(() => {
            localStorage.removeItem('seller_token');
            localStorage.removeItem('seller_refresh_token');
            localStorage.removeItem('seller_user');
            if (window.location.pathname !== loginPath && window.location.pathname !== registerPath) {
              window.location.href = loginPath;
            }
          });
        } catch {
          // fallback to logout
        }
      }

      localStorage.removeItem('seller_token');
      localStorage.removeItem('seller_refresh_token');
      localStorage.removeItem('seller_user');
      if (window.location.pathname !== loginPath && window.location.pathname !== registerPath) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
