<script>
  import { store } from '../../stores/login';
  import { currentTab, tabMap } from '../../stores/admin';

  function handleLogout() {
    // Delete token from session storage
    $store = false;
    sessionStorage.removeItem('token');
  }
</script>

<header>
  <nav>
    <ul>
      <li aria-current={$currentTab === tabMap['Add Teams'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Add Teams'])}>Add Teams</button>
      </li>
      <li aria-current={$currentTab === tabMap['Create Pools'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Create Pools'])}>Create Pools</button>
      </li>
      <li aria-current={$currentTab === tabMap['Enter Scores'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Enter Scores'])}>Enter Scores</button>
      </li>
      <li aria-current={$currentTab === tabMap['Create Brackets'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Create Brackets'])}>Create Brackets</button>
      </li>
      <li aria-current={$currentTab === tabMap['Manage Brackets'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Manage Brackets'])}>Manage Brackets</button>
      </li>
      <li aria-current={$currentTab === tabMap['Manage Schedule'] ? 'page' : undefined}>
        <button on:click={() => ($currentTab = tabMap['Manage Schedule'])}>Manage Schedule</button>
      </li>
      <li>
        <button on:click={handleLogout}>Logout</button>
      </li>
    </ul>
  </nav>
</header>

<style>
  nav {
    display: flex;
    justify-content: center;
    --background: var(--color-theme-3);
  }

  ul {
    display: flex;
    list-style: none;
    margin-top: 0.8rem;
    background: var(--color-theme-3);
    border-radius: 0.4rem;
    background-size: contain;
    padding: 0.5rem;
  }

  li {
    margin: 0 1rem;
    position: relative;
    height: 100%;
  }

  li[aria-current='page']::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    top: calc(100% - 0.2rem);
    width: 100%;
    height: 0.25rem;
    background: var(--color-theme-1);
  }

  nav button {
    display: flex;
    height: 100%;
    align-items: center;
    background: none;
    border: none;
    color: var(--color-text);
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
  }

  button:hover {
    color: var(--color-theme-2);
  }
</style>
