import { Feed } from 'feed';
import { getEpisodes } from '$lib/episodes';

export const prerender = true;

const SITE_URL = 'https://fromtheinternet.com'; // Update with your domain

export function GET() {
  const episodes = getEpisodes();

  const feed = new Feed({
    title: 'From The Internet',
    description: 'A monthly radio show. Music, noise, and everything in between.',
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}/cover.png`,
    favicon: `${SITE_URL}/favicon.png`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${SITE_URL}/rss.xml`
    },
    author: {
      name: 'From The Internet',
      link: SITE_URL
    }
  });

  for (const episode of episodes) {
    feed.addItem({
      title: episode.title,
      id: `${SITE_URL}/episodes/${episode.slug}`,
      link: `${SITE_URL}/episodes/${episode.slug}`,
      description: episode.description,
      date: new Date(episode.date),
      enclosure: {
        url: `${SITE_URL}${episode.audio}`,
        length: episode.size,
        type: 'audio/mpeg'
      }
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
}
