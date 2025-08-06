import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { Dish } from '../models/dish';

export async function addDish(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> {
  const id = uuidv4();
  const now = new Date();
  await db.run(
    'INSERT INTO dishes (id, name, dish_type, image_url, ingredients, cook_time, recipe, description, family_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [id, dish.name, dish.dishType, dish.imageUrl || null, JSON.stringify(dish.ingredients), dish.cookTime || null, dish.recipe || null, dish.description || null, dish.familyId, dish.userId]
  );
  return {
    ...dish,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getDish(id: string): Promise<Dish | null> {
  const d = await db.get('SELECT * FROM dishes WHERE id = ?', [id]);
  if (!d) {
    return null;
  }
  return {
    id: d.id,
    name: d.name,
    dishType: d.dish_type,
    imageUrl: d.image_url,
    ingredients: JSON.parse(d.ingredients),
    cookTime: d.cook_time,
    recipe: d.recipe,
    description: d.description,
    familyId: d.family_id,
    userId: d.user_id,
    createdAt: d.created_at ? new Date(d.created_at) : undefined,
    updatedAt: d.updated_at ? new Date(d.updated_at) : undefined,
  };
}

export async function getDishesForFamily(familyId: string): Promise<Dish[]> {
  const rows = await db.all('SELECT * FROM dishes WHERE family_id = ?', [familyId]);
  return rows.map((d: any) => ({
    id: d.id,
    name: d.name,
    dishType: d.dish_type,
    imageUrl: d.image_url,
    ingredients: JSON.parse(d.ingredients),
    cookTime: d.cook_time,
    recipe: d.recipe,
    description: d.description,
    familyId: d.family_id,
    userId: d.user_id,
    createdAt: d.created_at ? new Date(d.created_at) : undefined,
    updatedAt: d.updated_at ? new Date(d.updated_at) : undefined,
  }));
}

export async function updateDish(id: string, updates: Partial<Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Dish | null> {
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
  if (updates.dishType !== undefined) {
    fields.push('dish_type = ?');
    values.push(updates.dishType);
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
  const sql = 'UPDATE dishes SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  return getDish(id);
}

export async function deleteDish(id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM dishes WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}
