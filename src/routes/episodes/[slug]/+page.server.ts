import { error } from '@sveltejs/kit';
import { getEpisode, getEpisodes } from '$lib/episodes';

export function load({ params }) {
  const episode = getEpisode(params.slug);

  if (!episode) {
    throw error(404, 'Episode not found');
  }

  return { episode };
}

export function entries() {
  const episodes = getEpisodes();
  return episodes.map((ep) => ({ slug: ep.slug }));
}
