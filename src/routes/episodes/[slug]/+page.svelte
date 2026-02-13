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

<article class="max-w-[600px]">
  <header class="pb-8 border-b-2 border-black mb-8">
    <div class="flex gap-4 text-sm text-gray mb-4">
      <span>{formatDate(data.episode.date, 'long')}</span>
      <span>{formatDuration(data.episode.duration)}</span>
    </div>
    <h1 class="text-3xl font-bold mb-2">{data.episode.title}</h1>
    <p class="text-gray mb-6">{data.episode.description}</p>

    <button
      class="px-6 py-3 border-2 border-black bg-black text-white text-sm font-semibold cursor-pointer hover:bg-white hover:text-black"
      onclick={() => playEpisode(data.episode)}
    >
      ▶ Play Episode
    </button>
  </header>

  {#if data.episode.chapters && data.episode.chapters.length > 0}
    <section class="mb-8">
      <h2 class="text-xs uppercase tracking-widest text-gray mb-4">Tracklist</h2>
      <ol class="list-none border border-black">
        {#each data.episode.chapters as chapter, i}
          <li class="flex items-baseline gap-4 px-4 py-3 border-b border-light-gray last:border-b-0">
            <span class="text-[0.7rem] text-gray tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <span class="font-semibold text-[0.9rem]">{chapter.title}</span>
              {#if chapter.desc}
                <span class="text-[0.8rem] text-gray">{chapter.desc}</span>
              {/if}
            </div>
            <span class="text-xs text-gray tabular-nums shrink-0">{formatTime(chapter.start)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  {#if data.Content}
    <div class="prose">
      <data.Content />
    </div>
  {/if}

  <footer class="mt-12 pt-8 border-t border-light-gray">
    <a href="/" class="text-sm text-gray">← All Episodes</a>
  </footer>
</article>

<style>
  @reference "tailwindcss";

  .prose :global(h2) {
    @apply text-xl font-semibold mt-8 mb-4;
  }

  .prose :global(h3) {
    @apply text-base font-semibold mt-6 mb-3;
  }

  .prose :global(p) {
    @apply mb-4;
  }

  .prose :global(ol),
  .prose :global(ul) {
    @apply mb-4 pl-6;
  }

  .prose :global(li) {
    @apply mb-2;
  }

  .prose :global(a) {
    @apply underline;
  }
</style>
