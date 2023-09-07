<script lang="ts">
  import type { PoolScore, PoolTeam } from '../../stores/pools';

  export let selectedTeam: PoolTeam;
  export let otherTeams: PoolTeam[];
  export let poolScores: PoolScore[];
</script>

<h2>Scores</h2>
<table>
  <tr>
    <td />
    <td />
    <th>{selectedTeam.name}<br /><i>{selectedTeam.id}</i></th>
  </tr>
  {#each otherTeams as team}
    {@const poolIdx = poolScores.findIndex(
      (score) =>
        (score.team1_id === selectedTeam.id && score.team2_id === team.id) ||
        (score.team1_id === team.id && score.team2_id === selectedTeam.id)
    )}

    {#if poolIdx !== -1}
      {@const selectedIsTeam1 = poolScores[poolIdx].team1_id === selectedTeam.id}

      <tr>
        <th>{team.name}<br /><i>{team.id}</i></th>
        <td>
          {#if selectedIsTeam1}
            <input type="number" bind:value={poolScores[poolIdx].team2_score} readonly />
          {:else}
            <input type="number" bind:value={poolScores[poolIdx].team1_score} readonly />
          {/if}
        </td>
        <td>
          {#if selectedIsTeam1}
            <input type="number" bind:value={poolScores[poolIdx].team1_score} readonly />
          {:else}
            <input type="number" bind:value={poolScores[poolIdx].team2_score} readonly />
          {/if}
        </td>
      </tr>
    {/if}
  {/each}
</table>

<style>
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
