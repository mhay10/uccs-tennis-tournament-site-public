<script lang="ts">
  import { page } from '$app/stores';
  import logo from '$lib/images/uccs-logo-small.png';
  import instagram from '$lib/images/instagram-icon.png';
</script>

<header>
  <div class="corner">
    <a target="_blank" href="https://uccs.edu">
      <img src={logo} alt="UCCS" />
    </a>
  </div>

  <nav>
    <ul>
      <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
        <a href="/">Home</a>
      </li>
      <li aria-current={$page.url.pathname === '/schedule' ? 'page' : undefined}>
        <a href="/schedule">Schedule</a>
      </li>
      <li aria-current={$page.url.pathname === '/pool' ? 'page' : undefined}>
        <a href="/pool">Pool Play</a>
      </li>
      <li aria-current={$page.url.pathname === '/bracket' ? 'page' : undefined}>
        <a href="/bracket">Bracket Play</a>
      </li>
      <li aria-current={$page.url.pathname === '/admin' ? 'page' : undefined}>
        <a href="/admin">Admin Stuff</a>
      </li>
    </ul>
  </nav>

  <div class="corner">
    <a target="_blank" href="https://www.instagram.com/uccsclubtennis/">
      <img src={instagram} alt="Instagram" />
    </a>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
  }

  .corner {
    width: 3em;
    height: 3em;
  }

  .corner a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .corner img {
    width: 3em;
    height: 3em;
    object-fit: contain;
  }

  nav {
    display: flex;
    justify-content: center;
    --background: var(--color-theme-3);
  }

  ul {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    background: var(--background);
    background-size: contain;
    border-radius: 0.5rem;
  }

  li {
    position: relative;
    height: 100%;
  }

  li[aria-current='page']::before {
    --size: 10px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid var(--color-theme-1);
  }

  nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
  }

  a:hover {
    color: var(--color-theme-2);
  }
</style>
