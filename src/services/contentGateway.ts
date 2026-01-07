import { productSources, storySources } from '@/src/data/contentSources';
import { products as fallbackProducts, stories as fallbackStories } from '@/src/data/mockData';
import { Place, PlaceType, Product, Story } from '@/src/types/content';
import { fetchPlacesByTypes } from './overpassService';
import { searchCommonsImage } from './wikimediaService';
import { fetchWikipediaSummary } from './wikipediaService';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60';

async function buildProductFromSource(source: (typeof productSources)[number]): Promise<Product> {
  const [summary, image] = await Promise.all([
    fetchWikipediaSummary(source.wikiTitle),
    searchCommonsImage(source.commonsSearch),
  ]);

  return {
    id: source.id,
    title: summary?.title ?? source.fallbackTitle,
    subtitle: summary?.description ?? source.fallbackSubtitle,
    description: summary?.extract ?? source.fallbackDescription,
    image: image?.url ?? summary?.thumbnail ?? source.fallbackImage,
    category: source.category,
    location: source.location,
    sourceUrl: summary?.url,
    imageAttribution: image?.attribution,
    tags: source.tags,
  } satisfies Product;
}

async function buildStoryFromSource(source: (typeof storySources)[number]): Promise<Story> {
  const [summary, image] = await Promise.all([
    source.wikiTitle ? fetchWikipediaSummary(source.wikiTitle) : Promise.resolve(null),
    source.commonsSearch ? searchCommonsImage(source.commonsSearch) : Promise.resolve(null),
  ]);

  return {
    id: source.id,
    title: summary?.title ?? source.fallbackTitle,
    date: source.dateLabel,
    category: source.category,
    image: image?.url ?? summary?.thumbnail ?? source.fallbackImage ?? DEFAULT_IMAGE,
    summary: summary?.extract ?? source.fallbackSummary,
    sourceUrl: summary?.url,
    mediaAttribution: image?.attribution,
  } satisfies Story;
}

export async function fetchHeroProducts(): Promise<Product[]> {
  return Promise.all(productSources.map((source) => buildProductFromSource(source)));
}

export async function fetchStoriesFeed(): Promise<Story[]> {
  return Promise.all(storySources.map((source) => buildStoryFromSource(source)));
}

export async function fetchPlacesCatalog(types: PlaceType[]): Promise<Place[]> {
  try {
    const results = await fetchPlacesByTypes(types);
    return results;
  } catch (error) {
    console.warn('Overpass request failed', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product> {
  const source = productSources.find((item) => item.id === id);
  if (source) {
    return buildProductFromSource(source);
  }

  const fallback = fallbackProducts.find((product) => product.id === id);
  if (fallback) {
    return fallback;
  }

  throw new Error(`Produto "${id}" não encontrado.`);
}

export async function fetchStoryById(id: string): Promise<Story> {
  const source = storySources.find((item) => item.id === id);
  if (source) {
    return buildStoryFromSource(source);
  }

  const fallback = fallbackStories.find((story) => story.id === id);
  if (fallback) {
    return fallback;
  }

  throw new Error(`História "${id}" não encontrada.`);
}
