import crypto from 'crypto';

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getRefreshTokenExpiry(days = 7): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires.toISOString();
}
