import { Database } from 'sqlite';

export async function createUser(db: Database, username: string, password: string) {
  return db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
}

export async function findUserByUsername(db: Database, username: string) {
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}
