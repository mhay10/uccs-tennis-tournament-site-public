import { writable } from 'svelte/store';
import type { Team } from './teams';

export type Pool = {
  id: number;
  teams: Team[];
};

export type PoolTeam = {
  id: string;
  name: string;
  pool_id: number;
};

export type PoolScore = {
  pool_id: number;
  team1_id: string;
  team2_id: string;
  team1_score: number;
  team2_score: number;
};

export type PoolStanding = {
  team_id: string;
  pool_id: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  games_won: number;
  games_lost: number;
};

export type PoolTeamResult = {
  team_id: string;
  pool_id: number;
  win_percent: number;
};

export const poolCount = writable(8);
export const poolSize = 4;
