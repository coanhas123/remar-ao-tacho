import { fetchJson, safeParse } from './httpClient';

interface CommonsQueryResponse {
  query?: {
    pages: Record<
      string,
      {
        title: string;
        pageimage?: string;
        imageinfo?: {
          url: string;
          descriptionurl?: string;
          thumburl?: string;
          extmetadata?: Record<string, { value: string }>;
        }[];
      }
    >;
  };
}

export interface CommonsImage {
  title: string;
  url: string;
  originalUrl?: string;
  descriptionUrl?: string;
  attribution?: string;
}

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

type CommonsSearchTerms = string | string[];

export async function searchCommonsImage(terms: CommonsSearchTerms, targetWidth = 1200): Promise<CommonsImage | null> {
  const queue = Array.isArray(terms) ? terms : [terms];

  for (const term of queue) {
    const image = await fetchCommonsImage(term, targetWidth);
    if (image) {
      return image;
    }
  }

  return null;
}

async function fetchCommonsImage(term: string, targetWidth: number): Promise<CommonsImage | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrlimit: '1',
    gsrsearch: term,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(targetWidth),
    iiurlheight: String(Math.round(targetWidth * 0.75)),
    format: 'json',
    origin: '*',
  });

  const data = await safeParse(fetchJson<CommonsQueryResponse>(`${COMMONS_API}?${params.toString()}`));

  if (!data?.query?.pages) {
    return null;
  }

  const firstPage = Object.values(data.query.pages)[0];
  const image = firstPage.imageinfo?.[0];

  if (!image?.url) {
    return null;
  }

  const artist = image.extmetadata?.Artist?.value;
  const license = image.extmetadata?.LicenseShortName?.value;
  const attribution = [artist, license].filter(Boolean).join(' • ');

  return {
    title: firstPage.title,
    url: image.thumburl ?? image.url,
    originalUrl: image.url,
    descriptionUrl: image.descriptionurl,
    attribution: attribution || undefined,
  };
}
