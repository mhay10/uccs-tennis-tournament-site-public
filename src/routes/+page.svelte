<script lang="ts">
  import logo from '$lib/images/uccs-statue.jpg';
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>
    <span class="welcome">
      <img src={logo} alt="UCCS Logo" />
      <br />
    </span>

    Welcome to the UCCS<br />Tournament Program
  </h1>

  <h2>Click on <b>Pool Play</b> or <b>Bracket Play</b><br />to see current standings</h2>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    flex: 0.6;
  }

  h1 {
    width: 100%;
  }

  .welcome {
    display: block;
    position: relative;
    width: 100%;
    height: 0;
    padding: 0 0 calc(100% * 495 / 2048) 0;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }

  .welcome img {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    display: block;
  }
</style>
