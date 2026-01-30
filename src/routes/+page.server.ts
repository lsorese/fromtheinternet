import { getEpisodes } from '$lib/episodes';

export function load() {
  const episodes = getEpisodes();
  return { episodes };
}
