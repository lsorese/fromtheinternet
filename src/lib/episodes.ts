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
}

const episodeFiles = import.meta.glob('/src/content/episodes/*.md', { eager: true }) as Record<
  string,
  { default: unknown; metadata: Omit<Episode, 'slug' | 'content'> }
>;

export function getEpisodes(): Episode[] {
  const episodes: Episode[] = [];

  for (const [path, module] of Object.entries(episodeFiles)) {
    const slug = path.split('/').pop()?.replace('.md', '') ?? '';
    const { metadata } = module;

    episodes.push({
      slug,
      ...metadata,
      content: ''
    });
  }

  return episodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEpisode(slug: string): Episode | undefined {
  const path = `/src/content/episodes/${slug}.md`;
  const module = episodeFiles[path];

  if (!module) return undefined;

  return {
    slug,
    ...module.metadata,
    content: ''
  };
}
