import { FamilyMember } from '../models/FamilyMember';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const API_BASE = '/api/family-members';

export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  const res = await apiGet<FamilyMember[]>(API_BASE);
  return res.data;
}

export async function addFamilyMember(member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> {
  const res = await apiPost<FamilyMember>(API_BASE, member);
  return res.data;
}

export async function updateFamilyMember(id: string, member: Partial<FamilyMember>): Promise<FamilyMember> {
  const res = await apiPut<FamilyMember>(`${API_BASE}/${id}`, member);
  return res.data;
}

export async function deleteFamilyMember(id: string): Promise<void> {
  await apiDelete(`${API_BASE}/${id}`);
}
