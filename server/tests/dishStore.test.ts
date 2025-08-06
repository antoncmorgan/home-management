import { addDish, getDishesForFamily, updateDish, deleteDish } from '../src/store/dishStore';
import { addMealPlan } from '../src/store/mealPlanStore';
import { initDb, db } from '../src/db';
import { Dish } from '../src/models/dish';

describe('Dish store helpers', () => {
  const familyId = 'fam-456';
  const userId = 1;
  const dishData: Omit<Dish, 'id'> = {
    name: 'Spaghetti',
    dishType: 'entree',
    description: 'Classic Italian pasta.',
    ingredients: ['pasta', 'tomato sauce', 'beef'],
    imageUrl: 'https://example.com/spaghetti.jpg',
    cookTime: 30,
    recipe: 'Boil pasta, cook beef, mix with sauce.',
    familyId,
    userId
  };
  let createdDishId: string;

  beforeAll(async () => {
    await initDb(':memory:');
    // Optionally, create related test data (family, user)
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should add a new dish', async () => {
    const dish = await addDish(dishData);
    expect(dish.id).toBeDefined();
    expect(dish.name).toBe('Spaghetti');
    createdDishId = dish.id;
  });

  it('should get all dishes for a family', async () => {
    const dish1 = await addDish(dishData);
    const dish2 = await addDish({ ...dishData, name: 'Pizza' });
    // Optionally, add meal plans for each dish if needed
    const dishes = await getDishesForFamily(familyId);
    expect(dishes.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a dish', async () => {
    const dish = await addDish(dishData);
    const updated = await updateDish(dish.id, { name: 'Spaghetti Bolognese' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Spaghetti Bolognese');
  });

  it('should delete a dish', async () => {
    const dish = await addDish(dishData);
    await deleteDish(dish.id);
    const dishes = await getDishesForFamily(familyId);
    const found = dishes.find(d => d.id === dish.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent dish', async () => {
    await expect(deleteDish('non-existent-id')).resolves.toBe(false);
  });
});
