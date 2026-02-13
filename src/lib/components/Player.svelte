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
  let isLoading = $state(false);
  let isDecoding = $state(false);
  let loadingProgress = $state(0);
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
      autoplay = false;
    }
  });

  $effect(() => {
    if (episode && container && typeof window !== 'undefined') {
      wavesurfer?.destroy();
      isLoading = true;
      loadingProgress = 0;

      // Load pre-rendered peaks data
      const initWavesurfer = async () => {
        let peaks: number[][] | undefined;

        if (episode.waveform) {
          try {
            const response = await fetch(episode.waveform);
            if (response.ok) {
              const data = await response.json();
              peaks = data.peaks;
            }
          } catch {
            // Fall back to decoding audio if peaks fail to load
          }
        }

        wavesurfer = WaveSurfer.create({
          container,
          waveColor: '#888',
          progressColor: '#000',
          cursorColor: '#000',
          barWidth: 2,
          barGap: 1,
          height: 60,
          url: episode.audio,
          peaks,
          duration: peaks ? episode.duration : undefined,
          interact: true
        });

        // If we have pre-rendered peaks, waveform renders immediately
        if (peaks) {
          isLoading = false;
        }

        regions = wavesurfer.registerPlugin(RegionsPlugin.create());

        wavesurfer.on('loading', (percent) => {
          loadingProgress = percent;
          if (percent === 100) {
            isLoading = false;
            // Only show decoding if we don't have pre-rendered peaks
            if (!peaks) {
              isDecoding = true;
            }
          }
        });

        wavesurfer.on('ready', () => {
          isDecoding = false;
          duration = wavesurfer!.getDuration();

          if (episode?.chapters) {
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

          if (shouldAutoplay) {
            wavesurfer!.play();
            shouldAutoplay = false;
          }
        });

        wavesurfer.on('play', () => (isPlaying = true));
        wavesurfer.on('pause', () => (isPlaying = false));
        wavesurfer.on('timeupdate', (time) => (currentTime = time));
      };

      initWavesurfer();
    }
  });

  onDestroy(() => {
    wavesurfer?.destroy();
  });
</script>

{#if episode}
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-3 sm:p-4">
    <div class="flex justify-between mb-2 text-xs sm:text-sm">
      <span class="font-semibold overflow-hidden text-ellipsis whitespace-nowrap mr-2">{episode.title}</span>
      <span class="tabular-nums text-gray shrink-0">{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>

    <div class="flex gap-3 sm:gap-4 items-center">
      <button
        class="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black bg-white text-sm sm:text-base cursor-pointer shrink-0 flex items-center justify-center leading-none hover:bg-black hover:text-white"
        onclick={togglePlay}
      >
        {isPlaying ? '▐▐' : '▶'}
      </button>

      <div class="flex-1 min-w-0 relative">
        <div class="w-full" class:loading-pulse={isLoading} bind:this={container}></div>
        {#if isLoading || isDecoding}
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="bg-black text-white px-2 py-1 text-[0.7rem] font-semibold">
              {#if isLoading}Loading {loadingProgress}%{:else}Please hold, your call is very important to us{/if}
            </span>
          </div>
        {/if}
      </div>
    </div>

    {#if episode.chapters && episode.chapters.length > 0}
      <div class="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 -webkit-overflow-scrolling-touch">
        {#each episode.chapters as chapter}
          {@const isActive = currentTime >= chapter.start}
          <button
            class="flex flex-col items-start px-2.5 py-1.5 sm:px-3 sm:py-2 border cursor-pointer whitespace-nowrap text-[0.65rem] sm:text-xs hover:border-black"
            class:bg-black={isActive}
            class:text-white={isActive}
            class:border-black={isActive}
            class:bg-white={!isActive}
            class:border-light-gray={!isActive}
            onclick={() => seekTo(chapter.start)}
          >
            <span class="tabular-nums" class:text-light-gray={isActive} class:text-gray={!isActive}>{formatTime(chapter.start)}</span>
            <span class="font-medium">{chapter.title}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}
