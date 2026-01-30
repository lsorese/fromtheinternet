<script lang="ts">
  import { getContext } from 'svelte';
  import { formatDate, formatDuration, type Episode } from '$lib';

  let { data } = $props();

  const playEpisode = getContext<(ep: Episode) => void>('playEpisode');
</script>

<svelte:head>
  <title>{data.episode.title} - From The Internet</title>
  <meta name="description" content={data.episode.description} />
</svelte:head>

<article class="episode">
  <header class="episode-header">
    <div class="episode-meta">
      <span>{formatDate(data.episode.date, 'long')}</span>
      <span>{formatDuration(data.episode.duration)}</span>
    </div>
    <h1>{data.episode.title}</h1>
    <p class="description">{data.episode.description}</p>

    <button class="play-btn" onclick={() => playEpisode(data.episode)}>
      ▶ Play Episode
    </button>
  </header>

  <div class="content">
    {@html data.content}
  </div>

  <footer class="episode-footer">
    <a href="/">← All Episodes</a>
  </footer>
</article>

<style>
  .episode {
    max-width: 600px;
  }

  .episode-header {
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--black);
    margin-bottom: 2rem;
  }

  .episode-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--gray);
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .description {
    color: var(--gray);
    margin-bottom: 1.5rem;
  }

  .play-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--black);
    background: var(--black);
    color: var(--white);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .play-btn:hover {
    background: var(--white);
    color: var(--black);
  }

  .content {
    line-height: 1.7;
  }

  .content :global(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
  }

  .content :global(h3) {
    font-size: 1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem;
  }

  .content :global(p) {
    margin-bottom: 1rem;
  }

  .content :global(ol),
  .content :global(ul) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .content :global(li) {
    margin-bottom: 0.5rem;
  }

  .content :global(a) {
    text-decoration: underline;
  }

  .episode-footer {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--light-gray);
  }

  .episode-footer a {
    font-size: 0.875rem;
    color: var(--gray);
  }
</style>
