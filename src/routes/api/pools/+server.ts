import { json, type RequestEvent } from '@sveltejs/kit';
import { checkAuth } from '../validation.js';
import { db } from '../db';

export async function POST(event: RequestEvent) {
  // Get action from request
  const params = event.url.searchParams;
  const action = params.get('action');

  // Check if user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  // Get data from request
  const data = await event.request.json();

  try {
    switch (action) {
      case 'createPools': {
        // Get number and size of pools
        const poolCount: number = data.poolCount;
        const poolSize: number = data.poolSize;

        // Delete pool assignments
        let query = 'UPDATE Teams SET pool_id = NULL';
        let stmt = db.prepare(query);
        stmt.run();

        // Delete existing scores
        query = 'DELETE FROM PoolMatches';
        stmt = db.prepare(query);
        stmt.run();

        // Delete existing standings
        query = 'DELETE FROM PoolStandings';
        stmt = db.prepare(query);
        stmt.run();

        // Delete existing pools
        query = 'DELETE FROM Pools';
        stmt = db.prepare(query);
        stmt.run();

        // Add pools to database
        query = 'INSERT INTO Pools (id, size) VALUES (?, ?)';
        stmt = db.prepare(query);
        for (let i = 0; i < poolCount; i++) stmt.run(i, poolSize);

        return json({ success: true });
      }
      case 'assignTeams': {
        // Get pool data
        const pools = data.pools;

        // Update db with pool assignments
        const query = 'UPDATE Teams SET pool_id = ? WHERE id = ?';
        const stmt = db.prepare(query);
        for (const pool of pools) {
          for (const team of pool.teams) stmt.run(pool.id, team.id);
        }

        return json({ success: true });
      }
      default:
        return json({ success: false, message: 'Invalid action' });
    }
  } catch (e) {
    console.log(e);
    return json({ success: false, message: e.message });
  }
}
