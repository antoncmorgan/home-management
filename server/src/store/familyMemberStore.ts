import { Database } from 'sqlite';


export async function addFamilyMemberDB(db: Database, member: { id: string, familyId: string, userId: number, name: string, avatar?: string, calendarId?: string }) {
  await db.run(
    'INSERT INTO family_members (id, family_id, user_id, name, avatar, calendar_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [member.id, member.familyId, member.userId, member.name, member.avatar || null, member.calendarId || null]
  );
}

export async function getFamilyMembersDB(db: Database, familyId: string | undefined, userId: number) {
  if (familyId) {
    return db.all('SELECT * FROM family_members WHERE family_id = ? AND user_id = ?', [familyId, userId]);
  } else {
    return db.all('SELECT * FROM family_members WHERE user_id = ?', [userId]);
  }
}

export async function updateFamilyMemberDB(db: Database, id: string, updates: { name?: string, avatar?: string, calendarId?: string }) {
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
  if (!fields.length) return null;
  fields.push('updated_at = datetime(\'now\')');
  values.push(id);
  const sql = 'UPDATE family_members SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  return db.get('SELECT * FROM family_members WHERE id = ?', [id]);
}

export async function deleteFamilyMemberDB(db: Database, id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM family_members WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}
