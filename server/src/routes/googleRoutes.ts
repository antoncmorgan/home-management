import express from 'express';
import { google } from 'googleapis';
import { requireAuth } from './requireAuth';
import { db } from '../db';
import { saveGoogleTokens, getGoogleTokens } from '../store/googleTokenStore';
import { findUserByUsername } from '../store/userStore';
import jwt from 'jsonwebtoken';

import type { Database } from 'sqlite';
import type { calendar_v3 } from 'googleapis';

type GoogleCalendarRequestParams = {
  user: any;
  db: Database;
  apiCall: (calendar: calendar_v3.Calendar, ...args: any[]) => Promise<any>;
  calendarArgs?: any[];
};

type GoogleCalendarError = {
  status: number;
  error: string;
  details?: any;
};

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

    const user = await findUserByUsername(db, username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    await saveGoogleTokens(db, user.id, tokens);
    res.json({ message: 'Google tokens saved', tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to exchange code for tokens', details: err });
  }
});

// Helper to handle Google Calendar API requests with token refresh/retry
async function googleCalendarRequest(params: GoogleCalendarRequestParams): Promise<any> {
  const { user, db, apiCall, calendarArgs = [] } = params;
  let tokens = await getGoogleTokens(db, user.id);
  if (!tokens) {
    throw { status: 400, error: 'No Google tokens found for user' } as GoogleCalendarError;
  }
  oauth2Client.setCredentials(tokens);
  const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    return await apiCall(calendar, ...(calendarArgs || []));
  } catch (err: any) {
    const errorData = err?.response?.data;
    if (
      errorData?.error === 'invalid_grant' &&
      errorData?.error_description?.includes('Token has been expired or revoked.') &&
      tokens.refresh_token
    ) {
      // Try to refresh the token
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        await saveGoogleTokens(db, user.id, { ...tokens, ...credentials });
        oauth2Client.setCredentials({ ...tokens, ...credentials });
        const calendarRetry: calendar_v3.Calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        return await apiCall(calendarRetry, ...(calendarArgs || []));
      } catch (refreshErr) {
        throw { status: 401, error: 'Google token expired and refresh failed', details: refreshErr } as GoogleCalendarError;
      }
    }
    throw err;
  }
}

router.get('/calendars', requireAuth, async (req, res) => {
  try {
    const username = (req as any).user.username;
    const user = await findUserByUsername(db, username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const result = await googleCalendarRequest({
      user,
      db,
      apiCall: async (calendar) => await calendar.calendarList.list(),
    });
    res.json(result.data);
  } catch (err: any) {
    if (err && err.status) {
      return res.status(err.status).json({ error: err.error, details: err.details });
    }
    res.status(500).json({ error: 'Failed to fetch calendars', details: err });
  }
});

// Get a month's worth of events from the user's primary Google Calendar
router.get('/events/month', requireAuth, async (req, res) => {
  try {
    const username = (req as any).user.username;
    const user = await findUserByUsername(db, username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
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
    const result = await googleCalendarRequest({
      user,
      db,
      apiCall: async (calendar) => await calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      }),
    });
    res.json(result.data);
  } catch (err: any) {
    if (err && err.status) {
      return res.status(err.status).json({ error: err.error, details: err.details });
    }
    res.status(500).json({ error: 'Failed to fetch events', details: err });
  }
});

export default router;
