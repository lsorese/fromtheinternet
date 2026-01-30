<script lang="ts">
  import { getContext } from 'svelte';
  import { formatDate, formatDuration, formatTime, type Episode } from '$lib';

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
          {#if episode.chapters && episode.chapters.length > 0}
            <ul class="episode-tracks">
              {#each episode.chapters as chapter}
                <li>
                  <span class="track-time">{formatTime(chapter.start)}</span>
                  <span class="track-name">{chapter.title}</span>
                </li>
              {/each}
            </ul>
          {/if}
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
    padding: 2rem 0;
    border-bottom: 2px solid var(--black);
    margin-bottom: 1rem;
  }

  .hero h1 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .hero p {
    color: var(--gray);
    font-size: 0.875rem;
  }

  .episodes h2 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    color: var(--gray);
  }

  .episode-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--black);
    margin: 0 -1rem;
  }

  .episode-item {
    background: var(--white);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .episode-link {
    flex: 1;
    min-width: 0;
  }

  .episode-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.7rem;
    color: var(--gray);
    margin-bottom: 0.25rem;
    font-variant-numeric: tabular-nums;
  }

  .episode-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .episode-desc {
    font-size: 0.8rem;
    color: var(--gray);
  }

  .episode-tracks {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin-top: 0.5rem;
    font-size: 0.7rem;
  }

  .episode-tracks li {
    display: flex;
    gap: 0.35rem;
  }

  .episode-tracks .track-time {
    color: var(--gray);
    font-variant-numeric: tabular-nums;
  }

  .episode-tracks .track-name {
    color: var(--gray);
  }

  .play-btn {
    padding: 0.4rem 0.75rem;
    border: 2px solid var(--black);
    background: var(--white);
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .play-btn:hover {
    background: var(--black);
    color: var(--white);
  }

  @media (min-width: 640px) {
    .hero {
      padding: 3rem 0;
      margin-bottom: 2rem;
    }

    .hero h1 {
      font-size: 2.5rem;
    }

    .hero p {
      font-size: 1rem;
    }

    .episodes h2 {
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .episode-list {
      margin: 0;
    }

    .episode-item {
      padding: 1.5rem;
      gap: 1rem;
    }

    .episode-meta {
      font-size: 0.75rem;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .episode-title {
      font-size: 1.125rem;
    }

    .episode-desc {
      font-size: 0.875rem;
    }

    .episode-tracks {
      font-size: 0.75rem;
    }

    .play-btn {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }
  }
</style>
