<script lang="ts">
  import strftime from 'strftime';
  import Schedule from './manage-schedule/Schedule.svelte';
  import FinishedMatchups from './manage-schedule/FinishedMatchups.svelte';
  import NewMatchup from './manage-schedule/NewMatchup.svelte';
  import UpcomingMatchups from './manage-schedule/UpcomingMatchups.svelte';
  import { upcomingMatchups, finishedMatchups, schedules } from '../../../stores/schedule';
  import { auth } from '../auth';
  import { courtPairs } from './manage-schedule/courts';

  // Keep current time up to date
  let currentTime = new Date();
  setInterval(() => (currentTime = new Date()), 1000);

  // Submit form
  async function handleSubmit() {
    const res = await auth.fetch('/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        upcomingMatchups: $upcomingMatchups,
        finishedMatchups: $finishedMatchups,
        schedules: $schedules.map((schedule, i) => ({
          ...schedule,
          courts: courtPairs[i]
        }))
      })
    });

    const data = await res.json();
    if (data.success) alert('Schedule saved successfully');
    else alert(data.message);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div id="currenttime">
    <h2>Current Time: <b>{strftime('%I:%M %p', currentTime)}</b></h2>
  </div>
  <button type="submit">Save</button>
  <div id="management">
    <span>
      <Schedule />
    </span>
    <span>
      <UpcomingMatchups />
    </span>
    <span>
      <FinishedMatchups />
    </span>
    <span>
      <NewMatchup />
    </span>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.9rem;
  }

  #management {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    text-align: center;
    width: 100%;
    --height: 80vh;
    height: calc(var(--height) + 5rem);
  }
</style>
