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

<section class="text-center py-8 border-b-2 border-black mb-4">
  <h1 class="text-2xl sm:text-3xl font-bold tracking-widest mb-2">FROM THE INTERNET</h1>
  <p class="text-gray text-sm">A monthly radio show. Music, noise, and everything in between.</p>
</section>

<section>
  <h2 class="text-xs uppercase tracking-widest mb-4 text-gray">Episodes</h2>

  <ul class="list-none flex flex-col gap-px bg-black -mx-4">
    {#each data.episodes as episode}
      <li class="bg-white p-4 flex justify-between items-start gap-3">
        <a href="/episodes/{episode.slug}" class="flex-1 min-w-0 no-underline text-inherit group">
          <div class="flex gap-3 text-[0.7rem] text-gray mb-1 tabular-nums">
            <span>{formatDate(episode.date)}</span>
            <span>{formatDuration(episode.duration)}</span>
          </div>
          <h3 class="text-base font-semibold mb-1 group-hover:underline">{episode.title}</h3>
          <p class="text-[0.8rem] text-gray">{episode.description}</p>
          {#if episode.chapters && episode.chapters.length > 0}
            <ul class="list-none flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[0.7rem]">
              {#each episode.chapters as chapter}
                <li class="flex gap-1.5">
                  <span class="text-gray tabular-nums">{formatTime(chapter.start)}</span>
                  <span class="text-gray">{chapter.title}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </a>
        <button
          class="px-3 py-1.5 border-2 border-black bg-white text-[0.7rem] font-semibold cursor-pointer whitespace-nowrap hover:bg-black hover:text-white"
          onclick={() => playEpisode(episode)}
        >
          ▶ Play
        </button>
      </li>
    {/each}
  </ul>
</section>
