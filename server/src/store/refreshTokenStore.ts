import { db } from '../db';

export async function createRefreshToken(userId: number, token: string, deviceInfo: string, expiresAt: string) {
  await db.run(
    `INSERT INTO refresh_tokens (user_id, token, device_info, expires_at) VALUES (?, ?, ?, ?)`,
    userId, token, deviceInfo, expiresAt
  );
}

export async function findRefreshToken(token: string) {
  return db.get(`SELECT * FROM refresh_tokens WHERE token = ?`, token);
}

export async function deleteRefreshToken(token: string) {
  await db.run(`DELETE FROM refresh_tokens WHERE token = ?`, token);
}

export async function rotateRefreshToken(oldToken: string, newToken: string, newExpiresAt: string) {
  await db.run(
    `UPDATE refresh_tokens SET token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE token = ?`,
    newToken, newExpiresAt, oldToken
  );
}

export async function deleteAllUserRefreshTokens(userId: number) {
  await db.run(`DELETE FROM refresh_tokens WHERE user_id = ?`, userId);
}
