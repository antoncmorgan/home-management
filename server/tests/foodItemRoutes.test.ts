import request from 'supertest';
import express from 'express';
import foodItemRoutes from '../src/routes/foodItemRoutes';
import { initDb, db } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/food-items', foodItemRoutes);

const userId = 1;

// Mock requireAuth middleware to inject user
jest.mock('../src/routes/requireAuth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: userId, username: 'testuser' };
    next();
  }
}));

describe('FoodItem API routes', () => {
  const familyId = 'fam-456';
  const foodItemData = { name: 'Apple', familyId, userId, category: 'fruit', quantity: 1, notes: 'Fresh red apple.' };
  let createdFoodItemId: string;

  beforeAll(async () => {
    await initDb(':memory:');
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should create a new food item via POST', async () => {
    const res = await request(app)
      .post('/api/food-items')
      .send(foodItemData)
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Apple');
    createdFoodItemId = res.body.id;
  });

  it('should get all food items for a family via GET', async () => {
    // Create food item via API
    await request(app)
      .post('/api/food-items')
      .send(foodItemData)
      .expect(201);
    const res = await request(app)
      .get(`/api/food-items?familyId=${familyId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Apple');
  });

  it('should update a food item via PUT', async () => {
    // Create food item via API
    const createRes = await request(app)
      .post('/api/food-items')
      .send(foodItemData)
      .expect(201);
    const foodItemId = createRes.body.id;
    const res = await request(app)
      .put(`/api/food-items/${foodItemId}?familyId=${familyId}`)
      .send({ name: 'Green Apple' })
      .expect(200);
    expect(res.body.name).toBe('Green Apple');
  });

  it('should delete a food item via DELETE', async () => {
    // Create food item via API
    const createRes = await request(app)
      .post('/api/food-items')
      .send(foodItemData)
      .expect(201);
    const foodItemId = createRes.body.id;
    await request(app)
      .delete(`/api/food-items/${foodItemId}?familyId=${familyId}`)
      .expect(204);
    const res = await request(app)
      .get(`/api/food-items?familyId=${familyId}`);
    const found = res.body.find((i: any) => i.id === foodItemId);
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent food item on DELETE', async () => {
    await request(app)
      .delete(`/api/food-items/non-existent-id?familyId=${familyId}`)
      .expect(404);
  });
});
