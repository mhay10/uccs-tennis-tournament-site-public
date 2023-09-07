<script lang="ts">
  import type { Pool, PoolScore } from '../../stores/pools';

  export let selectedPool: Pool;
  export let poolScores: PoolScore[];

  $: topTeams = selectedPool.teams.slice(0, -1);
  $: sideTeams = selectedPool.teams.slice(1);
</script>

<small>
  Higher Score: Top Row
  <br />
  Lower Score: Side Column
</small>
<br />
<table>
  <tr>
    <td />
    {#each topTeams as team}
      <th>{team.name}<br /><i>{team.id}</i></th>
    {/each}
  </tr>
  {#each sideTeams as team, row}
    <tr>
      <th>{team.name}<br /><i>{team.id}</i></th>
      {#each topTeams as otherTeam, col}
        <td>
          {#if team.id === otherTeam.id || row < col}
            <input type="number" disabled />
          {:else}
            {@const scoreIdx = poolScores.findIndex(
              (score) =>
                (score.team1_id === team.id && score.team2_id === otherTeam.id) ||
                (score.team1_id === otherTeam.id && score.team2_id === team.id)
            )}

            {#if scoreIdx !== -1}
              {@const topIsTeam1 = poolScores[scoreIdx].team1_id === otherTeam.id}

              <tr class="score">
                <td>
                  {#if topIsTeam1}
                    <input type="number" bind:value={poolScores[scoreIdx].team1_score} readonly />
                  {:else}
                    <input type="number" bind:value={poolScores[scoreIdx].team2_score} readonly />
                  {/if}
                </td>
                <td>
                  {#if topIsTeam1}
                    <input type="number" bind:value={poolScores[scoreIdx].team2_score} readonly />
                  {:else}
                    <input type="number" bind:value={poolScores[scoreIdx].team1_score} readonly />
                  {/if}
                </td>
              </tr>
            {/if}
          {/if}
        </td>
      {/each}
    </tr>
  {/each}
</table>

<style>
  table {
    border-collapse: collapse;
    margin: 0.5rem 0 2rem 0;
    font-size: 0.9em;
  }

  th {
    background-color: var(--color-theme-1);
    color: var(--color-theme-2);
    text-align: center;
    padding: 12px 15px;
  }

  table tr:not(:first-child) {
    border-bottom: 1px solid var(--color-theme-1);
    text-align: center;
  }

  .score {
    display: flex;
    flex-direction: column;
  }
</style>
