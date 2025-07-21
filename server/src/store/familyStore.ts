
import { db } from '../db';
import { Family } from '../models/family';

export async function createFamily(family: Family): Promise<void> {
  await db.run(
    `INSERT INTO families (
      id, user_id, display_name, primary_email, address_street, address_city, address_state, address_zip, phone_number, timezone, notes, photo_url, invite_code, settings_json, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    family.id,
    family.user_id,
    family.display_name,
    family.primary_email,
    family.address_street,
    family.address_city,
    family.address_state,
    family.address_zip,
    family.phone_number,
    family.timezone,
    family.notes,
    family.photo_url,
    family.invite_code,
    family.settings_json,
    family.is_active ?? 1
  );
}

export async function getFamilyById(id: string): Promise<Family | undefined> {
  return db.get<Family>(`SELECT * FROM families WHERE id = ?`, id);
}

export async function updateFamily(id: string, updates: Partial<Family>): Promise<void> {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  if (!fields) return;
  await db.run(
    `UPDATE families SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    ...values,
    id
  );
}

export async function deleteFamily(id: string): Promise<void> {
  await db.run(`DELETE FROM families WHERE id = ?`, id);
}

export async function listFamilies(userId?: number): Promise<Family[]> {
  if (userId) {
    return db.all<Family[]>(`SELECT * FROM families WHERE user_id = ?`, userId);
  }
  return [];
}
