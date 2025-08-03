import request from 'supertest';
import express from 'express';
import { initDb, db } from '../src/db';

// Mock requireAuth before importing listRoutes
let currentUserId = 'user-123';
jest.mock('../src/routes/requireAuth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: currentUserId };
    next();
  }
}));

import listRoutes from '../src/routes/listRoutes';

const app = express();
app.use(express.json());
app.use('/api/lists', listRoutes);

describe('List routes', () => {
  beforeAll(async () => {
    await initDb(':memory:');
  });

  afterAll(async () => {
    if (db && typeof db.close === 'function') {
      await db.close();
    }
  });

  let listId: number;
  let itemId: number;

  it('should create a list', async () => {
    const res = await request(app)
      .post('/api/lists')
      .send({ familyId: 'fam-789', type: 'grocery', name: 'Test List' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test List');
    listId = res.body.id;
  });

  it('should add an item to the list', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/items`)
      .send({ name: 'Eggs', quantity: 12, status: 'active', notes: 'Free range' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Eggs');
    itemId = res.body.id;
  });

  it('should update the item', async () => {
    const res = await request(app)
      .put(`/api/lists/items/${itemId}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('should not allow another user to update the item', async () => {
    currentUserId = 'other-user';
    const res = await request(app)
      .put(`/api/lists/items/${itemId}`)
      .send({ status: 'active' });
    expect(res.status).toBe(403);
    currentUserId = 'user-123'; // restore
  });

  it('should delete the item', async () => {
    currentUserId = 'user-123';
    const res = await request(app)
      .delete(`/api/lists/items/${itemId}`);
    expect(res.status).toBe(204);
  });
});
