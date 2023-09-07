<script lang="ts">
  import strftime from 'strftime';
  import type { CourtSchedule } from '../../stores/schedule';

  export let schedule: CourtSchedule;
  export let courtPair: number[];

  $: if (schedule.start.getTime() === schedule.end.getTime()) {
    schedule.startStr = '';
    schedule.endStr = '';
  }
</script>

<table>
  <tr>
    <td>
      {#if courtPair}
        <b>Courts {courtPair.join(' - ')}</b>
      {/if}
    </td>
  </tr>
  <tr>
    <td>{strftime('%I:%M %p', schedule.start)} - {strftime('%I:%M %p', schedule.end)}</td>
  </tr>
  <tr>
    <td>
      Status:
      <span class="color" style="background-color: {schedule.color}" />
    </td>
  </tr>
</table>

<style>
  table {
    border-collapse: collapse;
  }

  td {
    border: 1px solid #000;
    padding: 5px;
  }

  .color {
    display: inline-block;
    width: 50%;
    height: 20px;
    margin-left: 10px;
  }
</style>
