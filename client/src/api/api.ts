import axios from 'axios';
import authApi from './authApi';

import { useAuthStore } from '../store/authStore';

function withAuth(config: any = {}): any {
  const authStore = useAuthStore();
  config = { ...config, withCredentials: true };
  if (authStore.token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer ' + authStore.token;
  }
  return config;
}

export const API_BASE_URL = 'http://localhost:3001';

export function apiPost<T = any>(path: string, data?: any, useAuth = true) {
  const config: any = useAuth ? withAuth() : {};
  if (useAuth) {
    return authApi.post<T>(path, data, config);
  }
  return axios.post<T>(`${API_BASE_URL}${path}`, data, config);
}

export function apiGet<T = any>(path: string, useAuth = true) {
  const config: any = useAuth ? withAuth() : {};
  if (useAuth) {
    return authApi.get<T>(path, config);
  }
  return axios.get<T>(`${API_BASE_URL}${path}`, config);
}

export function apiPut<T = any>(path: string, data?: any, useAuth = true) {
  const config: any = useAuth ? withAuth() : {};
  if (useAuth) {
    return authApi.put<T>(path, data, config);
  }
  return axios.put<T>(`${API_BASE_URL}${path}`, data, config);
}

export function apiDelete<T = any>(path: string, useAuth = true) {
  const config: any = useAuth ? withAuth() : {};
  if (useAuth) {
    return authApi.delete<T>(path, config);
  }
  return axios.delete<T>(`${API_BASE_URL}${path}`, config);
}

export function apiRedirect(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
  window.location.href = `${base}${path}`;
}