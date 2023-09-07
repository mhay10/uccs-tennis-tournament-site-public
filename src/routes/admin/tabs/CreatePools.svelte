<script lang="ts">
  import { poolCount, poolSize } from '../../../stores/pools';
  import OrganizeTeams from './create-pools/OrganizeTeams.svelte';
  import { _showError } from '../../+page';
  import { auth } from '../auth';

  let organizingTeams = false;

  // Change size of pools
  const increasePoolCount = () => $poolCount < 8 && ($poolCount = $poolCount + 1);
  const decreasePoolCount = () => $poolCount > 1 && ($poolCount = $poolCount - 1);

  // Create pools and initialize selectedTeams
  async function handlePoolSubmit() {
    // Create pools
    const res = await auth.fetch('/api/pools?action=createPools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        poolCount: $poolCount,
        poolSize: poolSize
      })
    });

    const data = await res.json();
    if (!data.success) _showError(data.message, false);
    else organizingTeams = true;
  }
</script>

<main>
  {#if !organizingTeams}
    <form on:submit|preventDefault={handlePoolSubmit}>
      <h2>Number of Pools</h2>
      <div id="count-counter">
        <button on:click={decreasePoolCount} type="button"><b>-</b></button>
        <p>{$poolCount}</p>
        <button on:click={increasePoolCount} type="button"><b>+</b></button>
      </div>
      <button type="submit">Create Pools</button>
    </form>
    <br />
    <h2 style="color: red;">
      <b>Warning: Creating new pools will erase all previous scores and team assignments!</b>
    </h2>
    <br />
  {:else if organizingTeams}
    <OrganizeTeams />
  {/if}
</main>

<style>
  main {
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #count-counter {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  #count-counter p {
    margin: 0.5rem;
    font-size: 1.4rem;
  }
</style>
