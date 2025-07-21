import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { FamilyMember } from '../models/familyMember';

export async function addFamilyMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> {
  const id = uuidv4();
  const now = new Date();
  await db.run(
    'INSERT INTO family_members (id, family_id, user_id, name, avatar, calendar_id, email, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [id, member.familyId, member.userId, member.name, member.avatar || null, member.calendarId || null, member.email || null, member.color || null]
  );
  return {
    ...member,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getFamilyMembers(familyId: string | undefined, userId: number): Promise<FamilyMember[]> {
  let dbMembers;
  if (familyId) {
    dbMembers = await db.all('SELECT * FROM family_members WHERE family_id = ? AND user_id = ?', [familyId, userId]);
  } else {
    dbMembers = await db.all('SELECT * FROM family_members WHERE user_id = ?', [userId]);
  }
  return dbMembers.map((m: any) => ({
    id: m.id,
    familyId: m.family_id,
    userId: m.user_id,
    name: m.name,
    avatar: m.avatar,
    calendarId: m.calendar_id,
    email: m.email,
    color: m.color,
    createdAt: m.created_at ? new Date(m.created_at) : new Date(0),
    updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(0),
  }));
}

export async function updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.avatar !== undefined) {
    fields.push('avatar = ?');
    values.push(updates.avatar);
  }
  if (updates.calendarId !== undefined) {
    fields.push('calendar_id = ?');
    values.push(updates.calendarId);
  }
  if (updates.email !== undefined) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  if (!fields.length) return null;
  fields.push('updated_at = datetime(\'now\')');
  values.push(id);
  const sql = 'UPDATE family_members SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  const m = await db.get('SELECT * FROM family_members WHERE id = ?', [id]);
  if (!m) return null;
  return {
    id: m.id,
    familyId: m.family_id,
    userId: m.user_id,
    name: m.name,
    avatar: m.avatar,
    calendarId: m.calendar_id,
    email: m.email,
    color: m.color,
    createdAt: m.created_at ? new Date(m.created_at) : new Date(0),
    updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(0),
  };
}

export async function deleteFamilyMember(id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM family_members WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}
