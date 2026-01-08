const REQUEST_TIMEOUT_MS = 3000;
const USER_AGENT = 'RemarAoTacho/1.0';

interface CommonsImageInfo {
  url: string;
  thumburl?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, { value: string }>;
  width?: number;
  height?: number;
}

interface CommonsQueryPage {
  title: string;
  index?: number;
  imageinfo?: CommonsImageInfo[];
}

interface CommonsQueryResponse {
  query?: {
    pages: Record<string, CommonsQueryPage>;
  };
}

export interface WikimediaImageResult {
  url: string;
  originalUrl?: string;
  attribution?: string;
  descriptionUrl?: string;
  width?: number;
  height?: number;
}

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const stripHtml = (value?: string) => {
  if (!value) return undefined;
  return value.replace(/<[^>]+>/g, '').trim() || undefined;
};

const buildAttribution = (metadata?: Record<string, { value: string }>) => {
  if (!metadata) return undefined;
  const artist = stripHtml(metadata.Artist?.value);
  const license = stripHtml(metadata.LicenseShortName?.value);
  const credit = stripHtml(metadata.Credit?.value);

  return [artist, license ?? credit].filter(Boolean).join(' • ') || undefined;
};

async function queryCommons(term: string, targetWidth: number) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrlimit: '1',
    gsrsearch: term,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|dimensions',
    iiurlwidth: String(targetWidth),
    format: 'json',
    origin: '*',
  });

  const response = await fetchWithTimeout(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    return null;
  }

  const data = (await response.json()) as CommonsQueryResponse;
  const pages = data.query?.pages;
  if (!pages) return null;

  const orderedPages = Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const candidate = orderedPages.find((page) => page.imageinfo?.length);
  if (!candidate) return null;

  const image = candidate.imageinfo![0];
  return {
    url: image.thumburl ?? image.url,
    originalUrl: image.url,
    descriptionUrl: image.descriptionurl,
    attribution: buildAttribution(image.extmetadata),
    width: image.width,
    height: image.height,
  } satisfies WikimediaImageResult;
}

export async function searchCommonsImage(term: string | string[], targetWidth = 1200): Promise<WikimediaImageResult | null> {
  const terms = (Array.isArray(term) ? term : [term]).map((value) => value?.trim()).filter(Boolean) as string[];
  if (!terms.length) {
    return null;
  }

  for (const candidate of terms) {
    try {
      const result = await queryCommons(candidate, targetWidth);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn(`Commons image lookup failed for "${candidate}"`, error);
    }
  }

  return null;
}
