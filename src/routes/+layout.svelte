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

<div class="min-h-screen pb-[200px]">
  <header class="flex justify-between items-center p-4 border-b-2 border-black">
    <a href="/" class="text-base sm:text-xl font-bold tracking-wide hover:no-underline">FROM THE INTERNET</a>
    <nav class="flex gap-4">
      <a href="/" class="text-xs sm:text-sm uppercase tracking-wide">Episodes</a>
      <a href="/about" class="text-xs sm:text-sm uppercase tracking-wide">About</a>
      <a href="/rss.xml" class="text-xs sm:text-sm uppercase tracking-wide">RSS</a>
    </nav>
  </header>

  <main class="max-w-[800px] mx-auto p-4">
    {@render children()}
  </main>

  <footer class="max-w-[800px] mx-auto p-4 text-xs text-gray border-t border-light-gray">
    Everything on this domain is released under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener" class="underline">CC BY-NC-SA 4.0</a>, but please be cool about it.
  </footer>

  <Player bind:episode={currentEpisode} bind:autoplay />
</div>
