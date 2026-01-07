import { fetchJson, safeParse } from './httpClient';

interface WikipediaSummaryResponse {
  title: string;
  displaytitle?: string;
  extract?: string;
  description?: string;
  thumbnail?: {
    source: string;
  };
  content_urls?: {
    desktop?: { page: string };
    mobile?: { page: string };
  };
}

export interface WikipediaSummary {
  title: string;
  description?: string;
  extract?: string;
  url?: string;
  thumbnail?: string;
}

export async function fetchWikipediaSummary(title: string, lang: 'pt' | 'en' = 'pt'): Promise<WikipediaSummary | null> {
  const encoded = encodeURIComponent(title);
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
  const data = await safeParse(fetchJson<WikipediaSummaryResponse>(url));

  if (!data) {
    return null;
  }

  return {
    title: data.displaytitle ?? data.title,
    description: data.description,
    extract: data.extract,
    url: data.content_urls?.mobile?.page ?? data.content_urls?.desktop?.page,
    thumbnail: data.thumbnail?.source,
  };
}
