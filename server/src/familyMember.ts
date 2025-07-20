// FamilyMember model for the backend
// This model is separate from the authenticated user model
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { addFamilyMemberDB, getFamilyMembersDB, updateFamilyMemberDB, deleteFamilyMemberDB } from './store/familyMemberStore';

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  avatar?: string;
  calendarId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new family member in the DB
export async function addFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> {
  const id = uuidv4();
  const now = new Date();
  const newMember: FamilyMember = {
    ...member,
    id,
    createdAt: now,
    updatedAt: now,
  };
  await addFamilyMemberDB(db, {
    id,
    familyId: member.familyId,
    name: member.name,
    avatar: member.avatar,
    calendarId: member.calendarId,
  });
  return newMember;
}

// Get all family members for a family from the DB
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const dbMembers = await getFamilyMembersDB(db, familyId);
  return dbMembers.map((m: any) => ({
    id: m.id,
    familyId: m.family_id,
    name: m.name,
    avatar: m.avatar,
    calendarId: m.calendar_id,
    createdAt: m.created_at ? new Date(m.created_at) : new Date(0),
    updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(0),
  }));
}

// Update a family member in the DB
export async function updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> {
  return updateFamilyMemberDB(db, id, updates);
}

// Delete a family member from the DB
export async function deleteFamilyMember(id: string): Promise<boolean> {
  return await deleteFamilyMemberDB(db, id);
}
