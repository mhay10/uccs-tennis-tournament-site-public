<script lang="ts">
  import { onMount } from 'svelte';
  import type { Bracket, BracketScores, BracketTeam } from '../../stores/brackets';
  import { _showError } from '../+page';
  import ReadOnlyBracket from './ReadOnlyBracket.svelte';

  let brackets: Bracket[] = [];
  let selectedBracketIdx = -1;
  let selectedBracket: Bracket;

  let allMatchups: BracketScores;

  $: selectedBracket = brackets[selectedBracketIdx];

  onMount(async () => {
    const res = await fetch('/api/brackets?action=getPreload');
    const data = await res.json();
    if (!data.success) _showError(data.message, false);
    else brackets = data.brackets;
  });

  async function handleUpdate(bracket: Bracket) {
    allMatchups = await getExistingScores(bracket.id, bracket.teams);
  }

  async function getExistingScores(bracketId: number, teams: BracketTeam[]) {
    const matchups: BracketScores = {};

    const res = await fetch(`/api/brackets?action=getScores&bracket_id=${bracketId}`);
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
</script>

<section>
  <h2>Select Bracket</h2>
  <select
    bind:value={selectedBracketIdx}
    on:change={() => handleUpdate(brackets[selectedBracketIdx])}
  >
    <option value={-1} selected>Select Bracket</option>
    {#each brackets as bracket, i}
      <option value={i}>{bracket.name}</option>
    {/each}
  </select>

  {#if selectedBracket}
    <div class="bracket">
      <ReadOnlyBracket {selectedBracket} {allMatchups} />
    </div>
  {/if}
</section>

<style>
  section {
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
