<script lang="ts">
  import { onMount } from 'svelte';
  import { _showError } from '../../+page';
  import ShowBracket from './manage-brackets/ShowBracket.svelte';
  import type { Bracket, BracketScores, BracketTeam } from '../../../stores/brackets';
  import { auth } from '../auth';

  let brackets: Bracket[] = [];
  let selectedBracketIdx = -1;
  let selectedBracket: Bracket;

  let allMatchups: BracketScores;

  $: {
    selectedBracket = brackets[selectedBracketIdx];
    if (selectedBracket) {
      // Change team ids into team objects
      selectedBracket.teams = selectedBracket.teams.map((team, i) => ({ ...team, seed: i + 1 }));
    }
  }

  async function handleSubmit() {
    const res = await auth.fetch('/api/brackets?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bracket_id: selectedBracket.id,
        scores: { ...allMatchups }
      })
    });

    const data = await res.json();
    if (!data.success) _showError(data.message, false);
    else alert('Bracket updated successfully!');
  }

  async function handleUpdate(bracket: Bracket) {
    allMatchups = await getExistingScores(bracket.id, bracket.teams);
  }

  async function getExistingScores(bracketId: number, teams: BracketTeam[]) {
    const matchups: BracketScores = {};

    const res = await auth.fetch(`/api/brackets?action=getScores&bracket_id=${bracketId}`);
    const data = await res.json();
    if (!data.success) _showError(data.message, false);
    else {
      for (const score of data.scores) {
        const { round, team1_id, team2_id, team1_score, team2_score } = score;

        if (!matchups[round]) matchups[round] = { matchups: [] };

        const team1 = teams.find((team) => team.id === team1_id);
        const team2 = teams.find((team) => team.id === team2_id);

        matchups[round].matchups.push({
          team1: { ...team1, score: team1_score },
          team2: { ...team2, score: team2_score }
        });
      }
    }

    return matchups;
  }

  onMount(async () => {
    // Get all brackets
    const recvBrackets = await (await fetch('/api/brackets?action=getPreload')).json();
    if (!recvBrackets.success) _showError(recvBrackets.message, false);
    else {
      // Set data
      brackets = recvBrackets.brackets;
      // for (const bracket of brackets) {
      //   // Replace team ids with team objects
      //   const teams = await (await fetch(`/api/teams`)).json();
      //   if (!teams.success) _showError(teams.message, false);
      //   else {
      //     for (let i = 0; i < bracket.teams.length; i++) {
      //       bracket.teams[i] = teams.teams.find(
      //         (team: BracketTeam) => team.id === bracket.teams[i]
      //       );
      //       delete bracket.teams[i].pool_id;
      //     }
      //   }
      // }
    }
  });
</script>

<form on:submit|preventDefault={handleSubmit}>
  <h2>Select Bracket</h2>
  <select
    bind:value={selectedBracketIdx}
    on:change={() => handleUpdate(brackets[selectedBracketIdx])}
  >
    <option value="-1" selected>Select Bracket</option>
    {#each brackets as bracket, i}
      <option value={i}>{bracket.name}</option>
    {/each}
  </select>

  {#if selectedBracket}
    <button type="submit">Save</button>
    <section class="bracket">
      <ShowBracket bind:selectedBracket bind:allMatchups />
    </section>
  {/if}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  select {
    margin-bottom: 1rem;
  }

  .bracket {
    width: 100%;
    transform: translateX(20px);
    display: flex;
  }
</style>
