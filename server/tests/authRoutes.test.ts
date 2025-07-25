import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import { initDb } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await initDb(':memory:');
});

afterAll(async () => {
  const { db } = require('../src/db');
  if (db && typeof db.close === 'function') {
    await db.close();
  }
});

describe('Auth Routes', () => {
  it('should return both access and refresh tokens on login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'refreshuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'refreshuser', password: 'testpass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.expiresIn).toBeDefined();
  });

  it('should refresh access token with valid refresh token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'refreshflow', password: 'testpass' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'refreshflow', password: 'testpass' });
    const refreshToken = loginRes.body.refreshToken;
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it('should logout a single device (invalidate refresh token)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'logoutuser', password: 'testpass' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logoutuser', password: 'testpass' });
    const refreshToken = loginRes.body.refreshToken;
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('Logged out');
    // Try to use the same refresh token again
    const refreshRes = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('should logout all devices (invalidate all refresh tokens)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'logoutalluser', password: 'testpass' });
    const loginRes1 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logoutalluser', password: 'testpass' });
    const loginRes2 = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logoutalluser', password: 'testpass' });
    const refreshToken1 = loginRes1.body.refreshToken;
    const refreshToken2 = loginRes2.body.refreshToken;
    // Get userId from token
    const jwtPayload = JSON.parse(Buffer.from(loginRes1.body.token.split('.')[1], 'base64').toString());
    const userId = jwtPayload.id;
    const logoutAllRes = await request(app)
      .post('/api/auth/logout-all')
      .send({ userId });
    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.message).toBe('Logged out from all devices');
    // Both refresh tokens should now be invalid
    const refreshRes1 = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: refreshToken1 });
    const refreshRes2 = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: refreshToken2 });
    expect(refreshRes1.status).toBe(401);
    expect(refreshRes2.status).toBe(401);
  });
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
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('protecteduser');
  });

  it('should not access protected route without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should not access protected route with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid token');
  });
});
