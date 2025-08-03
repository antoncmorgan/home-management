import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Meal } from '../models/meal';

export async function addMeal(meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> {
  const id = uuidv4();
  const now = new Date();
  await db.run(
    'INSERT INTO meals (id, name, type, image_url, ingredients, cook_time, recipe, description, family_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [id, meal.name, meal.type, meal.imageUrl || null, JSON.stringify(meal.ingredients), meal.cookTime || null, meal.recipe || null, meal.description || null, meal.familyId, meal.userId]
  );
  return {
    ...meal,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getMeal(id: string): Promise<Meal | null> {
  const m = await db.get('SELECT * FROM meals WHERE id = ?', [id]);
  if (!m) return null;
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    imageUrl: m.image_url,
    ingredients: JSON.parse(m.ingredients),
    cookTime: m.cook_time,
    recipe: m.recipe,
    description: m.description,
    familyId: m.family_id,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  };
}

// Get meals for a family, optionally filtered by memberId
export async function getMealsForFamily(familyId: string, memberId?: string): Promise<Meal[]> {
  let sql = 'SELECT * FROM meals WHERE family_id = ?';
  const params: any[] = [familyId];
  if (memberId) {
    sql += ' AND id IN (SELECT meal_id FROM meal_plans WHERE member_id = ?)';
    params.push(memberId);
  }
  const rows = await db.all(sql, params);
  return rows.map((m: any) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    imageUrl: m.image_url,
    ingredients: JSON.parse(m.ingredients),
    cookTime: m.cook_time,
    recipe: m.recipe,
    description: m.description,
    familyId: m.family_id,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  }));
}

export async function updateMeal(id: string, updates: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meal | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.familyId !== undefined) {
    fields.push('family_id = ?');
    values.push(updates.familyId);
  }
  if (updates.userId !== undefined) {
    fields.push('user_id = ?');
    values.push(updates.userId);
  }
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.imageUrl !== undefined) {
    fields.push('image_url = ?');
    values.push(updates.imageUrl);
  }
  if (updates.ingredients !== undefined) {
    fields.push('ingredients = ?');
    values.push(JSON.stringify(updates.ingredients));
  }
  if (updates.cookTime !== undefined) {
    fields.push('cook_time = ?');
    values.push(updates.cookTime);
  }
  if (updates.recipe !== undefined) {
    fields.push('recipe = ?');
    values.push(updates.recipe);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (!fields.length) return null;
  fields.push('updated_at = datetime(\'now\')');
  values.push(id);
  const sql = 'UPDATE meals SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  return getMeal(id);
}

export async function deleteMeal(id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM meals WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}
