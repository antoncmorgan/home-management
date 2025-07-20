
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { createUser, findUserByUsername } from './store/userStore';

const router = express.Router();

// Users are now persisted in SQLite

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
  const { username, password } = req.body;
  const user = await findUserByUsername(db, username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});


import { requireAuth } from './requireAuth';

// Example protected route
router.get('/protected', requireAuth, (req, res) => {
  res.json({ message: `Hello, ${(req as any).user.username}! This is a protected route.` });
});

export default router;
