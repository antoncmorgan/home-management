
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb(filename?: string) {
  // Ensure the data directory exists
  const dbFile = filename || process.env.DB_FILE || './data/dev.db';
  const dir = dbFile.substring(0, dbFile.lastIndexOf('/'));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS google_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    scope TEXT,
    token_type TEXT,
    expiry_date INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
}

export async function saveGoogleTokens(userId: number, tokens: any) {
  // Upsert tokens for the user
  await db.run(`INSERT INTO google_tokens (user_id, access_token, refresh_token, scope, token_type, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      scope=excluded.scope,
      token_type=excluded.token_type,
      expiry_date=excluded.expiry_date
  `,
    [userId, tokens.access_token, tokens.refresh_token, tokens.scope, tokens.token_type, tokens.expiry_date]
  );
}

export async function getGoogleTokens(userId: number) {
  return db.get('SELECT * FROM google_tokens WHERE user_id = ?', [userId]);
}

export async function createUser(username: string, password: string) {
  return db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
}

export async function findUserByUsername(username: string) {
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}
