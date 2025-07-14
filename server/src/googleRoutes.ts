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
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  res.redirect(url);
});

// Step 2: Handle OAuth2 callback
// This endpoint should be called with a valid JWT (user must be logged in)
router.get('/callback', requireAuth, async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('No code provided');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Get user info from JWT
    const username = (req as any).user.username;
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'User not found' });
    await saveGoogleTokens(user.id, tokens);
    res.json({ message: 'Google tokens saved', tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to exchange code for tokens', details: err });
  }
});

// Example: List user's Google Calendars (requires valid tokens)
router.get('/calendars', requireAuth, async (req, res) => {
  try {
    const username = (req as any).user.username;
    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const tokens = await getGoogleTokens(user.id);
    if (!tokens) return res.status(400).json({ error: 'No Google tokens found for user' });
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const result = await calendar.calendarList.list();
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendars', details: err });
  }
});

export default router;
