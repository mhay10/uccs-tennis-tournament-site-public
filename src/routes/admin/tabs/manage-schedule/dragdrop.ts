import {
  schedules,
  type CourtSchedule,
  upcomingMatchups,
  finishedMatchups
} from '../../../../stores/schedule';
import type { Team } from '../../../../stores/teams';

type DragData = {
  origin: string;
  team1: Team;
  team2: Team;
  prevIdx: number;
};

export function dragStart(event: DragEvent, team1: Team, team2: Team, idx: number) {
  // Get origin of drag
  const parent = (event.target as HTMLElement).parentElement!;
  let origin = '';
  if (parent.nodeName === 'TABLE') origin = 'schedule';
  else if (parent.nodeName === 'UL') origin = parent.id;

  // Set data to be transferred
  event.dataTransfer!.setData('text/plain', JSON.stringify({ origin, team1, team2, prevIdx: idx }));
}

export function dropSchedule(event: DragEvent, idx: number) {
  // Get data from drag
  const data = JSON.parse(event.dataTransfer!.getData('text/plain')) as DragData;
  const { origin, prevIdx, team1, team2 } = data;

  schedules.update((s) => {
    // Validate teams and origin
    if (!team1.name || !team2.name) return s;

    // Handle origin
    switch (origin) {
      case 'schedule':
        // Reset origin schedule
        const prevSchedule = s[prevIdx];
        if (prevSchedule.matchup.every((t) => !t.id))
          prevSchedule.matchup = [{} as Team, {} as Team];
        else prevSchedule.matchup = s[idx].matchup;
        break;
      case 'upcoming':
        // Remove from upcoming
        upcomingMatchups.update((u) => {
          u.splice(prevIdx, 1);
          return u;
        });
        break;
    }

    // Update schedule
    s[idx].matchup = [data.team1, data.team2];

    return s;
  });
}

export function dropUpcoming(event: DragEvent) {
  // Get data from drag
  const data = JSON.parse(event.dataTransfer!.getData('text/plain')) as DragData;
  const { origin, prevIdx, team1, team2 } = data;

  upcomingMatchups.update((u) => {
    // Validate teams and origin
    if (!team1.name || !team2.name) return u;
    if (origin === 'upcoming') return u;

    // Add to upcoming
    u.push({ matchup: [data.team1, data.team2] });

    // Handle origin
    switch (origin) {
      case 'schedule':
        // Reset origin schedule
        schedules.update((s) => {
          s[prevIdx].matchup = [{} as Team, {} as Team];
          return s;
        });
        break;
      case 'finished':
        // Remove from finished
        finishedMatchups.update((f) => {
          f.splice(prevIdx, 1);
          return f;
        });
        break;
    }

    return u;
  });
}

export function dropFinished(event: DragEvent) {
  // Get data from drag
  const data = JSON.parse(event.dataTransfer!.getData('text/plain')) as DragData;
  const { origin, prevIdx, team1, team2 } = data;

  finishedMatchups.update((f) => {
    // Validate teams and origin
    if (!team1.name || !team2.name) return f;
    if (origin === 'finished') return f;

    // Add to finished
    f.push({ matchup: [data.team1, data.team2] });

    // Handle origin
    switch (origin) {
      case 'schedule':
        // Reset origin schedule
        schedules.update((s) => {
          s[prevIdx].matchup = [{} as Team, {} as Team];
          return s;
        });
        break;
      case 'upcoming':
        // Remove from upcoming
        upcomingMatchups.update((u) => {
          u.splice(prevIdx, 1);
          return u;
        });
        break;
    }

    return f;
  });
}
