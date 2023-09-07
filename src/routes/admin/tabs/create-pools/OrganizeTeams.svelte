<script lang="ts">
  import { flip } from 'svelte/animate';
  import { poolCount, poolSize } from '../../../../stores/pools';
  import { teams, type Team } from '../../../../stores/teams';
  import { _showError } from '../../../+page';
  import { auth } from '../../auth';

  // TODO: This is a temporary version with pre-allocated teams, remove when releasing
  // let tmpTeams = [...$teams];
  // let pools = [
  //   {
  //     id: -1,
  //     name: 'Teams Left',
  //     teams: []
  //   },
  //   ...Array.from({ length: $poolCount }, (_, i) => ({
  //     id: i,
  //     name: `Pool ${i + 1}`,
  //     teams: tmpTeams.splice(0, poolSize)
  //   }))
  // ];

  // TODO: This is the real version, uncomment when releasing
  let pools = [
  	{
          id: -1,
  		name: 'Teams Left',
  		teams: [...$teams]
  	},
  	...Array.from({ length: $poolCount }, (_, i) => ({
          id: i,
  		name: `Pool ${i + 1}`,
  		teams: [] as Team[]
  	}))
  ];

  let hoveringOverPool: string | null;

  function dragStart(event: DragEvent, poolIdx: number, teamIdx: number) {
    // Make data available to drop event
    const data = { poolIdx, teamIdx };
    event.dataTransfer!.setData('text/plain', JSON.stringify(data));
  }

  function drop(event: DragEvent, poolIdx: number) {
    // Get data from drag event
    const json = event.dataTransfer!.getData('text/plain');
    const data = JSON.parse(json);

    // Remove team from previous pool
    const [item] = pools[data.poolIdx].teams.splice(data.teamIdx, 1);

    // Add item to target pool
    if (poolIdx !== 0 && pools[poolIdx].teams.length < poolSize) {
      pools[poolIdx].teams.push(item);
      pools = pools;
    } else if (poolIdx === 0) {
      pools[0].teams.push(item);
      pools = pools;
    } else alert('Pool is full');

    hoveringOverPool = null;
  }

  async function handlePoolAssignments() {
    // Only submit if all teams are assigned to a pool
    if (pools[0].teams.length !== 0) {
      alert('Please assign all teams to a pool');
      pools = pools;
      return;
    }

    const res = await auth.fetch('/api/pools?action=assignTeams', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ pools: pools.slice(1) })
    });

    const data = await res.json();
    if (data.success) alert('Pools assigned successfully');
    else _showError(data.message, false);
  }
</script>

<h2>Organize Teams</h2>
<button on:click={handlePoolAssignments}>Assign Teams</button>
{#each pools as pool, poolIdx (pool)}
  <div class="pool" animate:flip>
    <b>{pool.name}</b>
    <ul
      class:hovering={hoveringOverPool === pool.name}
      on:dragenter={() => (hoveringOverPool = pool.name)}
      on:dragleave={() => (hoveringOverPool = null)}
      on:drop|preventDefault={(event) => drop(event, poolIdx)}
      ondragover="return false"
    >
      {#each pool.teams as team, teamIdx (team)}
        <div class="item" animate:flip>
          <li draggable="true" on:dragstart={(event) => dragStart(event, poolIdx, teamIdx)}>
            {team.name}
            <br />
            <i>{team.id}</i>
          </li>
        </div>
      {/each}
    </ul>
  </div>
{/each}

<style>
  .pool {
    margin-bottom: 2rem;
  }

  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    border: 0.1rem solid var(--color-theme-2);
    border-radius: 0.3rem;
    min-height: 3rem;
    margin-bottom: 1rem;
  }

  .item {
    display: inline-flex;
    background-color: var(--color-theme-3);
    padding: 0.5rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.1s linear;
  }

  .item:hover {
    background-color: var(--color-theme-1);
    transition: background-color 0.1s linear;
  }

  button {
    margin-bottom: 2rem;
  }
</style>
