import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '../db';
import { checkAuth } from '../validation';

export async function POST(event: RequestEvent) {
  // Check user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  // Get data from request
  const data = await event.request.json();
  const { finishedMatchups, upcomingMatchups, schedules } = data;

  try {
    // Clear and update finished matchups
    let query = 'DELETE FROM FinishedMatchups';
    let stmt = db.prepare(query);
    stmt.run();

    query = 'INSERT INTO FinishedMatchups (team1_id, team2_id) VALUES (?, ?)';
    stmt = db.prepare(query);
    for (const { matchup } of finishedMatchups) stmt.run(...matchup.map((t) => t.id));

    // Clear and update upcoming matchups
    query = 'DELETE FROM UpcomingMatchups';
    stmt = db.prepare(query);
    stmt.run();

    query = 'INSERT INTO UpcomingMatchups (team1_id, team2_id) VALUES (?, ?)';
    stmt = db.prepare(query);
    for (const { matchup } of upcomingMatchups) stmt.run(...matchup.map((t) => t.id));

    // Clear and update schedule
    query = 'DELETE FROM Schedule';
    stmt = db.prepare(query);
    stmt.run();

    query =
      'INSERT INTO Schedule (id, start, end, team1_id, team2_id, courts, color) VALUES (?, ?, ?, ?, ?, ?, ?)';
    stmt = db.prepare(query);
    for (let i = 0; i < schedules.length; i++) {
      const { start, end, matchup, courts, color } = schedules[i];
      stmt.run(
        i,
        new Date(start).getTime(),
        new Date(end).getTime(),
        matchup[0].id,
        matchup[1].id,
        courts.join('&&'),
        color
      );
    }

    return json({ success: true });
  } catch (e) {
    // If error, return error message
    console.log(e);
    return json({ success: false, message: e.message });
  }
}

export async function GET(event: RequestEvent) {
  const params = event.url.searchParams;
  const which = params.get('which');

  try {
    switch (which) {
      case 'finishedMatchups': {
        const query = 'SELECT * FROM FinishedMatchups';
        const stmt = db.prepare(query);
        const rows = stmt.all();

        return json({ success: true, finishedMatchups: rows });
      }
      case 'upcomingMatchups': {
        const query = 'SELECT * FROM UpcomingMatchups';
        const stmt = db.prepare(query);
        const rows = stmt.all();

        return json({ success: true, upcomingMatchups: rows });
      }
      case 'schedules': {
        const query = 'SELECT * FROM Schedule';
        const stmt = db.prepare(query);
        const rows = stmt.all();

        return json({ success: true, schedules: rows });
      }
    }
  } catch (e) {
    console.log(e);
    return json({ success: false, message: e.message });
  }
}
