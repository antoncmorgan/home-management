import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { FoodItem } from '../models/foodItem';

export async function addFoodItem(item: Omit<FoodItem, 'id'>): Promise<FoodItem> {
  const id = uuidv4();
  await db.run(
    'INSERT INTO food_items (id, name, category, quantity, notes, family_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, item.name, item.category || null, item.quantity || null, item.notes || null, item.familyId, item.userId]
  );
  return { ...item, id };
}

export async function getFoodItem(id: string): Promise<FoodItem | null> {
  const fi = await db.get('SELECT * FROM food_items WHERE id = ?', [id]);
  if (!fi) {
    return null;
  }
  return {
    id: fi.id,
    name: fi.name,
    category: fi.category,
    quantity: fi.quantity,
    notes: fi.notes,
    familyId: fi.family_id,
    userId: fi.user_id,
  };
}

export async function getFoodItems(): Promise<FoodItem[]> {
  const rows = await db.all('SELECT * FROM food_items');
  return rows.map((fi: any) => ({
    id: fi.id,
    name: fi.name,
    category: fi.category,
    quantity: fi.quantity,
    notes: fi.notes,
    familyId: fi.family_id,
    userId: fi.user_id,
  }));
}

export async function getFoodItemsForFamily(familyId: string): Promise<FoodItem[]> {
  const rows = await db.all('SELECT * FROM food_items WHERE family_id = ?', [familyId]);
  return rows.map((fi: any) => ({
    id: fi.id,
    name: fi.name,
    category: fi.category,
    quantity: fi.quantity,
    notes: fi.notes,
    familyId: fi.family_id,
    userId: fi.user_id,
  }));
}

export async function updateFoodItem(id: string, updates: Partial<Omit<FoodItem, 'id'>>): Promise<FoodItem | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.category !== undefined) {
    fields.push('category = ?');
    values.push(updates.category);
  }
  if (updates.quantity !== undefined) {
    fields.push('quantity = ?');
    values.push(updates.quantity);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.familyId !== undefined) {
    fields.push('family_id = ?');
    values.push(updates.familyId);
  }
  if (updates.userId !== undefined) {
    fields.push('user_id = ?');
    values.push(updates.userId);
  }
  if (!fields.length) {
    return null;
  }
  values.push(id);
  const sql = 'UPDATE food_items SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  return getFoodItem(id);
}

export async function deleteFoodItem(id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM food_items WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}
