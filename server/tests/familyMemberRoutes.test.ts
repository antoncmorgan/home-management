import request from 'supertest';
import express from 'express';
import familyMemberRoutes from '../src/familyMemberRoutes';
import { initDb } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/family-members', familyMemberRoutes);

beforeAll(async () => {
  await initDb(':memory:');
});

describe('FamilyMember Routes', () => {
  const familyId = 'fam-123';

  it('should add a new family member', async () => {
    const res = await request(app)
      .post('/api/family-members')
      .send({ familyId, name: 'Alice', avatar: '👩', calendarId: 'cal-1' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
    expect(res.body.familyId).toBe(familyId);
  });

  it('should get all family members for a family', async () => {
    await request(app)
      .post('/api/family-members')
      .send({ familyId, name: 'Bob', avatar: '👨', calendarId: 'cal-2' });
    const res = await request(app)
      .get('/api/family-members')
      .query({ familyId });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].familyId).toBe(familyId);
  });

  it('should update a family member', async () => {
    const addRes = await request(app)
      .post('/api/family-members')
      .send({ familyId, name: 'Charlie', avatar: '👦' });
    const id = addRes.body.id;
    const res = await request(app)
      .put(`/api/family-members/${id}`)
      .send({ name: 'Charlie Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Charlie Updated');
  });

  it('should delete a family member', async () => {
    const addRes = await request(app)
      .post('/api/family-members')
      .send({ familyId, name: 'DeleteMe' });
    const id = addRes.body.id;
    const res = await request(app)
      .delete(`/api/family-members/${id}`);
    expect(res.status).toBe(204);
    // Confirm deletion
    const getRes = await request(app)
      .get('/api/family-members')
      .query({ familyId });
    const found = getRes.body.find((m: any) => m.id === id);
    expect(found).toBeUndefined();
  });

  it('should return 404 when updating non-existent member', async () => {
    const res = await request(app)
      .put('/api/family-members/nonexistent')
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  it('should return 404 when deleting non-existent member', async () => {
    const res = await request(app)
      .delete('/api/family-members/nonexistent');
    expect(res.status).toBe(404);
  });
});
