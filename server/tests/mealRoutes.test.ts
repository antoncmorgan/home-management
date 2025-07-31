import request from 'supertest';
import express from 'express';
import mealRoutes from '../src/routes/mealRoutes';
import { initDb, db } from '../src/db';
import { addMeal } from '../src/store/mealStore';

const app = express();
app.use(express.json());
app.use('/api/meals', mealRoutes);

const userId = 1;

// Mock requireAuth middleware to inject user
jest.mock('../src/routes/requireAuth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: userId, username: 'testuser' };
    next();
  }
}));

describe('Meal API routes', () => {
  const familyId = 'fam-456';
  const mealData = { name: 'Spaghetti', familyId, userId, type: 'dinner' as const, description: 'Classic Italian pasta.', ingredients: ['pasta', 'tomato sauce', 'beef'] };
  let createdMealId: string;

  beforeAll(async () => {
    await initDb(':memory:');
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should create a new meal via POST', async () => {
    const res = await request(app)
      .post('/api/meals')
      .send(mealData)
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Spaghetti');
    createdMealId = res.body.id;
  });

  it('should get all meals for a family via GET', async () => {
    await addMeal({ ...mealData, type: 'dinner' as const });
    const res = await request(app)
      .get(`/api/meals?familyId=${familyId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Spaghetti');
  });

  it('should update a meal via PUT', async () => {
    const meal = await addMeal({ ...mealData, type: 'dinner' as const });
    const res = await request(app)
      .put(`/api/meals/${meal.id}?familyId=${familyId}`)
      .send({ name: 'Spaghetti Bolognese' })
      .expect(200);
    expect(res.body.name).toBe('Spaghetti Bolognese');
  });

  it('should delete a meal via DELETE', async () => {
    const meal = await addMeal({ ...mealData, type: 'dinner' as const });
    await request(app)
      .delete(`/api/meals/${meal.id}?familyId=${familyId}`)
      .expect(204);
    const res = await request(app)
      .get(`/api/meals?familyId=${familyId}`);
    const found = res.body.find((m: any) => m.id === meal.id);
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent meal on DELETE', async () => {
    await request(app)
      .delete(`/api/meals/non-existent-id?familyId=${familyId}`)
      .expect(404);
  });
});
