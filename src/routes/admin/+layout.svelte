<script>
  import NavBar from './NavBar.svelte';
  import { store } from '../../stores/login';
</script>

<div class="app">
  {#if $store}
    <NavBar />
  {/if}

  <main>
    <slot />
  </main>
</div>
