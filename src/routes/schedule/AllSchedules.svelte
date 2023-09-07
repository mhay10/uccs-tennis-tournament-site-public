<script lang="ts">
  import { schedules } from '../../stores/schedule';
  import { courtPairs } from '../admin/tabs/manage-schedule/courts';
  import Schedule from './Schedule.svelte';
</script>

<h3>All Court Schedules</h3>
<ul>
  {#each $schedules as schedule, i}
    <li>
      <Schedule {schedule} courtPair={courtPairs[i]} />
    </li>
  {/each}
</ul>

<style>
  h3 {
    text-align: center;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
  }

  li {
    flex: 0 0 calc(100% / 5);
    margin: 0.5rem;
    width: fit-content;
  }
</style>
