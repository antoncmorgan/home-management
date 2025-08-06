import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { MealPlan } from '../models/mealPlan';

export async function addMealPlan(plan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
  const id = uuidv4();
  await db.run(
    'INSERT INTO meal_plans (id, date, family_id, member_id, time_of_day, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [id, plan.date, plan.familyId, plan.memberId || null, plan.timeOfDay, plan.userId]
  );
  return {
    ...plan,
    id
  };
}

// Get all meal plans for a family, optionally filtered by memberId
export async function getMealPlansByFamily(familyId: string, memberId?: string): Promise<MealPlan[]> {
  let sql = 'SELECT * FROM meal_plans WHERE family_id = ?';
  const params: any[] = [familyId];
  if (memberId) {
    sql += ' AND member_id = ?';
    params.push(memberId);
  }
  const plans = await db.all(sql, params);
  return plans.map((m: any) => ({
    id: m.id,
    date: m.date,
    familyId: m.family_id,
    memberId: m.member_id,
    timeOfDay: m.time_of_day,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  }));
}

// Get all meal plans for a family and date, optionally filtered by memberId
export async function getMealPlansByFamilyAndDate(familyId: string, date: string, memberId?: string): Promise<MealPlan[]> {
  let sql = 'SELECT * FROM meal_plans WHERE family_id = ? AND date = ?';
  const params: any[] = [familyId, date];
  if (memberId) {
    sql += ' AND member_id = ?';
    params.push(memberId);
  }
  const plans = await db.all(sql, params);
  return plans.map((m: any) => ({
    id: m.id,
    date: m.date,
    familyId: m.family_id,
    memberId: m.member_id,
    timeOfDay: m.time_of_day,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  }));
}

export async function getMealPlan(id: string): Promise<MealPlan | null> {
  const m = await db.get('SELECT * FROM meal_plans WHERE id = ?', [id]);
  if (!m) {
    return null;
  }
  return {
    id: m.id,
    date: m.date,
    familyId: m.family_id,
    memberId: m.member_id,
    timeOfDay: m.time_of_day,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  };
}

export async function getMealPlansByDate(date: string): Promise<MealPlan[]> {
  const plans = await db.all('SELECT * FROM meal_plans WHERE date = ?', [date]);
  return plans.map((m: any) => ({
    id: m.id,
    date: m.date,
    familyId: m.family_id,
    memberId: m.member_id,
    timeOfDay: m.time_of_day,
    userId: m.user_id,
    createdAt: m.created_at ? new Date(m.created_at) : undefined,
    updatedAt: m.updated_at ? new Date(m.updated_at) : undefined,
  }));
}

export async function updateMealPlan(id: string, updates: Partial<Omit<MealPlan, 'id'>>): Promise<MealPlan | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.familyId !== undefined) {
    fields.push('family_id = ?');
    values.push(updates.familyId);
  }
  if (updates.memberId !== undefined) {
    fields.push('member_id = ?');
    values.push(updates.memberId);
  }
  if (updates.timeOfDay !== undefined) {
    fields.push('time_of_day = ?');
    values.push(updates.timeOfDay);
  }
  if (updates.userId !== undefined) {
    fields.push('user_id = ?');
    values.push(updates.userId);
  }
  if (!fields.length) {
    return null;
  }
  fields.push('updated_at = datetime(\'now\')');
  values.push(id);
  const sql = 'UPDATE meal_plans SET ' + fields.join(', ') + ' WHERE id = ?';
  await db.run(sql, values);
  return getMealPlan(id);
}

export async function deleteMealPlan(id: string): Promise<boolean> {
  const result = await db.run('DELETE FROM meal_plans WHERE id = ?', [id]);
  return (result.changes ?? 0) > 0;
}

// Join table: Add a dish to a meal plan
export async function addDishToMealPlan(mealPlanId: string, dishId: string): Promise<void> {
  const id = uuidv4();
  await db.run(
    'INSERT INTO meal_plan_dishes (id, meal_plan_id, dish_id) VALUES (?, ?, ?)',
    [id, mealPlanId, dishId]
  );
}

// Join table: Remove a dish from a meal plan
export async function removeDishFromMealPlan(mealPlanId: string, dishId: string): Promise<void> {
  await db.run(
    'DELETE FROM meal_plan_dishes WHERE meal_plan_id = ? AND dish_id = ?',
    [mealPlanId, dishId]
  );
}

// Join table: Add a food item to a meal plan
export async function addFoodItemToMealPlan(mealPlanId: string, foodItemId: string, familyMemberId?: string, quantity?: number, notes?: string): Promise<void> {
  const id = uuidv4();
  await db.run(
    'INSERT INTO meal_plan_food_items (id, meal_plan_id, food_item_id, family_member_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, mealPlanId, foodItemId, familyMemberId || null, quantity || null, notes || null]
  );
}

// Join table: Remove a food item from a meal plan
export async function removeFoodItemFromMealPlan(mealPlanId: string, foodItemId: string): Promise<void> {
  await db.run(
    'DELETE FROM meal_plan_food_items WHERE meal_plan_id = ? AND food_item_id = ?',
    [mealPlanId, foodItemId]
  );
}

// Get all dishes for a meal plan
export async function getDishesForMealPlan(mealPlanId: string): Promise<string[]> {
  const rows = await db.all('SELECT dish_id FROM meal_plan_dishes WHERE meal_plan_id = ?', [mealPlanId]);
  return rows.map((row: any) => row.dish_id);
}

// Get all food items for a meal plan
export async function getFoodItemsForMealPlan(mealPlanId: string): Promise<{ foodItemId: string, familyMemberId?: string, quantity?: number, notes?: string }[]> {
  const rows = await db.all('SELECT food_item_id, family_member_id, quantity, notes FROM meal_plan_food_items WHERE meal_plan_id = ?', [mealPlanId]);
  return rows.map((row: any) => ({
    foodItemId: row.food_item_id,
    familyMemberId: row.family_member_id,
    quantity: row.quantity,
    notes: row.notes,
  }));
}