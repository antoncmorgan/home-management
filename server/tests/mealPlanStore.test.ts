import { addMealPlan, getMealPlansByFamily, getMealPlansByFamilyAndDate, updateMealPlan, deleteMealPlan } from '../src/store/mealPlanStore';
import { initDb, db } from '../src/db';
import { MealPlan } from '../src/models/mealPlan';

describe('MealPlan store helpers', () => {
  const familyId = 'fam-456';
  const mealId = 'meal-789';
  const memberId = 'mem-101';
  const userId = 1;
  const planData: Omit<MealPlan, 'id'> = { date: '2025-08-01', mealId, familyId, memberId, userId, type: 'dinner' };
  let createdPlanId: string;

  beforeAll(async () => {
    await initDb(':memory:');
    // Optionally, create related test data (family, meal, member)
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should add a new meal plan', async () => {
    const plan = await addMealPlan(planData);
    expect(plan.id).toBeDefined();
    expect(plan.familyId).toBe(familyId);
    expect(plan.mealId).toBe(mealId);
    createdPlanId = plan.id;
  });

  it('should get all meal plans for a family', async () => {
    await addMealPlan(planData);
    await addMealPlan({ ...planData, date: '2025-08-02', type: 'lunch', mealId, familyId, memberId, userId });
    const plans = await getMealPlansByFamily(familyId);
    expect(plans.length).toBeGreaterThanOrEqual(2);
    expect(plans[0].familyId).toBe(familyId);
  });

  it('should get meal plans for a family and date', async () => {
    await addMealPlan({ ...planData, date: '2025-08-03', mealId, familyId, memberId, userId, type: planData.type });
    const plans = await getMealPlansByFamilyAndDate(familyId, '2025-08-03');
    expect(plans.length).toBeGreaterThanOrEqual(1);
    expect(plans[0].date).toBe('2025-08-03');
  });

  it('should update a meal plan', async () => {
    const plan = await addMealPlan(planData);
    const updated = await updateMealPlan(plan.id, { type: 'lunch' });
    expect(updated).not.toBeNull();
    expect(updated!.type).toBe('lunch');
  });

  it('should delete a meal plan', async () => {
    const plan = await addMealPlan(planData);
    const success = await deleteMealPlan(plan.id);
    expect(success).toBe(true);
    const plans = await getMealPlansByFamily(familyId);
    const found = plans.find(p => p.id === plan.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent meal plan', async () => {
    await expect(deleteMealPlan('non-existent-id')).resolves.toBe(false);
  });
});
