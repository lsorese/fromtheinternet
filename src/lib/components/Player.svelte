<script lang="ts">
  import { onDestroy } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
  import { formatTime, type Episode } from '$lib';

  let { episode = $bindable<Episode | null>(null), autoplay = $bindable(false) } = $props();

  let container: HTMLDivElement = $state(null!);
  let wavesurfer: WaveSurfer | null = null;
  let regions: RegionsPlugin | null = null;
  let isPlaying = $state(false);
  let isBuffering = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let shouldAutoplay = false;
  let audioLoaded = false;
  let pendingSeek: number | null = null;
  let loadAudioFn: (() => void) | null = null;

  function togglePlay() {
    wavesurfer?.playPause();
  }

  function seekTo(time: number) {
    if (!wavesurfer || duration <= 0) return;

    if (audioLoaded) {
      // Audio fully loaded, seek directly
      wavesurfer.seekTo(time / duration);
    } else {
      // Audio not loaded yet - store pending seek, show buffering, trigger load
      pendingSeek = time;
      isBuffering = true;
      loadAudioFn?.();
    }
  }

  $effect(() => {
    if (autoplay) {
      shouldAutoplay = true;
      autoplay = false;
    }
  });

  $effect(() => {
    if (episode && container && typeof window !== 'undefined') {
      wavesurfer?.destroy();
      audioLoaded = false;
      pendingSeek = null;
      isBuffering = false;

      const initWaveSurfer = async () => {
        let peaks: number[] | undefined;

        // Load pre-computed peaks for instant waveform
        if (episode.peaks) {
          try {
            const res = await fetch(episode.peaks);
            if (res.ok) {
              peaks = await res.json();
            }
          } catch {
            // Fall back to on-demand decoding
          }
        }

        // Create WaveSurfer with peaks for instant waveform display
        wavesurfer = WaveSurfer.create({
          container,
          waveColor: '#888',
          progressColor: '#000',
          cursorColor: '#000',
          barWidth: 2,
          barGap: 1,
          height: 60,
          peaks: peaks ? [peaks] : undefined,
          duration: episode.duration,
          interact: true
        });

        regions = wavesurfer.registerPlugin(RegionsPlugin.create());

        // Add chapter regions immediately (we have duration from metadata)
        duration = episode.duration;
        if (episode.chapters) {
          episode.chapters.forEach((chapter, i) => {
            const nextChapter = episode!.chapters[i + 1];
            const end = nextChapter ? nextChapter.start : duration;

            const label = document.createElement('span');
            label.textContent = chapter.title;
            label.style.cssText = `
              background: white;
              padding: 2px 6px;
              margin: 4px;
              font-size: 10px;
              font-weight: 600;
              border-radius: 2px;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
              color: black;
              display: ${window.innerWidth >= 640 ? 'inline-block' : 'none'};
            `;

            regions!.addRegion({
              start: chapter.start,
              end,
              content: label,
              color: 'rgba(0, 0, 0, 0.05)',
              drag: false,
              resize: false
            });
          });
        }

        // Load audio when user clicks play or seeks
        let audioLoadStarted = false;
        loadAudioFn = () => {
          if (audioLoadStarted) return;
          audioLoadStarted = true;
          isBuffering = true;

          // Fetch the full audio file and load it
          fetch(episode.audio)
            .then(res => res.blob())
            .then(blob => wavesurfer!.loadBlob(blob))
            .catch(console.error);
        };

        wavesurfer.on('ready', () => {
          // This fires after audio is fully decoded
          audioLoaded = true;
          isBuffering = false;

          // Handle pending seek
          if (pendingSeek !== null) {
            wavesurfer!.seekTo(pendingSeek / duration);
            wavesurfer!.play();
            pendingSeek = null;
          } else if (shouldAutoplay) {
            wavesurfer!.play();
            shouldAutoplay = false;
          }
        });

        wavesurfer.on('play', () => {
          isPlaying = true;
          loadAudioFn?.();
        });
        wavesurfer.on('pause', () => isPlaying = false);
        wavesurfer.on('timeupdate', (time) => currentTime = time);

        // Handle autoplay
        if (shouldAutoplay) {
          loadAudioFn();
        }
      };

      initWaveSurfer();
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
      <button class="play-btn" onclick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
        <img src={isPlaying ? '/icons/pause.svg' : '/icons/play.svg'} alt="" width="16" height="16" />
      </button>

      <div class="waveform" class:buffering={isBuffering} bind:this={container}></div>
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

<style lang="scss">
  .player {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 2px solid var(--black);
    padding: 0.75rem;

    @media (min-width: 640px) {
      padding: 1rem;
    }
  }

  .player-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;

    @media (min-width: 640px) {
      font-size: 0.875rem;
    }
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

    @media (min-width: 640px) {
      gap: 1rem;
    }
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

    &:hover {
      background: var(--black);
      color: var(--white);
    }

    @media (min-width: 640px) {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }
  }

  .waveform {
    flex: 1;
    min-width: 0;

    &.buffering {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .chapters {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    -webkit-overflow-scrolling: touch;

    @media (min-width: 640px) {
      margin-top: 0.75rem;
    }
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

    &:hover {
      border-color: var(--black);
    }

    &.active {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);

      .chapter-time {
        color: var(--light-gray);
      }
    }

    @media (min-width: 640px) {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
    }
  }

  .chapter-time {
    color: var(--gray);
    font-variant-numeric: tabular-nums;
  }

  .chapter-title {
    font-weight: 500;
  }
</style>
