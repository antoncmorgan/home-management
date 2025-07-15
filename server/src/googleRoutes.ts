import express from 'express';
import { google } from 'googleapis';
import { requireAuth } from './requireAuth';
import { saveGoogleTokens, getGoogleTokens, findUserByUsername } from './db';

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect user to Google for consent
router.get('/auth', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  // Get JWT from query param (since browser redirects do not send Authorization header)
  const token = req.query.token as string || '';
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: token,
  });
  res.redirect(url);
});

// Step 2: Handle OAuth2 callback
// This endpoint should be called with a valid JWT (user must be logged in)
import jwt from 'jsonwebtoken';

router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string; // JWT passed as state
  if (!code) {
    return res.status(400).send('No code provided');
  }

  if (!state) {
    return res.status(400).send('No state (JWT) provided');
  }

  try {
    // Validate JWT
    let payload;
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET not set in environment' });
    }

    try {
      payload = jwt.verify(state, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired JWT in state' });
    }

    let username;
    if (typeof payload === 'object' && payload !== null && 'username' in payload) {
      username = (payload as any).username;
    } else {
      return res.status(400).json({ error: 'JWT payload missing username' });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    await saveGoogleTokens(user.id, tokens);
    res.json({ message: 'Google tokens saved', tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to exchange code for tokens', details: err });
  }
});

router.get('/calendars', requireAuth, async (req, res) => {
  try {
    const username = (req as any).user.username;
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = await getGoogleTokens(user.id);
    if (!tokens) {
      return res.status(400).json({ error: 'No Google tokens found for user' });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const result = await calendar.calendarList.list();
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendars', details: err });
  }
});

// Get a month's worth of events from the user's primary Google Calendar
router.get('/events/month', requireAuth, async (req, res) => {
  try {
    const username = (req as any).user.username;
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const tokens = await getGoogleTokens(user.id);
    if (!tokens) {
      return res.status(400).json({ error: 'No Google tokens found for user' });
    }
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Accept start and end ISO date strings as query params
    const startParam = req.query.start as string | undefined;
    const endParam = req.query.end as string | undefined;
    let start, end;
    if (startParam && endParam) {
      start = new Date(startParam);
      end = new Date(endParam);
    } else {
      // fallback to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err });
  }
});

export default router;
