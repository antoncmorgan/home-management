import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';


let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb(filename?: string) {
  db = await open({
    filename: filename || process.env.DB_FILE || './app.db',
    driver: sqlite3.Database,
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
}

export async function createUser(username: string, password: string) {
  return db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
}

export async function findUserByUsername(username: string) {
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}
