import { json, type RequestEvent } from '@sveltejs/kit';
import * as auth from '/auth.json';
import { db } from '../db';

export async function POST(event: RequestEvent) {
  // Get username and password
  const data = event.url.searchParams;
  const username = data.get('username');
  const password = data.get('password');

  // Check against list of users
  for (const user of auth.users) {
    if (user.username === username && user.password === password) {
      // If match, add session and return token
      const token = addSession();
      if (token) return json({ success: true, token });
    }
  }

  // If no match, return false
  return json({ success: false });
}

function generateToken() {
  // Generate random token for session
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

function addSession() {
  try {
    // Get auth token
    const token = generateToken();

    // Check if token already exists
    let query = 'SELECT * FROM sessions WHERE token = ?';
    let stmt = db.prepare(query);
    let row = stmt.get(token) as { token: string; expires: number };
    if (row) return addSession();

    // Add token to database
    query = 'INSERT INTO sessions (token, expires) VALUES (?, ?)';
    stmt = db.prepare(query);
    const expires = Date.now() + 12 * 60 * 60 * 1000;
    stmt.run(token, expires);

    // Return generated token
    return token;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
