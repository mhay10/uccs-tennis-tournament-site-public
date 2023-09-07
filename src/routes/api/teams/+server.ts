import { json, type RequestEvent } from '@sveltejs/kit';
import type { Team } from '../../../stores/teams.js';
import { checkAuth } from '../validation.js';
import { db } from '../db';

export async function POST(event: RequestEvent) {
  // Get teams from request
  const recvTeams: Team[] = await event.request.json();

  // Check if user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  try {
    const existingTeams: Team[] = [];
    const orphanedTeams: Team[] = [];
    const updatedTeams: Team[] = [];
    const newTeams: Team[] = [];

    // Get existing teams from database
    let query = 'SELECT id, name FROM Teams';
    let stmt = db.prepare(query);
    existingTeams.push(...(stmt.all() as Team[]));

    // Sort teams into new, updated
    for (const team of recvTeams) {
      if (team.added) newTeams.push(team);
      else if (team.updated) updatedTeams.push(team);
    }

    // Find orphaned teams
    const existingTeamIds = existingTeams.map((team) => team.id);
    const recvTeamIds = recvTeams.map((team) => team.id);
    const difference = existingTeamIds.filter((id) => !recvTeamIds.includes(id));
    for (const id of difference) {
      const team = existingTeams.find((team) => team.id === id);
      if (team) orphanedTeams.push(team);
    }

    // Update database
    query = 'UPDATE Teams SET name = ? WHERE id = ?';
    stmt = db.prepare(query);
    for (const team of updatedTeams) stmt.run(team.name, team.id);

    // Insert new teams
    query = 'INSERT INTO Teams (id, name) VALUES (?, ?)';
    stmt = db.prepare(query);
    for (const team of newTeams) stmt.run(team.id, team.name);

    // Delete orphaned teams
    query = 'DELETE FROM Teams WHERE id = ?';
    stmt = db.prepare(query);
    for (const team of orphanedTeams) stmt.run(team.id);

    return json({ success: true });
  } catch (e) {
    console.log(e);
    return json({ success: false, message: e.message });
  }
}

export async function GET() {
  // Get teams from database
  try {
    const query = 'SELECT * FROM Teams';
    const stmt = db.prepare(query);
    const teams = stmt.all() as Team[];

    return json({ success: true, teams });
  } catch (e) {
    console.log(e);
    return json({ success: false, message: e.message });
  }
}
