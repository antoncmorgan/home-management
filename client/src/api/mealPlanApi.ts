import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Meal } from '../models/Meal';
import type { MealPlan } from '../models/MealPlan';

const MEALS_API = '/api/meals';
const MEALPLANS_API = '/api/meal-plans';

export async function fetchMeals(familyId: string, memberId?: string): Promise<Meal[]> {
  let url = `${MEALS_API}?familyId=${encodeURIComponent(familyId)}`;
  if (memberId) url += `&memberId=${encodeURIComponent(memberId)}`;
  const res = await apiGet(url);
  return res.data as Meal[];
}

export async function addMeal(meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meal> {
  console.log('Adding meal:', meal);
  const res = await apiPost(MEALS_API, meal);
  return res.data as Meal;
}

export async function updateMeal(
  id: string,
  updates: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>,
  familyId: string,
  memberId?: string
): Promise<Meal> {
  let url = `${MEALS_API}/${id}?familyId=${encodeURIComponent(familyId)}`;
  if (memberId) url += `&memberId=${encodeURIComponent(memberId)}`;
  const res = await apiPut(url, updates);
  return res.data as Meal;
}

export async function deleteMeal(id: string, familyId: string, memberId?: string): Promise<void> {
  let url = `${MEALS_API}/${id}?familyId=${encodeURIComponent(familyId)}`;
  if (memberId) url += `&memberId=${encodeURIComponent(memberId)}`;
  await apiDelete(url);
}

export async function addMealPlan(plan: Omit<MealPlan, 'id' | 'userId'>) {
  const res = await apiPost(MEALPLANS_API, plan);
  return res.data as MealPlan;
}

export async function fetchMealPlans(familyId: string, memberId?: string, date?: string): Promise<MealPlan[]> {
  let url = `${MEALPLANS_API}?familyId=${encodeURIComponent(familyId)}`;
  if (memberId) url += `&memberId=${encodeURIComponent(memberId)}`;
  if (date) url += `&date=${encodeURIComponent(date)}`;
  const res = await apiGet(url);
  return res.data as MealPlan[];
}
