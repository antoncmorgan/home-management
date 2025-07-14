// src/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export function apiPost<T = any>(path: string, data?: any) {
  return axios.post<T>(`${API_BASE_URL}${path}`, data);
}

// You can add more helpers (get, put, delete) as needed
