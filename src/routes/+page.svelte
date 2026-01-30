<script lang="ts">
  import { getContext } from 'svelte';
  import { formatDate, formatDuration, type Episode } from '$lib';

  let { data } = $props();

  const playEpisode = getContext<(ep: Episode) => void>('playEpisode');
</script>

<svelte:head>
  <title>From The Internet - A Monthly Radio Show</title>
  <meta name="description" content="A monthly radio show podcast featuring curated tracks and sonic adventures." />
</svelte:head>

<section class="hero">
  <h1>FROM THE INTERNET</h1>
  <p>A monthly radio show. Music, noise, and everything in between.</p>
</section>

<section class="episodes">
  <h2>Episodes</h2>

  <ul class="episode-list">
    {#each data.episodes as episode}
      <li class="episode-item">
        <a href="/episodes/{episode.slug}" class="episode-link">
          <div class="episode-meta">
            <span class="episode-date">{formatDate(episode.date)}</span>
            <span class="episode-duration">{formatDuration(episode.duration)}</span>
          </div>
          <h3 class="episode-title">{episode.title}</h3>
          <p class="episode-desc">{episode.description}</p>
        </a>
        <button class="play-btn" onclick={() => playEpisode(episode)}>
          ▶ Play
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .hero {
    text-align: center;
    padding: 3rem 0;
    border-bottom: 2px solid var(--black);
    margin-bottom: 2rem;
  }

  .hero h1 {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .hero p {
    color: var(--gray);
  }

  .episodes h2 {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
    color: var(--gray);
  }

  .episode-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--black);
  }

  .episode-item {
    background: var(--white);
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .episode-link {
    flex: 1;
    min-width: 0;
  }

  .episode-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--gray);
    margin-bottom: 0.5rem;
    font-variant-numeric: tabular-nums;
  }

  .episode-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .episode-desc {
    font-size: 0.875rem;
    color: var(--gray);
  }

  .play-btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--black);
    background: var(--white);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .play-btn:hover {
    background: var(--black);
    color: var(--white);
  }
</style>
