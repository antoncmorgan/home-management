// src/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export function apiPost<T = any>(path: string, data?: any) {
  return axios.post<T>(`${API_BASE_URL}${path}`, data);
}


// Helper for browser redirects to API endpoints
export function apiRedirect(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
  window.location.href = `${base}${path}`;
}

export function apiGet<T = any>(path: string, token?: string) {
  return axios.get<T>(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
