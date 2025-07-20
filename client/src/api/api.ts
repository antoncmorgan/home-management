// src/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export function apiPost<T = any>(path: string, data?: any, useAuth = true) {
  return axios.post<T>(`${API_BASE_URL}${path}`, data, {
    headers: useAuth ? getAuthHeaders() : undefined,
  });
}


// Helper for browser redirects to API endpoints
export function apiRedirect(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
  window.location.href = `${base}${path}`;
}

export function apiGet<T = any>(path: string, useAuth = true) {
  return axios.get<T>(`${API_BASE_URL}${path}`, {
    headers: useAuth ? getAuthHeaders() : undefined,
  });
}

export function apiPut<T = any>(path: string, data?: any, useAuth = true) {
  return axios.put<T>(`${API_BASE_URL}${path}`, data, {
    headers: useAuth ? getAuthHeaders() : undefined,
  });
}

export function apiDelete<T = any>(path: string, useAuth = true) {
  return axios.delete<T>(`${API_BASE_URL}${path}`, {
    headers: useAuth ? getAuthHeaders() : undefined,
  });
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
