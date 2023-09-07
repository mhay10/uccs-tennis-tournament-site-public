<script lang="ts">
  import strftime from 'strftime';
  import { schedules } from '../../../../stores/schedule';
  import { courtPairs } from './courts';
  import { colors } from './color';
  import { dragStart, dropSchedule } from './dragdrop';
  import { onMount } from 'svelte';
  import { teams, type Team } from '../../../../stores/teams';

  onMount(async () => {
    const res = (await fetch('/api/schedule?which=schedules').then((res) => res.json())).schedules;
    for (let i = 0; i < res.length; i++) {
      const schedule = res[i];
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
  });

  $: for (const schedule of $schedules) {
    if (schedule.start.getTime() === schedule.end.getTime()) {
      schedule.startStr = '';
      schedule.endStr = '';
    }
  }

  function handleInput(scheduleIdx: number) {
    const now = new Date();

    // Update times
    const schedule = $schedules[scheduleIdx];
    schedule.start = new Date(now.toDateString() + ' ' + schedule.startStr);
    schedule.end = new Date(schedule.start.getTime() + 2 * 60 * 60 * 1000);
    schedule.endStr = strftime('%H:%M', schedule.end);

    // Update colors
    const { end } = schedule;
    const diff = ((now.getTime() - end.getTime()) / (60 * 60 * 1000)) % 12;

    // Every 30 minutes, change color (5 colors total)
    let color: string;
    if (diff < 0.5) color = colors[0];
    else if (diff < 1) color = colors[1];
    else if (diff < 1.5) color = colors[2];
    else if (diff < 2) color = colors[3];
    else color = colors[4];

    schedule.color = color;
  }
</script>

<h3>Schedules</h3>
{#each $schedules as schedule, i (i)}
  <table
    class="schedule"
    on:dragover|preventDefault={() => false}
    on:drop={(e) => dropSchedule(e, i)}
  >
    <tr>
      <td />
      <td>Start:</td>
      <td>
        <input type="time" bind:value={schedule.startStr} on:input={() => handleInput(i)} />
      </td>
    </tr>
    <tr
      draggable={true}
      on:dragstart={(e) => dragStart(e, schedule.matchup[0], schedule.matchup[1], i)}
    >
      <td>
        <i>
          Courts
          <br />
          {courtPairs[i].join(' - ')}
        </i>
      </td>
      <td class="team">
        <p><i>{schedule.matchup[0].id}</i></p>
      </td>
      <td class="team">
        <p><i>{schedule.matchup[1].id}</i></p>
      </td>
    </tr>
    <tr>
      <td style="background-color: {schedule.color}" />
      <td>Est End:</td>
      <td>
        <input type="time" value={schedule.endStr} readonly />
      </td>
    </tr>
  </table>
{/each}

<style>
  .schedule {
    border-collapse: collapse;
    border: 1px solid black;
    margin: 1rem;
    text-align: center;
  }

  .schedule tr {
    border: 1px solid black;
  }

  .schedule tr > :first-child {
    border-right: 1px solid black;
  }

  .schedule td {
    padding: 0 0.5rem;
  }

  .schedule td.team {
    width: 5rem;
  }
</style>
