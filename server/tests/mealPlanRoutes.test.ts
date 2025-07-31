import request from 'supertest';
import express from 'express';
import mealPlanRoutes from '../src/routes/mealPlanRoutes';
import { initDb, db } from '../src/db';
import { addMealPlan } from '../src/store/mealPlanStore';

const app = express();
app.use(express.json());
app.use('/api/meal-plans', mealPlanRoutes);

const userId = 1;

// Mock requireAuth middleware to inject user
jest.mock('../src/routes/requireAuth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: userId, username: 'testuser' };
    next();
  }
}));

describe('MealPlan API routes', () => {
  const familyId = 'fam-456';
  const mealId = 'meal-789';
  const memberId = 'mem-101';
  const planData = { date: '2025-08-01', mealId, familyId, memberId, userId, type: 'dinner' as const };
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

  it('should create a new meal plan via POST', async () => {
    const res = await request(app)
      .post('/api/meal-plans')
      .send(planData)
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.familyId).toBe(familyId);
    createdPlanId = res.body.id;
  });

  it('should get all meal plans for a family via GET', async () => {
    await addMealPlan({ ...planData, type: 'dinner' as const });
    const res = await request(app)
      .get(`/api/meal-plans?familyId=${familyId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].familyId).toBe(familyId);
  });

  it('should get meal plans for a family and date via GET', async () => {
    await addMealPlan({ ...planData, date: '2025-08-02', type: 'dinner' as const });
    const res = await request(app)
      .get(`/api/meal-plans?familyId=${familyId}&date=2025-08-02`)
      .expect(200);
    expect(res.body[0].date).toBe('2025-08-02');
  });

  it('should update a meal plan via PUT', async () => {
    const plan = await addMealPlan({ ...planData, type: 'dinner' as const });
    const res = await request(app)
      .put(`/api/meal-plans/${plan.id}`)
      .send({ type: 'lunch' })
      .expect(200);
    expect(res.body.type).toBe('lunch');
  });

  it('should delete a meal plan via DELETE', async () => {
    const plan = await addMealPlan({ ...planData, type: 'dinner' as const });
    await request(app)
      .delete(`/api/meal-plans/${plan.id}`)
      .expect(204);
    const res = await request(app)
      .get(`/api/meal-plans?familyId=${familyId}`);
    const found = res.body.find((p: any) => p.id === plan.id);
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent meal plan on DELETE', async () => {
    await request(app)
      .delete('/api/meal-plans/non-existent-id')
      .expect(404);
  });
});
