import { Database } from 'sqlite';

export async function saveGoogleTokens(db: Database, userId: number, tokens: any) {
  await db.run(`INSERT INTO google_tokens (user_id, access_token, refresh_token, scope, token_type, expiry_date, id_token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      scope=excluded.scope,
      token_type=excluded.token_type,
      expiry_date=excluded.expiry_date,
      id_token=excluded.id_token
  `,
    [userId, tokens.access_token, tokens.refresh_token, tokens.scope, tokens.token_type, tokens.expiry_date, tokens.id_token]
  );
}

export async function getGoogleTokens(db: Database, userId: number) {
  return db.get('SELECT * FROM google_tokens WHERE user_id = ?', [userId]);
}
