<script lang="ts">
  import { onMount } from 'svelte';
  import type { PoolScore, PoolTeam } from '../../stores/pools';
  import TeamView from './TeamView.svelte';
  import PoolView from './PoolView.svelte';

  let whichSelected: 'team' | 'pool';

  let teams: PoolTeam[] = [];
  let otherTeams: PoolTeam[];

  let selectedTeamIdx = -1;
  let selectedPoolIdx = -1;

  let poolScores: PoolScore[] = [];

  $: poolIds = [...new Set(teams.map((team) => team.pool_id))];
  $: pools = poolIds.map((poolId) => ({
    id: poolId,
    teams: teams
      .filter((team) => team.pool_id === poolId)
      .map((team) => ({
        id: team.id,
        name: team.name
      }))
  }));
  $: selectedPool = pools[selectedPoolIdx];

  $: selectedTeam = teams[selectedTeamIdx];
  $: if (selectedTeamIdx !== -1) {
    otherTeams = teams.filter(
      (team) => team.pool_id === selectedTeam.pool_id && team.id !== selectedTeam.id
    );
  }

  async function getScores() {
    // Make sure a team or pool is selected
    if (selectedTeamIdx === -1 && whichSelected === 'team') return;
    if (selectedPoolIdx === -1 && whichSelected === 'pool') return;

    // Reset other option
    if (whichSelected === 'team') selectedPoolIdx = -1;
    else selectedTeamIdx = -1;

    // Get the selected pool
    const poolId = whichSelected === 'team' ? teams[selectedTeamIdx].pool_id : selectedPoolIdx;
    const res = await fetch(`/api/scores?action=getScores&pool_id=${poolId}`);
    const data = await res.json();

    if (!data.success) alert(data.message);
    else {
      poolScores = data.scores;
    }
  }

  onMount(async () => {
    const res = await fetch('/api/teams');
    const data = await res.json();

    if (!data.success) alert(data.message);
    else teams = data.teams;
  });
</script>

<main>
  <h3>Pool Play</h3>
  <br />
  <div id="options">
    <div class="option">
      <h2>Select Team</h2>
      <select
        bind:value={selectedTeamIdx}
        on:change={getScores}
        on:input={() => (whichSelected = 'team')}
      >
        <option value={-1}>Select a team</option>
        {#each teams as team, teamIdx}
          <option value={teamIdx}>{team.name} - {team.id}</option>
        {/each}
      </select>
    </div>
    <h3>OR</h3>
    <div class="option">
      <h2>Select Pool</h2>
      <select
        bind:value={selectedPoolIdx}
        on:change={getScores}
        on:input={() => (whichSelected = 'pool')}
      >
        <option value={-1}>Select a pool</option>
        {#each pools as _, poolIdx}
          <option value={poolIdx}>Pool {poolIdx}</option>
        {/each}
      </select>
    </div>
  </div>
  <br />
  <div id="scores">
    {#if selectedTeamIdx !== -1 && whichSelected === 'team'}
      <TeamView {selectedTeam} {otherTeams} {poolScores} />
    {:else if selectedPoolIdx !== -1 && whichSelected === 'pool'}
      <PoolView {selectedPool} {poolScores} />
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  #options {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 2rem;
  }

  #scores {
    margin-top: 2rem;
  }
</style>
