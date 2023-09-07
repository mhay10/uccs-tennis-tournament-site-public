import { json, type RequestEvent } from '@sveltejs/kit';
import { checkAuth } from '../validation.js';
import { db } from '../db';
import type { PoolScore } from '../../../stores/pools';

export async function POST(event: RequestEvent) {
  const data = await event.request.json();

  // Check if user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  try {
    // Get existing scores
    let query = 'SELECT * FROM PoolMatches WHERE pool_id = ?';
    let stmt = db.prepare(query);
    const existingScores = stmt.all(data.scores[0].pool_id) as PoolScore[];

    // Get updated scores
    const updatedScores = data.scores.filter((score: PoolScore) =>
      existingScores.find(
        (s: PoolScore) =>
          s.team1_id === score.team1_id &&
          s.team2_id === score.team2_id &&
          (s.team1_score !== score.team1_score || s.team2_score !== score.team2_score)
      )
    );

    // Filter out empty scores
    data.scores = data.scores.filter(
      (score: PoolScore) => score.team1_score !== null && score.team2_score !== null
    );

    // Get new scores
    const newScores = data.scores.filter(
      (score: PoolScore) =>
        !existingScores.find(
          (s: PoolScore) => s.team1_id === score.team1_id && s.team2_id === score.team2_id
        )
    );

    // Update existing scores
    query =
      'UPDATE PoolMatches SET team1_score = ?, team2_score = ? WHERE pool_id = ? AND team1_id = ? AND team2_id = ?';
    stmt = db.prepare(query);

    for (const score of updatedScores)
      stmt.run(score.team1_score, score.team2_score, score.pool_id, score.team1_id, score.team2_id);

    // Insert new scores
    query = 'INSERT INTO PoolMatches VALUES (?, ?, ?, ?, ?)';
    stmt = db.prepare(query);

    for (const score of newScores)
      stmt.run(score.pool_id, score.team1_id, score.team2_id, score.team1_score, score.team2_score);

    return json({ success: true });
  } catch (e) {
    // Return error if failed
    console.log(e);
    return json({ success: false, message: e.message });
  }
}

export async function GET(event: RequestEvent) {
  const data = event.url.searchParams;
  const action = data.get('action');

  try {
    // Get action
    switch (action) {
      case 'getTeams': {
        // Get teams and pool_ids from db
        const query = 'SELECT * from Teams';
        const stmt = db.prepare(query);

        return json({ success: true, teams: stmt.all() });
      }
      case 'getScores': {
        const pool_id = parseInt(data.get('pool_id') as string);

        // Get scores from db
        const query = 'SELECT * FROM PoolMatches WHERE pool_id = ?';
        const stmt = db.prepare(query);

        return json({ success: true, scores: stmt.all(pool_id) });
      }
      default: {
        return json({ success: false, message: 'Invalid action' });
      }
    }
  } catch (e) {
    // Return error if failed
    console.log(e);
    return json({ success: false, message: e.message });
  }
}
