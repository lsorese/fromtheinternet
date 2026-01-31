export interface Chapter {
  start: number;
  title: string;
  desc?: string;
}

export interface Episode {
  slug: string;
  title: string;
  date: string;
  description: string;
  audio: string;
  duration: number;
  size: number;
  chapters: Chapter[];
  content: string;
  waveform?: string; // Path to pre-rendered waveform image
}

const episodeFiles = import.meta.glob('/src/content/episodes/*.md', { eager: true }) as Record<
  string,
  { default: unknown; metadata: Omit<Episode, 'slug' | 'content'> }
>;

function createEpisode(slug: string, metadata: Omit<Episode, 'slug' | 'content'>): Episode {
  return {
    slug,
    ...metadata,
    content: '',
    waveform: `/waveforms/${slug}.png`
  };
}

export function getEpisodes(): Episode[] {
  const episodes = Object.entries(episodeFiles).map(([path, module]) => {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    return createEpisode(slug, module.metadata);
  });

  return episodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEpisode(slug: string): Episode | undefined {
  const path = `/src/content/episodes/${slug}.md`;
  const module = episodeFiles[path];

  if (!module) return undefined;

  return createEpisode(slug, module.metadata);
}
