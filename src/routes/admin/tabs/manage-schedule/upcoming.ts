import type { CourtMatchup } from '../../../../stores/schedule';
import type { Team } from '../../../../stores/teams';

export function getPoolMatchups(teams: Team[]) {
  // Make pool teams even
  if (teams.length % 2 !== 0) teams.push({ id: 'bye', name: 'Bye', pool_id: 0 } as Team);

  const numRounds = teams.length - 1;
  const matchups = [];

  // Create matchups
  for (let round = 0; round < numRounds; round++) {
    const roundMatchups = [];

    for (let i = 0; i < teams.length / 2; i++) {
      const matchup = [teams[i], teams[teams.length - 1 - i]];

      // Skip bye matchups
      if (matchup[0].id === 'bye' || matchup[1].id === 'bye') continue;

      roundMatchups.push(matchup);
    }

    // Rotate teams
    matchups.push(roundMatchups);
    teams.splice(1, 0, teams.pop()!);
  }

  // Flatten matchups
  const result = [];
  for (const round of matchups) {
    for (const matchup of round) {
      result.push({ type: 'pool', matchup } as CourtMatchup);
    }
  }

  return result;
}
