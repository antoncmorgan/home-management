import request from 'supertest';
import express from 'express';
import dishRoutes from '../src/routes/dishRoutes';
import { initDb, db } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/dishes', dishRoutes);

const userId = 1;

// Mock requireAuth middleware to inject user
jest.mock('../src/routes/requireAuth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: userId, username: 'testuser' };
    next();
  }
}));

describe('Dish API routes', () => {
  const familyId = 'fam-456';
  const dishData = { name: 'Spaghetti', familyId, userId, dishType: 'entree' as const, description: 'Classic Italian pasta.', ingredients: ['pasta', 'tomato sauce', 'beef'] };
  let createdDishId: string;

  beforeAll(async () => {
    await initDb(':memory:');
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  it('should create a new dish via POST', async () => {
    const res = await request(app)
      .post('/api/dishes')
      .send(dishData)
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Spaghetti');
    createdDishId = res.body.id;
  });

  it('should get all dishes for a family via GET', async () => {
    // Create dish via API
    await request(app)
      .post('/api/dishes')
      .send(dishData)
      .expect(201);
    const res = await request(app)
      .get(`/api/dishes?familyId=${familyId}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Spaghetti');
  });

  it('should update a dish via PUT', async () => {
    // Create dish via API
    const createRes = await request(app)
      .post('/api/dishes')
      .send(dishData)
      .expect(201);
    const dishId = createRes.body.id;
    const res = await request(app)
      .put(`/api/dishes/${dishId}?familyId=${familyId}`)
      .send({ name: 'Spaghetti Bolognese' })
      .expect(200);
    expect(res.body.name).toBe('Spaghetti Bolognese');
  });

  it('should delete a dish via DELETE', async () => {
    // Create dish via API
    const createRes = await request(app)
      .post('/api/dishes')
      .send(dishData)
      .expect(201);
    const dishId = createRes.body.id;
    await request(app)
      .delete(`/api/dishes/${dishId}?familyId=${familyId}`)
      .expect(204);
    const res = await request(app)
      .get(`/api/dishes?familyId=${familyId}`);
    const found = res.body.find((d: any) => d.id === dishId);
    expect(found).toBeUndefined();
  });

  it('should return 404 for non-existent dish on DELETE', async () => {
    await request(app)
      .delete(`/api/dishes/non-existent-id?familyId=${familyId}`)
      .expect(404);
  });
});
