import { addMeal, getMealsForFamily, updateMeal, deleteMeal } from '../src/store/mealStore';
import { addMealPlan } from '../src/store/mealPlanStore';
import { initDb, db } from '../src/db';
import { Meal } from '../src/models/meal';

describe('Meal store helpers', () => {
  const familyId = 'fam-456';
  const userId = 1;
  const mealData: Omit<Meal, 'id'> = {
    name: 'Spaghetti',
    type: 'dinner',
    description: 'Classic Italian pasta.',
    ingredients: ['pasta', 'tomato sauce', 'beef'],
    imageUrl: 'https://example.com/spaghetti.jpg',
    cookTime: 30,
    recipe: 'Boil pasta, cook beef, mix with sauce.',
    familyId,
    userId
  };
  let createdMealId: string;

  beforeAll(async () => {
    await initDb(':memory:');
    // Optionally, create related test data (family, user)
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should add a new meal', async () => {
    const meal = await addMeal(mealData);
    expect(meal.id).toBeDefined();
    expect(meal.name).toBe('Spaghetti');
    createdMealId = meal.id;
  });

  it('should get all meals for a family', async () => {
    const meal1 = await addMeal(mealData);
    const meal2 = await addMeal({ ...mealData, name: 'Pizza' });
    // Add meal plans for each meal
    await addMealPlan({ date: '2025-08-01', mealId: meal1.id, familyId, userId, type: 'dinner' });
    await addMealPlan({ date: '2025-08-02', mealId: meal2.id, familyId, userId, type: 'dinner' });
    const meals = await getMealsForFamily(familyId);
    expect(meals.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a meal', async () => {
    const meal = await addMeal(mealData);
    const updated = await updateMeal(meal.id, { name: 'Spaghetti Bolognese' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Spaghetti Bolognese');
  });

  it('should delete a meal', async () => {
    const meal = await addMeal(mealData);
    await deleteMeal(meal.id);
    const meals = await getMealsForFamily(familyId);
    const found = meals.find(m => m.id === meal.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent meal', async () => {
    await expect(deleteMeal('non-existent-id')).resolves.toBe(false);
  });
});
