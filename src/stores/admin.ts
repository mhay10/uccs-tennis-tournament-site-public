import { writable } from 'svelte/store';

export const currentTab = writable(0);
export const tabMap = {
  'Add Teams': 0,
  'Create Pools': 1,
  'Enter Scores': 2,
  'Create Brackets': 3,
  'Manage Brackets': 4,
  'Manage Schedule': 5
};
