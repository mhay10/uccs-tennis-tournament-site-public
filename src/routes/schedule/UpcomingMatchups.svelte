<script lang="ts">
  import { upcomingMatchups } from '../../stores/schedule';

  let limit = $upcomingMatchups.length;
</script>

<h3>Upcoming Matchups</h3>
<ul id="upcoming">
  {#each $upcomingMatchups as { matchup }, i (i)}
    <li class="matchup">
      <p class="team">{matchup[0].id}</p>
      <b>VS</b>
      <p class="team">{matchup[1].id}</p>
    </li>
  {/each}
</ul>

<style>
  h3 {
    text-align: center;
  }

  #upcoming {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 50vh;
    overflow-y: scroll;
    padding: 0.5rem;
    scrollbar-width: thin;
    border: 1px solid black;
  }

  .matchup {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    height: 2.5rem;
    border: 1px solid black;
    border-radius: 0.5rem;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: lightgrey;
  }
</style>
