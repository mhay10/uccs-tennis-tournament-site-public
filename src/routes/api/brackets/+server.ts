import { json } from '@sveltejs/kit';
import { checkAuth } from '../validation.js';
import type { RequestEvent } from './$types';
import { db } from '../db';
import type { Bracket, BracketMatchup, BracketScores } from '../../../stores/brackets';

export async function GET(event: RequestEvent) {
  const params = event.url.searchParams;
  const action = params.get('action');

  try {
    switch (action) {
      case 'getPreload': {
        // Get bracket data
        let query = 'SELECT id, name, teams FROM Brackets';
        let stmt = db.prepare(query);
        const brackets = stmt.all() as Bracket[];

        // Split teams into array
        for (const bracket of brackets) bracket.teams = bracket.teams.split('&&');

        // Convert team ids to objects
        query = 'SELECT * FROM Teams';
        stmt = db.prepare(query);
        const teams = stmt.all();

        for (const bracket of brackets) {
          for (let i = 0; i < bracket.teams.length; i++) {
            bracket.teams[i] = teams.find((team: Team) => team.id === bracket.teams[i]);
            bracket.teams[i].seed = i + 1;
            delete bracket.teams[i].pool_id;
          }
        }

        return json({ success: true, brackets });
      }
      case 'getScores': {
        // Get bracket id
        const bracketId = parseInt(params.get('bracket_id') as string);

        // Get scores
        const query = 'SELECT * FROM BracketMatches WHERE bracket_id = ?';
        const stmt = db.prepare(query);
        const scores = stmt.all(bracketId);

        // Return data
        return json({ success: true, scores });
      }
      default:
        return json({ success: false, message: 'Invalid action.' });
    }
  } catch (e) {
    // Return error
    console.log(e);
    return json({ success: false, message: e.message });
  }
}

export async function POST(event: RequestEvent) {
  const data = await event.request.json();

  // Check if user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  try {
    // Get bracket id and scores
    const bracketId = data.bracket_id as number;
    const allScores = data.scores as BracketScores;

    // Get existing scores
    let query = 'SELECT * FROM BracketMatches WHERE bracket_id = ?';
    let stmt = db.prepare(query);
    const existingScores = stmt.all(bracketId);

    // Sort into new, updated, and old scores
    const newScores: { round: string; matchup: BracketMatchup }[] = [];
    const updatedScores: { round: string; matchup: BracketMatchup }[] = [];

    for (const round of Object.keys(allScores)) {
      const { matchups } = allScores[round];
      for (const matchup of matchups) {
        // Skip pending and bye matchups
        if (matchup.team1.seed === 0 || matchup.team2.seed === 0) continue;

        // Check if matchup already exists
        const existingMatchup = existingScores.find(
          (m) =>
            m.round === round && m.team1_id === matchup.team1.id && m.team2_id === matchup.team2.id
        );

        // Add matchup to new or updated scores
        if (existingMatchup) updatedScores.push({ matchup, round });
        else newScores.push({ matchup, round });
      }
    }

    // Insert new scores
    query =
      'INSERT INTO BracketMatches (bracket_id, round, team1_id, team2_id, team1_score, team2_score) VALUES (?, ?, ?, ?, ?, ?)';
    stmt = db.prepare(query);

    for (const { round, matchup } of newScores) {
      const { team1, team2 } = matchup;
      stmt.run(bracketId, round, team1.id, team2.id, team1.score, team2.score);
    }

    // Update existing scores
    query =
      'UPDATE BracketMatches SET team1_score = ?, team2_score = ? WHERE team1_id = ? AND team2_id = ? AND round = ?';
    stmt = db.prepare(query);

    for (const { round, matchup } of updatedScores) {
      const { team1, team2 } = matchup;
      stmt.run(team1.score, team2.score, team1.id, team2.id, round);
    }

    // Return success
    return json({ success: true });
  } catch (e) {
    // Return error
    console.log(e);
    return json({ success: false, message: e.message });
  }
}
