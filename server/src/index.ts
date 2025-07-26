
import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initDb } from './db';
import authRoutes from './routes/authRoutes';

import familyMemberRoutes from './routes/familyMemberRoutes';
import googleRoutes from './routes/googleRoutes';
import familyRoutes from './routes/familyRoutes';


const app = express();
const port = process.env.PORT || 3001;

// Initialize DB
initDb().then(() => {
  console.log('Database initialized');
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use('/api/family-members', familyMemberRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/google', googleRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
