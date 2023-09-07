<script lang="ts">
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import { _showError } from '../+page';
  import type { Bracket, BracketMatchup, BracketScores, BracketTeam } from '../../stores/brackets';
  import BracketLeftDown from '$lib/images/bracket-left-down.svelte';
  import BracketLeftUp from '$lib/images/bracket-left-up.svelte';
  import BracketRightDown from '$lib/images/bracket-right-down.svelte';
  import BracketRightUp from '$lib/images/bracket-right-up.svelte';

  export let selectedBracket: Bracket;
  export let allMatchups: BracketScores = {};

  const dispatch = createEventDispatcher();

  const bye = { id: 'bye', name: 'Bye', seed: 0 };
  const pending = { id: 'pending', name: 'Pending', seed: 0 };

  $: console.log(selectedBracket);

  $: maxRounds = Math.ceil(Math.log2(selectedBracket.teams.length));

  $: {
    allMatchups = createMatchups([...selectedBracket.teams]);
    delete allMatchups['NaN'];
  }

  $: dispatch('bracketchange', { bracket: selectedBracket });

  // onDestroy(() => (selectedBracket = null));

  function createMatchups(teams: BracketTeam[], round = '0', losersBracket = false): BracketScores {
    // Base case
    if (teams.length < 2) return {};

    // First round setup
    if (round === '0') {
      // Add byes until length is power of 2
      const needsByes = Math.log2(teams.length) % 1 !== 0;
      if (needsByes) {
        const numByes = Math.pow(2, Math.ceil(Math.log2(teams.length))) - teams.length;
        for (let i = 0; i < numByes; i++) teams.push(bye);
      }

      // Shuffle teams
      teams = shuffleTeams(teams);
    }

    // Create matchups
    const roundKey = losersBracket ? `losers${round.slice(6)}` : round;
    const existingMatchups = allMatchups[roundKey]?.matchups || [];
    const matchups = [];

    for (let i = 0; i < teams.length; i += 2) {
      const team1 = teams[i];
      const team2 = teams[i + 1];

      const existingMatchup = existingMatchups.find(
        (matchup) =>
          (matchup.team1.id === team1.id && matchup.team2.id === team2.id) ||
          (matchup.team1.id === team2.id && matchup.team2.id === team1.id)
      );

      if (existingMatchup) matchups.push(existingMatchup);
      else matchups.push({ team1: { ...team1, score: 0 }, team2: { ...team2, score: 0 } });
    }

    // Create next round
    const winnersNext = createMatchups(selectWinners(matchups), `${+round + 1}`);
    let losersStart = {};
    let losersNext = {};
    let thirdPlace = {};

    if (round === '0') {
      losersStart = createMatchups(selectLosers(matchups), 'losers1', true);
    }
    if (losersBracket) {
      losersNext = createMatchups(selectWinners(matchups), `losers${+round.slice(6) + 1}`, true);
    }
    if (round === (maxRounds - 2).toString()) {
      thirdPlace = createMatchups(selectLosers(matchups), 'thirdPlace');
    }

    // Return bracket
    return {
      // Current round
      [roundKey]: { matchups },

      // Next rounds
      ...winnersNext,
      ...losersStart,
      ...losersNext,
      ...thirdPlace
    };
  }

  function selectWinners(matchups: BracketMatchup[]) {
    const winners = matchups.map((matchup) => {
      if (matchup.team1.id === bye.id) return matchup.team2;
      if (matchup.team2.id === bye.id) return matchup.team1;

      if (matchup.team1.id === pending.id || matchup.team2.id === pending.id) return pending;

      if (matchup.team1.score > matchup.team2.score) return matchup.team1;
      else if (matchup.team2.score > matchup.team1.score) return matchup.team2;
      else return pending;
    });

    return winners;
  }

  function selectLosers(matchups: BracketMatchup[]) {
    const losers = matchups.map((matchup) => {
      if (matchup.team1.id === bye.id || matchup.team2.id === bye.id) return bye;
      if (matchup.team1.id === pending.id || matchup.team2.id === pending.id) return pending;

      if (matchup.team1.score < matchup.team2.score) return matchup.team1;
      else if (matchup.team2.score < matchup.team1.score) return matchup.team2;
      else return pending;
    });

    return losers;
  }

  function shuffleTeams(teams: BracketTeam[]) {
    let result = [...teams];

    const numRounds = Math.log2(teams.length / 2);
    for (let i = 0; i < numRounds; i++) {
      const round = [];
      const splice = Math.pow(2, i);

      while (result.length) {
        round.push(...result.splice(0, splice));
        round.push(...result.splice(-splice));
      }

      result = round;
    }

    return result;
  }

  const colors = ['#96C2FF', '#FF9F96', '#96FFAC', '#FFC690', '#FFF486'];

  function getColor(round: string) {
    const roundNum = round.includes('losers') ? +round.slice(6) : +round;
    return colors[roundNum % colors.length];
  }

  afterUpdate(() => {
    const rounds = [...document.querySelectorAll('.round')].slice(1, -1);
    for (const round of rounds) {
      const roundName = round.id.replace('round-', '');
      const matchups = round.querySelectorAll('.matchup');
      for (const matchup of matchups) {
        const connectors = [...matchup.previousElementSibling!.children] as HTMLElement[];
        const leftConnector = connectors.find((connector) => connector.classList.contains('left'));
        const rightConnector = connectors.find((connector) =>
          connector.classList.contains('right')
        );

        const matchupRect = matchup.getBoundingClientRect();
        const leftRect = leftConnector?.getBoundingClientRect()!;
        const rightRect = rightConnector?.getBoundingClientRect()!;

        const xOffset = 10;
        const yOffset = 15;

        if (leftConnector && rightConnector) {
          leftConnector.style.left = `-${leftRect.width - xOffset}px`;
          leftConnector.style.top = `${(matchupRect.height + leftRect.height) / 2 + yOffset}px`;

          rightConnector.style.left = `${rightRect.width - matchupRect.width / 4 + xOffset * 2}px`;
          rightConnector.style.top = `${(matchupRect.height + rightRect.height) / 2 + yOffset}px`;
        } else if (leftConnector) {
          leftConnector.style.left = `-${(leftRect.width + matchupRect.width) / 2}px`;
          leftConnector.style.top = `${(matchupRect.height + leftRect.height) / 2 + yOffset}px`;
        } else if (rightConnector) {
          rightConnector.style.left = `${(matchupRect.width + rightRect.width) / 2}px`;
          rightConnector.style.top = `${(matchupRect.height + rightRect.height) / 2 + yOffset}px`;
        }
      }
    }
  });
