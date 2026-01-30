import { error } from '@sveltejs/kit';
import { getEpisode, getEpisodes } from '$lib/episodes';

export function load({ params }) {
  const episode = getEpisode(params.slug);

  if (!episode) {
    throw error(404, 'Episode not found');
  }

  const episodeFiles = import.meta.glob('/src/content/episodes/*.md', { eager: true }) as Record<
    string,
    { default: { render: () => { html: string } } }
  >;

  const path = `/src/content/episodes/${params.slug}.md`;
  const module = episodeFiles[path];
  const content = module?.default?.render?.()?.html ?? '';

  return {
    episode,
    content
  };
}

export function entries() {
  const episodes = getEpisodes();
  return episodes.map((ep) => ({ slug: ep.slug }));
}
