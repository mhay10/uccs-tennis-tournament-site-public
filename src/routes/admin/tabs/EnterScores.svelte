<script lang="ts">
  import type { PoolScore, PoolTeam } from '../../../stores/pools';
  import { currentTab, tabMap } from '../../../stores/admin';
  import { onMount } from 'svelte';
  import { auth } from '../auth';

  let teams = [] as PoolTeam[];
  let selectedTeamIdx = -1;
  let otherTeams = [] as PoolTeam[];
  let currentPoolScores = [] as PoolScore[];
  let selectedTeam: PoolTeam;

  $: selectedTeam = teams[selectedTeamIdx];

  async function getCurrentPool(teamIdx: number) {
    // Get current pool teams
    selectedTeam = teams[teamIdx];
    otherTeams = teams.filter(
      (team) => team.pool_id === selectedTeam.pool_id && team.id !== selectedTeam.id
    );

    // Get current scores between teams
    const res = await auth.fetch(
      '/api/scores?' + new URLSearchParams({ action: 'getScores', pool_id: selectedTeam.pool_id })
    );
    const data = await res.json();
    if (!data.success) alert(data.messsage);
    else {
      // Get current pool scores
      currentPoolScores = data.scores;

      // Add missing scores
      const missingMatchups = otherTeams.filter(
        (team) =>
          !currentPoolScores.some(
            (score) =>
              (score.team1_id === selectedTeam.id && score.team2_id === team.id) ||
              (score.team1_id === team.id && score.team2_id === selectedTeam.id)
          )
      );
      for (const team of missingMatchups) {
        currentPoolScores.push({
          pool_id: selectedTeam.pool_id,
          team1_id: selectedTeam.id,
          team2_id: team.id,
          team1_score: null,
          team2_score: null
        } as PoolScore);
      }
    }
  }

  async function handleSubmit() {
    // Get scores for selected team
    const selectedScores = currentPoolScores.filter(
      (team) => team.team1_id === selectedTeam.id || team.team2_id === selectedTeam.id
    );

    // Submit scores to server
    const res = await auth.fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: selectedScores
      })
    });

    const data = await res.json();
    if (!data.success) alert(data.message);
    else alert('Scores submitted successfully.');
  }

  onMount(async () => {
    // Get current team pool assignments
    const res = await auth.fetch('/api/scores?' + new URLSearchParams({ action: 'getTeams' }));
    const data = await res.json();
    if (data.success) {
      // Make sure all teams have pool assigned
      if (data.teams.every((team) => team.pool_id === null)) {
        alert('Please organize teams into pools before entering scores.');
        $currentTab = tabMap['Create Pools'];
        return;
      }

      // Add teams
      teams = data.teams;
    } else alert(data.message);
  });
</script>

<main>
  <h2>Select Team</h2>
  <select bind:value={selectedTeamIdx} on:change={() => getCurrentPool(selectedTeamIdx)}>
    <option value={-1} selected>Select a Team</option>
    {#each teams as team, teamIdx}
      <option value={teamIdx}>{team.name} - {team.id}</option>
    {/each}
  </select>
  {#if selectedTeamIdx !== -1}
    <h2>Enter Scores</h2>
    <div id="score-entry">
      <form on:submit|preventDefault={handleSubmit}>
        <table>
          <tr>
            <td />
            <td />
            <th>{selectedTeam.name}<br /><i>{selectedTeam.id}</i></th>
          </tr>
          {#each otherTeams as team}
            {@const poolIdx = currentPoolScores.findIndex(
              (score) =>
                (score.team1_id === selectedTeam.id && score.team2_id === team.id) ||
                (score.team1_id === team.id && score.team2_id === selectedTeam.id)
            )}

            {#if poolIdx !== -1}
              {@const selectedIsTeam1 = currentPoolScores[poolIdx].team1_id === selectedTeam.id}

              <tr>
                <th>{team.name}<br /><i>{team.id}</i></th>
                <td>
                  {#if selectedIsTeam1}
                    <input
                      type="number"
                      min="0"
                      bind:value={currentPoolScores[poolIdx].team2_score}
                    />
                  {:else}
                    <input
                      type="number"
                      min="0"
                      bind:value={currentPoolScores[poolIdx].team1_score}
                    />
                  {/if}
                </td>
                <td>
                  {#if selectedIsTeam1}
                    <input
                      type="number"
                      min="0"
                      bind:value={currentPoolScores[poolIdx].team1_score}
                    />
                  {:else}
                    <input
                      type="number"
                      min="0"
                      bind:value={currentPoolScores[poolIdx].team2_score}
                    />
                  {/if}
                </td>
              </tr>
            {/if}
          {/each}
        </table>

        <button type="submit">Apply</button>
      </form>
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
  }

  select {
    margin-bottom: 2rem;
  }

  #score-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.5rem;
  }

  table {
    border-collapse: collapse;
    margin: 0.5rem 0 2rem 0;
    font-size: 0.9em;
    min-width: 400px;
  }

  table tr th,
  table tr:first-child td:nth-child(2) {
    background-color: var(--color-theme-1);
    color: var(--color-theme-2);
    text-align: center;
  }

  table th,
  table td {
    padding: 12px 15px;
  }

  table tr:not(:first-child) {
    border-bottom: 1px solid var(--color-theme-1);
    text-align: center;
  }

  input {
    width: 3rem;
  }
</style>
