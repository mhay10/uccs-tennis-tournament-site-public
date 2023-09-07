<script lang="ts">
  import { bracketCount, bracketNames } from '../../../stores/brackets';
  import { teams } from '../../../stores/teams';
  import { tabMap } from '../../../stores/admin';
  import { onMount, afterUpdate, beforeUpdate } from 'svelte';
  import { _showError } from '../../+page';
  import { auth } from '../auth';

  let bracketSizes: number[] = [];
  let defaultBracketSize: number;

  $: defaultBracketSize = Math.ceil($teams.length / $bracketCount);
  $: $bracketCount,
    (() => {
      bracketSizes = Array($bracketCount);

      let numTeams = $teams.length;
      let bracketIdx = 0;
      while (numTeams > 0) {
        bracketSizes[bracketIdx] = Math.min(numTeams, defaultBracketSize);
        numTeams -= defaultBracketSize;
        bracketIdx++;
      }
    })();

  const increaseBracketCount = () => $bracketCount < 4 && ($bracketCount = $bracketCount + 1);
  const decreaseBracketCount = () => $bracketCount > 1 && ($bracketCount = $bracketCount - 1);

  function increaseBracketSize(bracketIdx: number) {
    const otherBracketSizes = bracketSizes
      .filter((_, idx) => idx !== bracketIdx)
      .reduce((a, b) => a + b, 0);

    // Check to see if bracket is already at max size
    if (bracketSizes[bracketIdx] < $teams.length - otherBracketSizes) bracketSizes[bracketIdx]++;
  }

  function decreaseBracketSize(bracketIdx: number) {
    console.log(bracketIdx, bracketSizes[bracketIdx]);
    // Check to see if bracket is already at min size
    if (bracketSizes[bracketIdx] > 1) bracketSizes[bracketIdx]--;

    // bracketSizes[bracketIdx]--;
  }

  onMount(async () => {
    // Get teams and pool ids
    let res = await fetch('/api/teams');
    let data = await res.json();
    if (!data.success) {
      _showError(data.message, false);
      return;
    }

    // Filter out pool ids
    $teams = [];
    const poolIds = new Set<number>();

    for (const team of data.teams) {
      $teams = [...$teams, { name: team.name, id: team.id }];
      poolIds.add(team.pool_id);
    }

    // Make sure all pools have scores
    for (const poolId of poolIds) {
      // Get scores for pool
      res = await fetch(`/api/scores?action=getScores&pool_id=${poolId}`);
      data = await res.json();
      if (!data.success) {
        _showError(data.message, false);
        return;
      }

      // Check to see if all teams have scores
      if (!data.scores.length) {
        _showError('Not all teams have scores!', true, tabMap['Enter Scores']);
        return;
      }

      for (const score of data.scores) {
        if (score.team1_score === null || score.team2_score === null) {
          _showError('Not all teams have scores!', true, tabMap['Enter Scores']);
          return;
        }
      }
    }
  });

  async function handleSubmit() {
    // Make sure brackets are valid
    let total = 0;
    for (const size of bracketSizes) {
      // Make sure bracket size is at least 2
      if (size < 2) {
        _showError('All brackets must have at least 2 teams!', false);
        return;
      }

      total += size;
    }

    // Make sure bracket sizes add up to total number of teams
    if (total != $teams.length) {
      _showError('Bracket sizes must add up to total number of teams!', false);
      return;
    }

    // Send request
    const res = await auth.fetch('/api/standings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brackets: bracketSizes.map((size, idx) => ({ id: idx, name: bracketNames[idx], size }))
      })
    });

    const data = await res.json();
    if (!data.success) {
      _showError(data.message, false);
      return;
    } else alert('Standings have been generated and brackets have been assinged successfully!');
  }
</script>

<main>
  <form on:submit|preventDefault={handleSubmit}>
    <h2>Number of Brackets</h2>
    <div id="bracket-counter">
      <button type="button" on:click={decreaseBracketCount}><b>-</b></button>
      <p>{$bracketCount}</p>
      <button type="button" on:click={increaseBracketCount}><b>+</b></button>
    </div>
    <br />
    {#each { length: $bracketCount } as _, bracketIdx}
      <div class="bracket">
        <h2>
          {bracketNames[bracketIdx]} Bracket: {bracketSizes[bracketIdx]} Teams
        </h2>
        <button type="button" on:click={() => increaseBracketSize(bracketIdx)}><b>+</b></button>
        <button type="button" on:click={() => decreaseBracketSize(bracketIdx)}><b>-</b></button>
      </div>
    {/each}
    <br />
    <button type="submit">Submit</button>
  </form>
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

  #bracket-counter {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  #bracket-counter p {
    margin: 0.5rem;
    font-size: 1.4rem;
  }

  .bracket {
    display: flex;
    flex-direction: row;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .bracket h2 {
    margin-right: 1rem;
  }

  .bracket button {
    margin: 0 0.2rem;
  }
</style>
