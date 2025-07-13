
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './authRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());
app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Add routes for Google Calendar sync and events

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
