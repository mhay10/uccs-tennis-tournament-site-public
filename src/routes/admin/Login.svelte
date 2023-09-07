<script lang="ts">
  import { store } from '../../stores/login';
  import { _showError } from '../+page';
  import { auth } from './auth';
  import { onMount } from 'svelte';

  let username = '';
  let password = '';

  async function handleLogin() {
    // Send login request to server
    const res = await (
      await fetch(`/api/login?username=${username}&password=${password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // body: new URLSearchParams({ username, password })
      })
    ).json();

    // If login is successful, set store to true
    if (res.success) {
      $store = true;
      auth.setToken(res.token);
      sessionStorage.setItem('token', res.token);
    } else _showError('Incorrect username or password', false);
  }

  onMount(async () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      auth.setToken(token);
      const res = await auth.fetch('/api/verify');

      const data = await res.json();
      if (data.success) $store = true;
      else sessionStorage.removeItem('token');
    }
  });
</script>

<form on:submit|preventDefault={handleLogin}>
  <label for="username">Username</label>
  <input type="text" id="username" bind:value={username} required />

  <br />

  <label for="password">Password</label>
  <input type="password" id="password" bind:value={password} required />

  <br />

  <button type="submit">Login</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  label {
    margin-top: 1rem;
  }
</style>
