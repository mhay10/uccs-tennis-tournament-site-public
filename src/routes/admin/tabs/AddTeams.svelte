<script lang="ts">
  import { onMount } from 'svelte';
  import { teams, type Team } from '../../../stores/teams';
  import { _showError } from '../../+page';
  import { auth } from '../auth';

  let teamName = '';
  let teamId = '';

  let selectedTeam = null;
  let isEditing = false;

  function handleSubmit() {
    // Create new team
    let row = { name: teamName, id: teamId, added: true, updated: false };

    // If team is being edited or already exists, update team, otherwise add team
    if (isEditing || $teams.find((team) => team.id === teamId)) {
      row.updated = true;
      row.added = false;
      updateTeam(row);

      isEditing = false;
    } else $teams = [...$teams, row];

    clearForm();
  }

  function clearForm() {
    // Clear form values
    teamName = '';
    teamId = '';
  }

  function editTeam(team: Team) {
    // Set form values to team values
    selectedTeam = team;
    teamName = team.name;
    teamId = team.id;
    isEditing = true;
  }

  function updateTeam(team: Team) {
    // Update team in $teams
    team.updated = true;

    const idx = $teams.findIndex((t) => t.id === team.id);
    if (idx >= 0) $teams[idx] = team;
    else $teams = [...$teams, team];
  }

  function removeTeam(team: Team) {
    // Filter out team from $teams
    $teams = $teams.filter((t) => t.id !== team.id);
  }

  async function updateDB() {
    // Send teams to server
    const res = await auth.fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify($teams)
    });

    const data = await res.json();
    if (!data.success) _showError(data.message, false);
  }

  onMount(async () => {
    // Get teams from database
    const res = await auth.fetch('/api/teams');
    const data = await res.json();
    if (!data.success) _showError(data.message, false);
    else $teams = data.teams.map((team: any) => ({ ...team, added: false, updated: false }));
  });
</script>

<main>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="teamName">Team Name</label>
    <input id="teamName" type="text" bind:value={teamName} required />

    <br />

    <label for="teamId">Team ID</label>
    <input id="teamId" type="text" bind:value={teamId} required />

    <br />

    <div id="buttons">
      <button type="submit"
        >{isEditing || $teams.find((team) => team.id === teamId)
          ? 'Update Team'
          : 'Add Team to List'}</button
      >
      {#if isEditing}
        <button type="button" on:click={() => removeTeam(selectedTeam)}>Remove Team</button>
      {/if}
    </div>
  </form>

  <div id="current-teams">
    <button on:click={updateDB}>Submit Teams</button>
    <h2>Current # of Teams: <b>{$teams.length}</b></h2>
    <table>
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Team ID</th>
        </tr>
      </thead>
      <tbody>
        {#each $teams as team}
          <tr on:click={() => editTeam(team)}>
            <td>{team.name}</td>
            <td>{team.id}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
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

  label {
    margin-top: 1rem;
  }

  input {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    width: 20rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-theme-2);
    padding-left: 0.5rem;
  }

  #buttons {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    width: 20rem;
  }

  #current-teams {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2.5em;
  }

  table {
    border-collapse: collapse;
    margin: 0.5rem 0;
    font-size: 0.9em;
    min-width: 400px;
  }

  table thead tr {
    background-color: var(--color-theme-1);
    color: var(--color-theme-2);
    text-align: left;
  }

  table th,
  table td {
    padding: 12px 15px;
  }

  table tbody tr {
    border-bottom: 1px solid var(--color-theme-1);
    text-align: left;
  }
</style>
