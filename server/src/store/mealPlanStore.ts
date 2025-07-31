import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import type { MealPlan } from '../models/mealPlan';

export async function addMealPlan(plan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
  const id = uuidv4();
  await db.run(
    'INSERT INTO meal_plans (id, date, meal_id, family_id, member_id, user_id, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), datetime(\'now\'))',
    [id, plan.date, plan.mealId, plan.familyId, plan.memberId || null, plan.userId, plan.type]
  );
  return {
    ...plan,
    id,
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
    mealId: m.meal_id,
    familyId: m.family_id,
    memberId: m.member_id,
    userId: m.user_id,
    type: m.type,
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
    mealId: m.meal_id,
    familyId: m.family_id,
    memberId: m.member_id,
    userId: m.user_id,
    type: m.type,
  }));
}

export async function getMealPlan(id: string): Promise<MealPlan | null> {
  const m = await db.get('SELECT * FROM meal_plans WHERE id = ?', [id]);
  if (!m) return null;
  return {
    id: m.id,
    date: m.date,
    mealId: m.meal_id,
    familyId: m.family_id,
    memberId: m.member_id,
    userId: m.user_id,
    type: m.type,
  };
}

export async function getMealPlansByDate(date: string): Promise<MealPlan[]> {
  const plans = await db.all('SELECT * FROM meal_plans WHERE date = ?', [date]);
  return plans.map((m: any) => ({
    id: m.id,
    date: m.date,
    mealId: m.meal_id,
    familyId: m.family_id,
    memberId: m.member_id,
    userId: m.user_id,
    type: m.type,
  }));
}

export async function updateMealPlan(id: string, updates: Partial<Omit<MealPlan, 'id'>>): Promise<MealPlan | null> {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date);
  }
  if (updates.mealId !== undefined) {
    fields.push('meal_id = ?');
    values.push(updates.mealId);
  }
  if (updates.familyId !== undefined) {
    fields.push('family_id = ?');
    values.push(updates.familyId);
  }
  if (updates.memberId !== undefined) {
    fields.push('member_id = ?');
    values.push(updates.memberId);
  }
  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.userId !== undefined) {
    fields.push('user_id = ?');
    values.push(updates.userId);
  }
  if (!fields.length) return null;
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
