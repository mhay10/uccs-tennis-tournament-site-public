<script lang="ts">
  import { onMount } from 'svelte';
  import {
    upcomingMatchups,
    type CourtMatchup,
    finishedMatchups,
    schedules
  } from '../../../../stores/schedule';
  import { teams } from '../../../../stores/teams';
  import { getPoolMatchups } from './upcoming';
  import { poolSize } from '../../../../stores/pools';
  import { dragStart, dropUpcoming } from './dragdrop';

  onMount(async () => {
    // Let finished matchups load first
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Organize teams into pools
    const poolIds = [...new Set($teams.map((team) => team.pool_id!))];
    const pools = poolIds.map((id) => ({
      id,
      teams: $teams.filter((team) => team.pool_id === id)
    }));

    // Get upcoming matchups
    const upcoming = (await fetch('/api/schedule?which=upcomingMatchups').then((res) => res.json()))
      .upcomingMatchups;
    for (const matchup of upcoming) {
      const team1 = $teams.find((team) => team.id === matchup.team1_id)!;
      const team2 = $teams.find((team) => team.id === matchup.team2_id)!;
      $upcomingMatchups.push({ matchup: [team1, team2] });
    }

    // Genereate missing matchups
    const poolSorted: { [id: number]: CourtMatchup[] } = {};
    for (const pool of pools) {
      const generated = getPoolMatchups(pool.teams);
      for (const { matchup } of generated) {
        // Check if matchup already exists or is playing
        const exists =
          $upcomingMatchups.find(
            (m) => m.matchup[0].id === matchup[0].id && m.matchup[1].id === matchup[1].id
          ) ||
          $finishedMatchups.find(
            (m) => m.matchup[0].id === matchup[0].id && m.matchup[1].id === matchup[1].id
          ) ||
          $schedules.find(
            (s) => s.matchup[0].id === matchup[0].id && s.matchup[1].id === matchup[1].id
          );
        if (exists) continue;

        if (!poolSorted[pool.id]) poolSorted[pool.id] = [];
        poolSorted[pool.id].push({ matchup });
      }
    }

    // Sort matchups
    const sorted = [];

    const loopAmt = Array.from({ length: poolSize })
      .map((_, i) => i + 1)
      .reduce((acc, val) => acc + (poolSize - val), 0);
    for (let i = 0; i < loopAmt; i++) {
      for (const poolId of Object.keys(poolSorted) as any[] as number[]) {
        const matchups = poolSorted[poolId].splice(0, 2);
        sorted.push(...matchups);
      }
    }

    // Add to upcoming matchups
    $upcomingMatchups = [...$upcomingMatchups, ...sorted];
  });
</script>

<h3>Upcoming Matchups</h3>
<ul id="upcoming" on:dragover|preventDefault={() => false} on:drop={(e) => dropUpcoming(e)}>
  {#each $upcomingMatchups as { matchup }, i (i)}
    <li
      class="matchup"
      draggable={true}
      on:dragstart={(e) => dragStart(e, matchup[0], matchup[1], i)}
    >
      <p class="team">{matchup[0].id}</p>
      <b>VS</b>
      <p class="team">{matchup[1].id}</p>
    </li>
  {/each}
</ul>

<style>
  #upcoming {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: var(--height);
    overflow-y: scroll;
    padding: 0.5rem;
    scrollbar-width: thin;
    border: 1px solid black;
  }

  .matchup {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    height: 2.5rem;
    border: 1px solid black;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: lightgrey;
  }
</style>
