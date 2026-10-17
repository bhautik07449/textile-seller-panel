import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './api_constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dt_admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dt_admin_token');
      localStorage.removeItem('dt_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const serverCall = async <T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  return axiosInstance({
    url,
    method,
    data: method !== 'GET' ? data : undefined,
    params: method === 'GET' ? data : undefined,
    ...config,
  });
};

export default axiosInstance;
