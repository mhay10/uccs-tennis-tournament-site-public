<script>
  import { currentTab, tabMap } from '../../stores/admin';
  import CreateBrackets from './tabs/CreateBrackets.svelte';
  import CreatePools from './tabs/CreatePools.svelte';
  import EnterScores from './tabs/EnterScores.svelte';
  import AddTeams from './tabs/AddTeams.svelte';
  import ManageBrackets from './tabs/ManageBrackets.svelte';
  import ManageSchedule from './tabs/ManageSchedule.svelte';
</script>

{#if $currentTab === tabMap['Add Teams']}
  <AddTeams />
{:else if $currentTab === tabMap['Create Pools']}
  <CreatePools />
{:else if $currentTab === tabMap['Enter Scores']}
  <EnterScores />
{:else if $currentTab === tabMap['Create Brackets']}
  <CreateBrackets />
{:else if $currentTab === tabMap['Manage Brackets']}
  <ManageBrackets />
{:else if $currentTab === tabMap['Manage Schedule']}
  <ManageSchedule />
{/if}
