import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db';

export function checkAuth(event: RequestEvent) {
  // Get token from Authorization header
  const headers = event.request.headers;
  const token = headers.get('Authorization');

  try {
    // Check if token exists and is valid
    const query = 'SELECT * FROM sessions WHERE token = ?';
    const stmt = db.prepare(query);
    const row = stmt.get(token) as { token: string; expires: number };

    const now = Date.now();
    return row && row.expires > now;
  } catch (e) {
    // If error, return false
    console.log(e);
    return false;
  }
}
