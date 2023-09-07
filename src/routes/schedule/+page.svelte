<script lang="ts">
  import strftime from 'strftime';
  import {
    schedules,
    upcomingMatchups,
    type CourtSchedule,
    type CourtMatchup
  } from '../../stores/schedule';
  import { courtPairs } from '../admin/tabs/manage-schedule/courts';
  import { teams, type Team } from '../../stores/teams';
  import { onMount } from 'svelte';
  import Schedule from './Schedule.svelte';
  import { getOrdinal } from './ordinal';
  import UpcomingMatchups from './UpcomingMatchups.svelte';
  import AllSchedules from './AllSchedules.svelte';
  import NotPlaying from './NotPlaying.svelte';

  onMount(async () => {
    // Get teams
    const recvTeams = (await fetch('/api/teams').then((res) => res.json())).teams;
    $teams = recvTeams;

    // Get schedules
    const recvSchedules = (await fetch('/api/schedule?which=schedules').then((res) => res.json()))
      .schedules;
    for (let i = 0; i < recvSchedules.length; i++) {
      const schedule = recvSchedules[i];
      $schedules[i] = {
        start: new Date(schedule.start),
        startStr: strftime('%H:%M', new Date(schedule.start)),
        end: new Date(schedule.end),
        endStr: strftime('%H:%M', new Date(schedule.end)),
        matchup: [
          $teams.find((team) => team.id === schedule.team1_id) || ({} as Team),
          $teams.find((team) => team.id === schedule.team2_id) || ({} as Team)
        ],
        color: schedule.color
      };
    }

    // Get upcoming matchups
    const recvUpcomingMatchups = (
      await fetch('/api/schedule?which=upcomingMatchups').then((res) => res.json())
    ).upcomingMatchups;
    for (const matchup of recvUpcomingMatchups) {
      const team1 = $teams.find((team) => team.id === matchup.team1_id)!;
      const team2 = $teams.find((team) => team.id === matchup.team2_id)!;
      $upcomingMatchups.push({ matchup: [team1, team2] });
    }
  });

  // Keep current time up to date
  let currentTime = new Date();
  setInterval(() => (currentTime = new Date()), 1000);

  let courtPairIdx = -2;
  let teamIdx = -1;
  let currentSchedule: CourtSchedule | null = null;
  let nextTeamMatchup: { matchup: Team[]; place: number };

  $: if (teamIdx !== -1 && currentSchedule) {
    // Find next matchup for this team
    const nextIdx = $upcomingMatchups.findIndex((matchup) =>
      matchup.matchup.find((team) => team.id === $teams[teamIdx].id)
    );
    if (nextIdx !== -1)
      nextTeamMatchup = { matchup: $upcomingMatchups[nextIdx].matchup, place: nextIdx + 1 };
  }

  function getSchedule() {
    // Reset current schedule
    currentSchedule = null;

    // Check if courts or team are selected
    if (courtPairIdx !== -1) {
      // Assign current schedule
      currentSchedule = $schedules[courtPairIdx];
    } else if (teamIdx !== -1) {
      // Get current matchup in schedule
      const match = $schedules.find(
        (schedule) => !!schedule.matchup.find((team) => team.id === $teams[teamIdx].id)
      );

      // Assign current schedule or empty one if not found
      currentSchedule = match || {
        start: new Date(),
        startStr: strftime('%H:%M', new Date()),
        end: new Date(),
        endStr: strftime('%H:%M', new Date()),
        matchup: [{} as Team, {} as Team],
        color: '#000000'
      };

      // Assign court pair index
      courtPairIdx = $schedules.findIndex((schedule) => schedule === currentSchedule);
    }
  }
</script>

<main>
  <div id="currenttime">
    <h2>Current Time: <b>{strftime('%I:%M %p', currentTime)}</b></h2>
  </div>

  <div id="options">
    <div class="option">
      <h2>Select Courts</h2>
      <select bind:value={courtPairIdx} on:input={() => (teamIdx = -1)} on:change={getSchedule}>
        <option value={-1}>Select Courts</option>
        <option value={-2} selected>All Courts</option>
        {#each courtPairs as pair, i}
          <option value={i}>Courts {pair.join(' - ')}</option>
        {/each}
      </select>
    </div>
    <h3>OR</h3>
    <div class="option">
      <h2>Select Team</h2>
      <select bind:value={teamIdx} on:input={() => (courtPairIdx = -1)} on:change={getSchedule}>
        <option value={-1} selected>Select Team</option>
        {#each $teams as team, i}
          <option value={i}>{team.name} - {team.id}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if teamIdx !== -1 || courtPairIdx !== -1}
    <div id="nextup">
      <div>
        {#if currentSchedule?.matchup.every((team) => team.id)}
          <span>
            <Schedule schedule={currentSchedule} courtPair={courtPairs[courtPairIdx]} />
          </span>
        {:else if courtPairIdx !== -2 && courtPairIdx !== -1}
          <h2>
            No teams are currently playing on courts {courtPairs[courtPairIdx].join(' - ')}.
          </h2>
        {:else if courtPairIdx === -2}
          <AllSchedules />
        {:else if teamIdx !== -1}
          {@const team = $teams[teamIdx]}
          {@const otherTeam = nextTeamMatchup.matchup.filter((t) => t.id !== team.id)[0]}

          <NotPlaying {team} {otherTeam} place={nextTeamMatchup.place} />
        {/if}
      </div>
      <div>
        <UpcomingMatchups />
      </div>
    </div>
  {/if}
</main>

<style>
  #currenttime {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
  }

  #options {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  #options > * {
    margin: 0 1rem;
  }

  .option {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
  }

  .option select {
    margin-left: 0.5rem;
  }

  #nextup {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
  }

  #nextup span {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
</style>
