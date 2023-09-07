<script>
  import Login from './Login.svelte';
  import Admin from './Admin.svelte';
  import { store } from '../../stores/login';
  import '../styles.css';
</script>

{#if $store}
  <Admin />
{:else}
  <Login />
{/if}
