import { writable } from 'svelte/store';

export type Bracket = {
  id: number;
  name: string;
  size: number;
  teams: BracketTeam[];
};

export type BracketTeam = {
  id: string;
  name: string;
  seed: number;
  bracket_id?: number;
};

export type BracketMatchup = {
  team1: { id: string; name: string; seed: number; score: number };
  team2: { id: string; name: string; seed: number; score: number };
};

export type BracketScores = { [round: string]: { matchups: BracketMatchup[] } };

// Limit of 4 brackets
export const bracketCount = writable(4);

// Bracket names
export const bracketNames = ['Gold', 'Silver', 'Bronze', 'Copper'];
