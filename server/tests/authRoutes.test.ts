import request from 'supertest';
import express from 'express';
import authRoutes from '../src/authRoutes';
import { initDb } from '../src/db';


const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await initDb(':memory:');
});

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered');
  });

  it('should not register the same user twice', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupeuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'dupeuser', password: 'testpass' });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('User already exists');
  });

  it('should login with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'loginuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'testpass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nouser', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
  it('should access protected route with valid token', async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'protecteduser', password: 'testpass' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'protecteduser', password: 'testpass' });
    const token = loginRes.body.token;
    const res = await request(app)
      .get('/api/auth/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Hello, protecteduser/);
  });

  it('should not access protected route without token', async () => {
    const res = await request(app)
      .get('/api/auth/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should not access protected route with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid token');
  });
});
