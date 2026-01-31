<script lang="ts">
  import { getContext } from 'svelte';
  import { formatDate, formatDuration, formatTime, type Episode } from '$lib';

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

  {#if data.episode.chapters && data.episode.chapters.length > 0}
    <section class="tracklist">
      <h2>Tracklist</h2>
      <ol class="tracks">
        {#each data.episode.chapters as chapter, i}
          <li class="track">
            <span class="track-number">{String(i + 1).padStart(2, '0')}</span>
            <div class="track-info">
              <span class="track-title">{chapter.title}</span>
              {#if chapter.desc}
                <span class="track-desc">{chapter.desc}</span>
              {/if}
            </div>
            <span class="track-time">{formatTime(chapter.start)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  {#if data.Content}
    <div class="content">
      <data.Content />
    </div>
  {/if}

  <footer class="episode-footer">
    <a href="/">← All Episodes</a>
  </footer>
</article>

<style lang="scss">
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

    &:hover {
      background: var(--white);
      color: var(--black);
    }
  }

  .content {
    line-height: 1.7;

    :global(h2) {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
    }

    :global(h3) {
      font-size: 1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
    }

    :global(p) {
      margin-bottom: 1rem;
    }

    :global(ol),
    :global(ul) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :global(li) {
      margin-bottom: 0.5rem;
    }

    :global(a) {
      text-decoration: underline;
    }
  }

  .tracklist {
    margin-bottom: 2rem;

    h2 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--gray);
      margin-bottom: 1rem;
    }
  }

  .tracks {
    list-style: none;
    border: 1px solid var(--black);
  }

  .track {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--light-gray);

    &:last-child {
      border-bottom: none;
    }
  }

  .track-number {
    font-size: 0.7rem;
    color: var(--gray);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .track-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .track-title {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .track-desc {
    font-size: 0.8rem;
    color: var(--gray);
  }

  .track-time {
    font-size: 0.75rem;
    color: var(--gray);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .episode-footer {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--light-gray);

    a {
      font-size: 0.875rem;
      color: var(--gray);
    }
  }
</style>
