import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '../db';
import { createUser, findUserByUsername } from '../store/userStore';

import { generateRefreshToken, getRefreshTokenExpiry } from '../utils/tokenUtils';
import { createRefreshToken, findRefreshToken, rotateRefreshToken, deleteRefreshToken } from '../store/refreshTokenStore';
import { requireAuth } from './requireAuth';

const router = express.Router();

export type AuthUserInfo = {
  id: string;
  username: string;
  expiresIn?: number;
};

const tokenExpirySecs = 15 * 60;
const daySecs = 24 * 60 * 60;
const refreshTokenExpiryDays = 7;

// Logout route (single device, requires auth, uses cookie)
router.post('/logout', requireAuth, async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  await deleteRefreshToken(refreshToken);
  // Clear refresh token cookie only
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

// Global logout route (all devices, requires auth, uses cookie)
router.post('/logout-all', requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user || !user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  // Optionally, also delete the current device's refresh token
  const refreshToken = req.cookies?.refreshToken || '';
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }
  await require('./../store/refreshTokenStore').deleteAllUserRefreshTokens(user.id);
  // Clear refresh token cookie only
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out from all devices' });
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken || '';
  const deviceInfo = req.body.deviceInfo || '';
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  const tokenRecord = await findRefreshToken(refreshToken);
  if (!tokenRecord) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  // Check expiry
  if (new Date(tokenRecord.expires_at) < new Date()) {
    await deleteRefreshToken(refreshToken);
    return res.status(401).json({ message: 'Refresh token expired' });
  }
  // Issue new access token
  const userId = tokenRecord.user_id;
  const user = await findUserByUsername(db, tokenRecord.username || '');
  // If user lookup by username fails, fallback to user id
  let userRecord = user;
  if (!userRecord) {
    userRecord = await db.get('SELECT * FROM users WHERE id = ?', userId);
  }
  if (!userRecord) {
    return res.status(401).json({ message: 'User not found' });
  }
  const token = jwt.sign({ id: userRecord.id, username: userRecord.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  // Rotate refresh token
  const newRefreshToken = generateRefreshToken();
  const newExpiry = getRefreshTokenExpiry(7);
  await rotateRefreshToken(refreshToken, newRefreshToken, newExpiry);
  // Set HttpOnly cookie for refreshToken only
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshTokenExpiryDays * daySecs * 1000
  });
  const userInfo: AuthUserInfo = {
    id: userRecord.id,
    username: userRecord.username,
    expiresIn: tokenExpirySecs
  };
  res.json({ accessToken: token, ...userInfo });
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const existingUser = await findUserByUsername(db, username);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser(db, username, hashedPassword);
  res.status(201).json({ message: 'User registered' });
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password, deviceInfo = '' } = req.body;
  const user = await findUserByUsername(db, username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // Access token (short-lived)
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  // Refresh token (long-lived)
  const refreshToken = generateRefreshToken();
  const refreshTokenExpiry = getRefreshTokenExpiry(7); // 7 days
  await createRefreshToken(user.id, refreshToken, deviceInfo, refreshTokenExpiry);
  // Set HttpOnly cookie for refreshToken only
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshTokenExpiryDays * daySecs * 1000
  });
  const userInfo: AuthUserInfo = {
    id: user.id,
    username: user.username,
    expiresIn: tokenExpirySecs
  };
  res.json({ accessToken: token, ...userInfo });
});

// Return current authenticated user info
router.get('/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userInfo: AuthUserInfo = {
    id: user.id,
    username: user.username
  };
  res.json(userInfo);
});

export default router;
