import type { Bracket } from '../../../stores/brackets';
import { checkAuth } from '../validation.js';
import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '../db';
import type { PoolScore, PoolStanding, PoolTeamResult } from '../../../stores/pools';

export async function POST(event: RequestEvent) {
  // Get bracket data
  const data = await event.request.json();
  const brackets: Bracket[] = data.brackets;

  // Check if user is authenticated
  if (!checkAuth(event)) return json({ success: false });

  try {
    // Calculate pool standings for bracket placement
    const poolStandings = calculateStandings();

    // Clear previous pool standings
    let query = 'DELETE FROM PoolStandings';
    let stmt = db.prepare(query);
    stmt.run();

    // Add new pool standings
    query =
      'INSERT INTO PoolStandings (team_id, pool_id, matches_played, matches_won, matches_lost, games_won, games_lost) VALUES (?, ?, ?, ?, ?, ?, ?)';
    stmt = db.prepare(query);
    for (const [pool, standings] of Object.entries(poolStandings)) {
      for (const standing of standings as PoolStanding[]) {
        stmt.run(
          standing.team_id,
          pool,
          standing.matches_played,
          standing.matches_won,
          standing.matches_lost,
          standing.games_won,
          standing.games_lost
        );
      }
    }

    // Clear assigned brackets
    query = 'UPDATE Teams SET bracket_id = NULL';
    stmt = db.prepare(query);
    stmt.run();

    // Clear previous bracket scores
    query = 'DELETE FROM BracketMatches';
    stmt = db.prepare(query);
    stmt.run();

    // Clear previous brackets
    query = 'DELETE FROM Brackets';
    stmt = db.prepare(query);
    stmt.run();

    // Add new brackets
    query = 'INSERT INTO Brackets (id, name, size) VALUES (?, ?, ?)';
    stmt = db.prepare(query);
    for (const bracket of brackets) stmt.run(bracket.id, bracket.name, bracket.size);

    // Sort pools into master list
    const sortedTeams = sortTeams(poolStandings);

    // Add teams to brackets
    query = 'UPDATE Teams SET bracket_id = ? WHERE id = ?';
    stmt = db.prepare(query);

    let bracketIdx = 0;
    let bracketSize = 0;
    for (const team of sortedTeams) {
      // Move to next bracket if current bracket is full
      if (bracketSize >= brackets[bracketIdx].size) {
        bracketIdx++;
        bracketSize = 0;
      }

      // Add team to bracket
      stmt.run(brackets[bracketIdx].id, team.team_id);
      bracketSize++;
    }

    // Create seeded team list for each bracket
    query = 'UPDATE Brackets SET teams = ? WHERE id = ?';
    stmt = db.prepare(query);
    for (const bracket of brackets) {
      const teams = sortedTeams.splice(0, bracket.size);
      stmt.run(teams.map((t) => t.team_id).join('&&'), bracket.id);
    }

    return json({ success: true });
  } catch (e) {
    console.log(e);
    return json({ success: false, message: e.message });
  }
}

function sortTeams(poolStandings: { [pool: number]: PoolStanding[] }) {
  // Master list of teams and win percentages
  const sortedTeams: PoolTeamResult[] = [];

  for (const standings of Object.values(poolStandings)) {
    // Calculate win percentages for each team
    const winPercents = standings.map((standing, i) => {
      // Calculate win percentage and add 1 - 4 based on index
      let winPercent = standing.games_won / (standing.games_won + standing.games_lost);
      winPercent += standings.length - i;

      return { team_id: standing.team_id, pool_id: standing.pool_id, win_percent: winPercent };
    });

    // Add win percentages to master list
    sortedTeams.push(...winPercents);
  }

  // Sort teams by win percentage
  sortedTeams.sort((a, b) => b.win_percent - a.win_percent);

  return sortedTeams;
}

function calculateStandings() {
  // Get all matches
  let query = 'SELECT * FROM PoolMatches';
  let stmt = db.prepare(query);
  const matches = stmt.all() as PoolScore[];

  // Get all pool ids
  query = 'SELECT id FROM Pools';
  stmt = db.prepare(query);
  const poolIds = stmt.all().map((pool) => pool.id) as number[];

  // Sort matches by pool
  const poolScores: { [key: string]: PoolScore[] } = {};
  for (const poolId of poolIds)
    poolScores[poolId] = matches.filter((match) => match.pool_id === poolId);

  // Calculate standings for each pool
  const allStandings: { [pool: number]: PoolStanding[] } = {};
  for (const poolId of poolIds) {
    // Get all matches in pool
    const matches = poolScores[poolId];
    const poolStandings = [];

    // Get all teams in pool
    const teams = new Set<string>();
    for (const match of matches) {
      teams.add(match.team1_id);
      teams.add(match.team2_id);
    }

    for (const team of teams) {
      // Get all matches team played
      const teamMatches = matches.filter(
        (match) => match.team1_id === team || match.team2_id === team
      );

      // Get all matches and games won and lost
      let matchesWon = 0;
      let matchesLost = 0;
      let gamesWon = 0;
      let gamesLost = 0;

      for (const match of teamMatches) {
        // Get which team is the team
        const whichTeam = match.team1_id === team ? 1 : 2;
        if (whichTeam == 1) {
          // If
          if (match.team1_score > match.team2_score) matchesWon++;
          else matchesLost++;

          gamesWon += match.team1_score;
          gamesLost += match.team2_score;
        } else {
          if (match.team2_score > match.team1_score) matchesWon++;
          else matchesLost++;

          gamesWon += match.team2_score;
          gamesLost += match.team1_score;
        }
      }

      // Add team to standings
      const standing = {
        team_id: team,
        pool_id: poolId,
        games_won: gamesWon,
        games_lost: gamesLost,
        matches_won: matchesWon,
        matches_lost: matchesLost,
        matches_played: matchesWon + matchesLost
      };
      poolStandings.push(standing);
    }

    /* Sort standings by the following rules:
			No tie: # of wins
			2 way tie: # of games won
			3 way tie: win % (games won / games played)
		*/
    poolStandings.sort((a, b) => {
      if (a.matches_won !== b.matches_won) {
        // No tie
        return b.matches_won - a.matches_won;
      } else if (a.games_won !== b.games_won) {
        // 2 way tie
        return b.games_won - a.games_won;
      } else {
        // 3 way tie
        const totalGamesA = a.games_won + a.games_lost;
        const winPercentA = a.games_won / totalGamesA;

        const totalGamesB = b.games_won + b.games_lost;
        const winPercentB = b.games_won / totalGamesB;

        return winPercentB - winPercentA;
      }
    });

    // Add standings to all standings
    allStandings[poolId] = poolStandings;
  }

  return allStandings;
}
