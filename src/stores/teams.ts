import { writable } from 'svelte/store';

export type Team = {
  name: string;
  id: string;
  added?: boolean;
  updated?: boolean;
  pool_id?: number;
  bracket_id?: number;
};

export const teams = writable([] as Team[]);
