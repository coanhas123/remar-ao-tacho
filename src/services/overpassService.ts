import { aveiroBoundingBox, placeTypeFilters } from '@/src/data/contentSources';
import { Place, PlaceType } from '@/src/types/content';
import { postForm } from './httpClient';

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  type: 'node' | 'way' | 'relation';
  center?: {
    lat: number;
    lon: number;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

const placeDescriptions: Record<PlaceType, string> = {
  loja: 'Lojas e oficinas típicas da região',
  restaurante: 'Restaurantes e casas de caldeirada',
  historico: 'Património e espaços culturais',
};

const CACHE_TTL = 1000 * 60 * 5;
const placeCache = new Map<string, { timestamp: number; data: Place[] }>();

const buildCacheKey = (types: PlaceType[]) => [...types].sort().join('|');

function buildSelector(filter: string, bbox: string): string {
  const [rawKey, rawValue] = filter.split('=');
  const key = rawKey.replace(/"/g, '').trim();
  const value = rawValue?.trim();
  const matcher = !value || value === '*'
    ? `["${key}"]`
    : `["${key}"="${value}"]`;

  return ['node', 'way', 'relation'].map((geometry) => `${geometry}${matcher}(${bbox});`).join('');
}

function buildQuery(types: PlaceType[]): string {
  if (!types.length) {
    return '';
  }

  const bbox = `${aveiroBoundingBox.south},${aveiroBoundingBox.west},${aveiroBoundingBox.north},${aveiroBoundingBox.east}`;
  const selectors = types
    .map((type) => {
      const filters = placeTypeFilters[type];
      return filters.map((filter) => buildSelector(filter, bbox)).join('');
    })
    .join('');

  return `[out:json][timeout:25];(${selectors});out center qt;`;
}

function formatAddress(tags?: Record<string, string>): string | undefined {
  if (!tags) return undefined;
  const street = tags['addr:street'];
  const number = tags['addr:housenumber'];
  if (street && number) return `${street}, ${number}`;
  if (street) return street;
  return undefined;
}

export async function fetchPlacesByTypes(types: PlaceType[]): Promise<Place[]> {
  if (!types.length) {
    return [];
  }

  const cacheKey = buildCacheKey(types);
  const cachedEntry = placeCache.get(cacheKey);
  const now = Date.now();
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
    return cachedEntry.data;
  }

  const query = buildQuery(types);
  if (!query) {
    return [];
  }

  try {
    const response = await postForm<OverpassResponse>(OVERPASS_ENDPOINT, `data=${encodeURIComponent(query)}`);

    const payload = response.elements
      .filter((element) => (element.lat && element.lon) || element.center)
      .map((element) => {
        const tags = element.tags ?? {};
        const inferredType = inferTypeFromTags(types, tags);
        const latitude = element.lat ?? element.center?.lat ?? 0;
        const longitude = element.lon ?? element.center?.lon ?? 0;

        return {
          id: `${element.id}`,
          name: tags.name ?? tags['addr:street'] ?? 'Local sem nome',
          description: tags.description ?? placeDescriptions[inferredType],
          latitude,
          longitude,
          type: inferredType,
          distance: '—',
          address: formatAddress(tags),
          tags: Object.keys(tags ?? {}),
          sourceUrl: tags.wikidata ? `https://www.wikidata.org/wiki/${tags.wikidata}` : undefined,
        };
      });

    placeCache.set(cacheKey, { timestamp: now, data: payload });
    return payload;
  } catch (error) {
    if (cachedEntry) {
      console.warn('Overpass request failed, serving cached data', error);
      return cachedEntry.data;
    }
    throw error;
  }
}

function inferTypeFromTags(requestedTypes: PlaceType[], tags: Record<string, string>): PlaceType {
  const possibilities = Object.entries(placeTypeFilters).find(([type, filters]) =>
    filters.some((filter) => {
      const [key, value] = filter.split('=');
      if (value === '*') {
        return Boolean(tags[key]);
      }
      return tags[key] === value;
    }),
  );

  if (possibilities) {
    return possibilities[0] as PlaceType;
  }

  return requestedTypes[0];
}
