import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../src/routes/requireAuth';

const app = express();
app.get('/protected', requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

describe('requireAuth middleware', () => {
  const secret = process.env.JWT_SECRET || 'secret';
  const validPayload = { id: 1, username: 'testuser' };
  const validToken = jwt.sign(validPayload, secret, { expiresIn: '1h' });
  const invalidToken = 'invalid.token.value';

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should return 403 if token is invalid', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${invalidToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid token');
  });

  it('should allow access with a valid token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(validPayload.id);
    expect(res.body.user.username).toBe(validPayload.username);
  });
});
