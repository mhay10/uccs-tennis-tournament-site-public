import { writable } from 'svelte/store';
import type { Team } from './teams';
import { courtPairs } from '../routes/admin/tabs/manage-schedule/courts';
import { colors } from '../routes/admin/tabs/manage-schedule/color';

export const schedules = writable<CourtSchedule[]>(
  Array.from(
    { length: courtPairs.length },
    () =>
      ({
        startStr: '',
        endStr: '',
        start: new Date(),
        end: new Date(),
        matchup: [{}, {}],
        color: colors[0]
      } as CourtSchedule)
  )
);
export const upcomingMatchups = writable<CourtMatchup[]>([]);
export const finishedMatchups = writable<CourtMatchup[]>([]);

export type CourtSchedule = {
  startStr: string;
  endStr: string;
  start: Date;
  end: Date;
  matchup: Team[];
  color: string;
};

export type CourtMatchup = {
  matchup: Team[];
};

export type DBMatchup = {
  team1_id: string;
  team2_id: string;
};

export type DBSchedule = {
  id: number;
  start: number;
  end: number;
  team1_id: string;
  team2_id: string;
  courts: string;
};
