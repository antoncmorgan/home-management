import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Add routes for Google Calendar sync, authentication, and events

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
