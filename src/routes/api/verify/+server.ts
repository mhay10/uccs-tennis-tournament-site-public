import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '../db';

export async function GET(event: RequestEvent) {
  const headers = event.request.headers;
  const token = headers.get('Authorization');

  try {
    const query = 'SELECT * FROM sessions WHERE token = ?';
    const stmt = db.prepare(query);
    const row = stmt.get(token) as { token: string; expires: number };

    const now = Date.now();
    const valid = row && row.expires > now;
    return json({ success: valid });
  } catch (e) {
    console.log(e);
    return json({ success: false });
  }
}
