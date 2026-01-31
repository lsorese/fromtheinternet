<script lang="ts">
  import { onDestroy } from 'svelte';
  import { formatTime, type Episode } from '$lib';

  let { episode = $bindable<Episode | null>(null), autoplay = $bindable(false) } = $props();

  let audio: HTMLAudioElement = $state(null!);
  let isPlaying = $state(false);
  let isLoading = $state(false);
  let loadingProgress = $state(0);
  let currentTime = $state(0);
  let duration = $state(0);
  let audioReady = false;

  function loadAudio() {
    if (!episode || audioReady || isLoading) return;
    isLoading = true;
    loadingProgress = 0;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', episode.audio, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        loadingProgress = Math.round((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const url = URL.createObjectURL(xhr.response);
        audio.src = url;
        audio.load();
      }
    };

    xhr.send();
  }

  function togglePlay() {
    if (!audioReady) {
      loadAudio();
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  function seekTo(time: number) {
    if (!audioReady) {
      loadAudio();
      return;
    }
    console.log('Seeking to:', time, 'buffered:', audio.buffered.length > 0 ? `${audio.buffered.start(0)}-${audio.buffered.end(0)}` : 'none');
    audio.pause();
    audio.currentTime = time;
    console.log('After seek, currentTime:', audio.currentTime);
    audio.play().catch(console.error);
  }

  function handleCanPlayThrough() {
    audioReady = true;
    isLoading = false;
    duration = audio.duration;
    console.log('Audio ready, duration:', duration, 'buffered:', audio.buffered.length > 0 ? `${audio.buffered.start(0)}-${audio.buffered.end(0)}` : 'none');
    audio.play();
  }

  function handleTimeUpdate() {
    currentTime = audio.currentTime;
  }

  function handlePlay() {
    isPlaying = true;
  }

  function handlePause() {
    isPlaying = false;
  }

  function handleWaveformClick(e: MouseEvent) {
    if (!audioReady || !duration) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  $effect(() => {
    if (episode) {
      // Reset state for new episode
      audioReady = false;
      isLoading = false;
      loadingProgress = 0;
      currentTime = 0;
      duration = episode.duration;
      isPlaying = false;

      if (autoplay) {
        autoplay = false;
        loadAudio();
      }
    }
  });
</script>

<audio
  bind:this={audio}
  oncanplaythrough={handleCanPlayThrough}
  ontimeupdate={handleTimeUpdate}
  onplay={handlePlay}
  onpause={handlePause}
></audio>

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

      <div class="waveform-container">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="waveform" class:loading={isLoading} onclick={handleWaveformClick}>
          {#if episode.waveform}
            <img src={episode.waveform} alt="" class="waveform-image" />
          {:else}
            <div class="waveform-placeholder"></div>
          {/if}
          <div class="waveform-progress" style="width: {duration ? (currentTime / duration) * 100 : 0}%"></div>
        </div>
        {#if isLoading}
          <div class="loading-overlay">
            <span class="loading-text">Loading {loadingProgress}%</span>
          </div>
        {/if}
      </div>
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

  .waveform-container {
    flex: 1;
    min-width: 0;
    position: relative;
  }

  .waveform {
    position: relative;
    height: 60px;
    background: var(--light-gray);
    cursor: pointer;
    overflow: hidden;

    &.loading {
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  .waveform-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
  }

  .waveform-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #ccc 0%, #ddd 50%, #ccc 100%);
  }

  .waveform-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .loading-text {
    background: var(--black);
    color: var(--white);
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
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
