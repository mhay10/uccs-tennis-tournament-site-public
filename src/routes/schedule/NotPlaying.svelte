<script lang="ts">
  import type { Team } from '../../stores/teams';
  import { getOrdinal } from './ordinal';

  export let team: Team;
  export let otherTeam: Team;
  export let place: number;
</script>

<h3>{team.name} - <i>{team.id}</i></h3>
<ul>
  <li>
    Status: <b>Not Playing</b>
  </li>
  <li>
    Next Matchup: <b>{otherTeam.name} - <i>{otherTeam.id}</i></b>
  </li>
  <li>
    Place in Line: <b>{getOrdinal(place)}</b>
  </li>
</ul>
