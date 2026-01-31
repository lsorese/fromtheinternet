<script lang="ts">
  import { onDestroy } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
  import { formatTime, type Episode } from '$lib';

  let { episode = $bindable<Episode | null>(null), autoplay = $bindable(false) } = $props();

  let container: HTMLDivElement;
  let wavesurfer: WaveSurfer | null = null;
  let regions: RegionsPlugin | null = null;
  let isPlaying = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let shouldAutoplay = false;

  function togglePlay() {
    wavesurfer?.playPause();
  }

  function seekTo(time: number) {
    if (wavesurfer && duration > 0) {
      wavesurfer.seekTo(time / duration);
    }
  }

  $effect(() => {
    if (autoplay) {
      shouldAutoplay = true;
      autoplay = false; // Reset the flag
    }
  });

  $effect(() => {
    if (episode && container && typeof window !== 'undefined') {
      wavesurfer?.destroy();

      wavesurfer = WaveSurfer.create({
        container,
        waveColor: '#888',
        progressColor: '#000',
        cursorColor: '#000',
        barWidth: 2,
        barGap: 1,
        height: 60,
        url: episode.audio,
        interact: true
      });

      regions = wavesurfer.registerPlugin(RegionsPlugin.create());

      wavesurfer.on('ready', () => {
        duration = wavesurfer!.getDuration();

        if (episode?.chapters) {
          episode.chapters.forEach((chapter, i) => {
            const nextChapter = episode!.chapters[i + 1];
            const end = nextChapter ? nextChapter.start : duration;

            regions!.addRegion({
              start: chapter.start,
              end,
              content: chapter.title,
              color: 'rgba(0, 0, 0, 0.05)',
              drag: false,
              resize: false
            });
          });
        }

        if (shouldAutoplay) {
          wavesurfer!.play();
          shouldAutoplay = false;
        }
      });

      wavesurfer.on('play', () => isPlaying = true);
      wavesurfer.on('pause', () => isPlaying = false);
      wavesurfer.on('timeupdate', (time) => currentTime = time);

    }
  });

  onDestroy(() => {
    wavesurfer?.destroy();
  });
</script>

{#if episode}
  <div class="player">
    <div class="player-info">
      <span class="player-title">{episode.title}</span>
      <span class="player-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>

    <div class="player-controls">
      <button class="play-btn" onclick={togglePlay}>
        {isPlaying ? '▐▐' : '▶'}
      </button>

      <div class="waveform" bind:this={container}></div>
    </div>

    {#if episode.chapters && episode.chapters.length > 0}
      <div class="chapters">
        {#each episode.chapters as chapter}
          <button
            class="chapter"
            class:active={currentTime >= chapter.start}
            onclick={() => seekTo(chapter.start)}
          >
            <span class="chapter-time">{formatTime(chapter.start)}</span>
            <span class="chapter-title">{chapter.title}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 2px solid var(--black);
    padding: 0.75rem;
  }

  .player-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
  }

  .player-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 0.5rem;
  }

  .player-time {
    font-variant-numeric: tabular-nums;
    color: var(--gray);
    flex-shrink: 0;
  }

  .player-controls {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .play-btn {
    width: 40px;
    height: 40px;
    border: 2px solid var(--black);
    background: var(--white);
    font-size: 0.875rem;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .play-btn:hover {
    background: var(--black);
    color: var(--white);
  }

  .waveform {
    flex: 1;
    min-width: 0;
  }

  .waveform :global([data-region-content]) {
    background: var(--white);
    padding: 0 0.25rem;
    font-size: 0.625rem;
    font-weight: 500;
  }

  .chapters {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    -webkit-overflow-scrolling: touch;
  }

  .chapter {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--light-gray);
    background: var(--white);
    cursor: pointer;
    white-space: nowrap;
    font-size: 0.65rem;
  }

  .chapter:hover {
    border-color: var(--black);
  }

  .chapter.active {
    background: var(--black);
    color: var(--white);
    border-color: var(--black);
  }

  .chapter-time {
    color: var(--gray);
    font-variant-numeric: tabular-nums;
  }

  .chapter.active .chapter-time {
    color: var(--light-gray);
  }

  .chapter-title {
    font-weight: 500;
  }

  @media (min-width: 640px) {
    .player {
      padding: 1rem;
    }

    .player-info {
      font-size: 0.875rem;
    }

    .player-controls {
      gap: 1rem;
    }

    .play-btn {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }

    .chapters {
      margin-top: 0.75rem;
    }

    .chapter {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
    }
  }
</style>
