import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import cookieParser from 'cookie-parser';
import { initDb } from '../src/db';

const app = express();
app.use(express.json());
app.use(cookieParser());
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
  it('should return access token in body and refresh token as HttpOnly cookie on login', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'refreshuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'refreshuser', password: 'testpass' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.expiresIn).toBeDefined();
    // Check refresh token is set as HttpOnly cookie
    const cookies = res.headers['set-cookie'];
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const refreshCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/HttpOnly/);
  });

  it('should refresh access token with valid refresh token (from cookie)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'refreshflow', password: 'testpass' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'refreshflow', password: 'testpass' });
    const cookies = loginRes.headers['set-cookie'];
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const refreshCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', refreshCookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    // Should set a new refreshToken cookie
    const newCookies = res.headers['set-cookie'];
    const newCookieArr = Array.isArray(newCookies) ? newCookies : newCookies ? [newCookies] : [];
    const newRefreshCookie = newCookieArr.find((c) => c.startsWith('refreshToken='));
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie).not.toBe(refreshCookie);
  });

  it('should logout a single device (invalidate refresh token cookie)', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'logoutuser', password: 'testpass' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logoutuser', password: 'testpass' });
    const cookies = loginRes.headers['set-cookie'];
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const refreshCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    const accessToken = loginRes.body.accessToken;
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', refreshCookie);
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe('Logged out');
    // Try to use the same refresh token again
    const refreshRes = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', refreshCookie);
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
    const cookies1 = loginRes1.headers['set-cookie'];
    const cookieArr1 = Array.isArray(cookies1) ? cookies1 : cookies1 ? [cookies1] : [];
    const refreshCookie1 = cookieArr1.find((c) => c.startsWith('refreshToken='));
    const cookies2 = loginRes2.headers['set-cookie'];
    const cookieArr2 = Array.isArray(cookies2) ? cookies2 : cookies2 ? [cookies2] : [];
    const refreshCookie2 = cookieArr2.find((c) => c.startsWith('refreshToken='));
    // Get userId from access token
    const token = loginRes1.body.accessToken;
    const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = jwtPayload.id;
    const accessToken = loginRes1.body.accessToken;
    const logoutAllRes = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId });
    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.message).toBe('Logged out from all devices');
    // Both refresh tokens should now be invalid
    const refreshRes1 = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', refreshCookie1);
    const refreshRes2 = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', refreshCookie2);
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
    expect(res.body.accessToken).toBeDefined();
    // Check refresh token is set as HttpOnly cookie
    const cookies = res.headers['set-cookie'];
    const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    const refreshCookie = cookieArr.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/HttpOnly/);
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
    const token = loginRes.body.accessToken;
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
