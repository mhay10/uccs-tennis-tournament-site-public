<script lang="ts">
  import { onMount } from 'svelte';
  import { finishedMatchups } from '../../../../stores/schedule';
  import { teams } from '../../../../stores/teams';
  import { dragStart, dropFinished } from './dragdrop';

  onMount(async () => {
    const finished = (await fetch('/api/schedule?which=finishedMatchups').then((res) => res.json()))
      .finishedMatchups;
    for (const matchup of finished) {
      const team1 = $teams.find((team) => team.id === matchup.team1_id)!;
      const team2 = $teams.find((team) => team.id === matchup.team2_id)!;
      $finishedMatchups = [...$finishedMatchups, { matchup: [team1, team2] }];
    }
  });
</script>

<h3>Finished Matchups</h3>
<ul id="finished" on:dragover|preventDefault={() => false} on:drop={(e) => dropFinished(e)}>
  {#each $finishedMatchups as { matchup }, i (i)}
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
  #finished {
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
