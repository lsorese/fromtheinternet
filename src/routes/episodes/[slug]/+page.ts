const modules = import.meta.glob('/src/content/episodes/*.md');

export async function load({ params, data }) {
  const path = `/src/content/episodes/${params.slug}.md`;
  const module = modules[path];

  if (!module) {
    return { episode: data.episode, Content: null };
  }

  const { default: Content } = await module() as { default: ConstructorOfATypedSvelteComponent };

  return {
    episode: data.episode,
    Content
  };
}