</script>

<div id="bracket">
  {#each Object.keys(allMatchups)
    .filter((round) => round !== 'thirdPlace')
    .sort((a, b) => {
      if (a.includes('losers') && !b.includes('losers')) return -1;
      else if (!a.includes('losers') && b.includes('losers')) return 1;
      else if (a.includes('losers') && b.includes('losers')) return b.localeCompare(a);
      else return a.localeCompare(b);
    }) as round, j}
    {@const roundColor = getColor(round)}
    <div class="round" id="round-{round}">
      {#each allMatchups[round].matchups as matchup, i}
        {@const hasLeftBracket = round === '0' || round.includes('losers')}
        {@const hasRightBracket = !round.includes('losers')}

        <div>
          {#if round.replace('losers', '') !== `${maxRounds - 1}`}
            <div class="connectors">
              {#if hasLeftBracket}
                {#if i % 2 === 0}
                  <span class="left">
                    <BracketLeftDown />
                  </span>
                {:else}
                  <span class="left">
                    <BracketLeftUp />
                  </span>
                {/if}
              {/if}
              {#if hasRightBracket}
                {#if i % 2 === 0}
                  <span class="right">
                    <BracketRightDown />
                  </span>
                {:else}
                  <span class="right">
                    <BracketRightUp />
                  </span>
                {/if}
              {/if}
            </div>
          {/if}

          <div class="matchup" style="background-color: {roundColor}80">
            <div class="team" style="background-color: {roundColor}">
              <span>{matchup.team1.seed || ''}</span>
              <p>{matchup.team1.name}</p>
              <input type="number" min="0" bind:value={matchup.team1.score} readonly />
            </div>
            <div class="team" style="background-color: {roundColor}">
              <span>{matchup.team2.seed || ''}</span>
              <p>{matchup.team2.name}</p>
              <input type="number" min="0" bind:value={matchup.team2.score} readonly />
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  #bracket {
    display: flex;
    flex-direction: row;
    /* overflow-x: scroll; */
    width: fit-content;
    /* margin-top: 50px; */
  }

  .round {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
  }

  .matchup {
    margin: 10px;
    border: 1px solid black;
    border-radius: 5px;
    --matchup-width: 175px;
    width: var(--matchup-width);
  }

  .team {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: normal;
    background-color: var(--color-theme-1);
    margin: 0.5rem;
    padding: 0.3rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
  }

  .team span {
    font-size: 0.7em;
  }

  .connectors {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .connectors .left,
  .connectors .right {
    position: relative;
  }
</style>
