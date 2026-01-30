<script lang="ts">
  import { setContext } from 'svelte';
  import '../app.css';
  import { Player } from '$lib';
  import type { Episode } from '$lib/episodes';

  let { children } = $props();

  let currentEpisode = $state<Episode | null>(null);
  let autoplay = $state(false);

  function playEpisode(episode: Episode) {
    currentEpisode = episode;
    autoplay = true;
  }

  setContext('playEpisode', playEpisode);
</script>

<div class="app">
  <header>
    <a href="/" class="logo">FROM THE INTERNET</a>
    <nav>
      <a href="/">Episodes</a>
      <a href="/about">About</a>
      <a href="/rss.xml">RSS</a>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer>
    Everything on this domain is released under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>, but please be cool about it.
  </footer>

  <Player bind:episode={currentEpisode} bind:autoplay />
</div>

<style>
  .app {
    min-height: 100vh;
    padding-bottom: 200px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 2px solid var(--black);
  }

  .logo {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  nav {
    display: flex;
    gap: 1rem;
  }

  nav a {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  footer {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
    font-size: 0.75rem;
    color: var(--gray);
    border-top: 1px solid var(--light-gray);
  }

  footer a {
    text-decoration: underline;
  }

  @media (min-width: 640px) {
    .logo {
      font-size: 1.25rem;
    }

    nav a {
      font-size: 0.875rem;
    }
  }
</style>
