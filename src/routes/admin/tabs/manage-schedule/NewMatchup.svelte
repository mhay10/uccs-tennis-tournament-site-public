<script lang="ts">
  import { upcomingMatchups } from '../../../../stores/schedule';
  import { teams, type Team } from '../../../../stores/teams';

  let team1: Team | null;
  let team2: Team | null;

  function handleSubmit() {
    // Check if matchup already exists
    const alreadyExists = $upcomingMatchups.find(
      (m) =>
        team1 &&
        team2 &&
        ((m.matchup[0].id === team1.id && m.matchup[1].id === team2.id) ||
          (m.matchup[0].id === team2.id && m.matchup[1].id === team1.id))
    );

    // Validate
    if (!team1 || !team2) alert('Please select two teams');
    else if (team1.id === team2.id) alert('Please select two different teams');
    else if (alreadyExists) alert('This matchup already exists');
    else $upcomingMatchups = [...$upcomingMatchups, { matchup: [team1, team2] }];

    // Reset
    team1 = team2 = null;
  }
</script>

<h3>Create New Matchup</h3>
<form on:submit|preventDefault={handleSubmit}>
  <div class="team">
    <label for="team1">Team 1 </label>
    <select bind:value={team1}>
      <option value="">Select a Team</option>
      {#each $teams as team (team.id)}
        <option value={team}>{team.name} - {team.id}</option>
      {/each}
    </select>
  </div>
  <div class="team">
    <label for="team2">Team 2 </label>
    <select bind:value={team2}>
      <option value="">Select a Team</option>
      {#each $teams as team (team.id)}
        <option value={team}>{team.name} - {team.id}</option>
      {/each}
    </select>
  </div>
  <button type="submit">Create Matchup</button>
</form>

<style>
  form {
    border: 1px solid black;
    padding: 0.5rem;
  }

  form > * {
    margin: 0.5rem 0;
  }
</style>
