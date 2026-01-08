
const REQUEST_TIMEOUT_MS = 3000;

const USER_AGENT = process.env.EXPO_PUBLIC_USER_AGENT || "";

/**
 * Cleans HTML markup from text by removing tags between < and >
 * Uses startsWith/endsWith to detect and filter HTML elements
 */
const cleanHTMLTags = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  let cleaned = '';
  let i = 0;
  
  while (i < text.length) {
    if (text[i].startsWith('<')) {
      // Found opening bracket, find closing bracket
      const closeIndex = text.indexOf('>', i);
      if (closeIndex !== -1) {
        i = closeIndex + 1; // Skip the entire tag
        continue;
      }
    }
    cleaned += text[i];
    i++;
  }
  
  return cleaned.trim();
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

interface WikipediaSummaryResponse {
  title: string;
  displaytitle?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source: string };
  content_urls?: { mobile?: { page: string } };
}

export interface WikipediaSummary {
  title: string;
  description?: string;
  extract?: string;
  url?: string;
  thumbnail?: string;
}

export async function fetchWikipediaSummary(title: string, lang: 'pt' | 'en' = 'pt'): Promise<WikipediaSummary | null> {
  const titleMappings: Record<string, string> = { 'Ovos Moles': 'Ovos_moles_de_Aveiro' };
  try {
    const mappedTitle = titleMappings[title] || title.trim().replace(/\s+/g, '_');
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(mappedTitle)}`;
    
    const response = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } });

    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return null;

    const data = await response.json() as WikipediaSummaryResponse;
    return {
      title: cleanHTMLTags(data.displaytitle ?? data.title),
      description: data.description,
      extract: data.extract,
      url: data.content_urls?.mobile?.page,
      thumbnail: data.thumbnail?.source,
    };
  } catch { return null; }
}

export async function searchCommonsImage(term: string | string[], targetWidth = 1200): Promise<{url: string, attribution?: string} | null> {
  const searchTerm = Array.isArray(term) ? term[0] : term;
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrlimit: '1', gsrsearch: searchTerm,
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(targetWidth),
    format: 'json', origin: '*',
  });

  try {
    const response = await fetchWithTimeout(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return null;

    const data = await response.json();
    const firstPage = Object.values(data?.query?.pages || {})[0] as any;
    const image = firstPage?.imageinfo?.[0];

    if (!image?.url) return null;

    return {
      url: image.thumburl ?? image.url,
      attribution: image.extmetadata?.Artist?.value || undefined,
    };
  } catch { return null; }
}

export async function PortugueseMeals() {
  try {
    const result = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Portuguese", {method: "GET"});
    const data = await result.json();
    console.log(data);
    return data;
  } catch (error) {
    console.warn("Failed to fetch meals", error);
  }
}