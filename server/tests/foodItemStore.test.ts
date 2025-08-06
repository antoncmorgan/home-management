import { addFoodItem, getFoodItemsForFamily, updateFoodItem, deleteFoodItem } from '../src/store/foodItemStore';
import { initDb, db } from '../src/db';
import { FoodItem } from '../src/models/foodItem';

describe('FoodItem store helpers', () => {
  const familyId = 'fam-456';
  const userId = 1;
  const foodItemData: Omit<FoodItem, 'id'> = {
    name: 'Apple',
    category: 'fruit',
    quantity: 1,
    notes: 'Fresh red apple.',
    familyId,
    userId
  };
  let createdFoodItemId: string;

  beforeAll(async () => {
    await initDb(':memory:');
    // Optionally, create related test data (family, user)
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should add a new food item', async () => {
    const item = await addFoodItem(foodItemData);
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Apple');
    createdFoodItemId = item.id;
  });

  it('should get all food items for a family', async () => {
    const item1 = await addFoodItem(foodItemData);
    const item2 = await addFoodItem({ ...foodItemData, name: 'Banana' });
    const items = await getFoodItemsForFamily(familyId);
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('should update a food item', async () => {
    const item = await addFoodItem(foodItemData);
    const updated = await updateFoodItem(item.id, { name: 'Green Apple' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Green Apple');
  });

  it('should delete a food item', async () => {
    const item = await addFoodItem(foodItemData);
    await deleteFoodItem(item.id);
    const items = await getFoodItemsForFamily(familyId);
    const found = items.find((i: FoodItem) => i.id === item.id);
    expect(found).toBeUndefined();
  });

  it('should not throw when deleting non-existent food item', async () => {
    await expect(deleteFoodItem('non-existent-id')).resolves.toBe(false);
  });
});
