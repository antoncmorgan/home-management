import { apiGet, apiPost, apiPut, apiDelete } from './api';

const API_BASE = '/api/families';

export async function listFamilies(): Promise<any[]> {
  const res = await apiGet<any[]>(API_BASE);
  return res.data;
}

export async function updateFamily(id: string, updates: Partial<any>): Promise<any> {
  const res = await apiPut<any>(`${API_BASE}/${id}`, updates);
  return res.data;
}

export async function createFamily(family: any): Promise<any> {
  const res = await apiPost<any>(API_BASE, family);
  return res.data;
}

export async function deleteFamily(id: string): Promise<void> {
  await apiDelete(`${API_BASE}/${id}`);
}
