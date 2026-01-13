import { productSources, storySources } from "@/src/data/contentSources";
import { Place, PlaceType, Product, Story } from "@/src/types/content";
import { fetchPlacesByTypes } from "./overpassService";
import { fetchWikipediaSummary } from "./wikipediaService";

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60";

const sanitizeImageUrl = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("<")) {
    return null;
  }
  return trimmed;
};

const resolveImageSource = (
  ...candidates: (string | null | undefined)[]
): string => {
  for (const candidate of candidates) {
    const sanitized = sanitizeImageUrl(candidate);
    if (sanitized) {
      return sanitized;
    }
  }
  return DEFAULT_IMAGE;
};

async function buildProductFromSource(
  source: (typeof productSources)[number]
): Promise<Product> {
  try {
    const summary = await fetchWikipediaSummary(source.wikiTitle);

    const resolvedImage = resolveImageSource(
      source.fallbackImage,
      undefined,
      summary?.thumbnail
    );

    return {
      id: source.id,
      title: summary?.title ?? source.fallbackTitle,
      subtitle: summary?.description ?? source.fallbackSubtitle,
      description: summary?.extract ?? source.fallbackDescription,
      image: resolvedImage,
      category: source.category,
      location: source.location,
      sourceUrl: summary?.url,
      imageAttribution: undefined,
      tags: source.tags,
    } satisfies Product;
  } catch (error) {
    console.warn(`Failed to build product ${source.id}`, error);
    return {
      id: source.id,
      title: source.fallbackTitle,
      subtitle: source.fallbackSubtitle ?? "",
      description: source.fallbackDescription ?? "",
      image: resolveImageSource(source.fallbackImage),
      category: source.category,
      location: source.location,
      sourceUrl: undefined,
      imageAttribution: undefined,
      tags: source.tags,
    } satisfies Product;
  }
}

async function buildStoryFromSource(
  source: (typeof storySources)[number]
): Promise<Story> {
  try {
    const summary = source.wikiTitle
      ? await fetchWikipediaSummary(source.wikiTitle)
      : null;

    const resolvedImage = resolveImageSource(
      source.fallbackImage,
      undefined,
      summary?.thumbnail
    );

    return {
      id: source.id,
      title: summary?.title ?? source.fallbackTitle,
      date: source.dateLabel,
      category: source.category,
      image: resolvedImage,
      summary: summary?.extract ?? source.fallbackSummary,
      sourceUrl: summary?.url,
      mediaAttribution: undefined,
    } satisfies Story;
  } catch (error) {
    console.warn(`Failed to build story ${source.id}`, error);
    return {
      id: source.id,
      title: source.fallbackTitle,
      date: source.dateLabel,
      category: source.category,
      image: resolveImageSource(source.fallbackImage),
      summary: source.fallbackSummary ?? "",
      sourceUrl: undefined,
      mediaAttribution: undefined,
    } satisfies Story;
  }
}

export async function fetchHeroProducts(): Promise<Product[]> {
  return Promise.all(
    productSources.map((source) => buildProductFromSource(source))
  );
}

export async function fetchStoriesFeed(): Promise<Story[]> {
  return Promise.all(
    storySources.map((source) => buildStoryFromSource(source))
  );
}

export async function fetchPlacesCatalog(types: PlaceType[]): Promise<Place[]> {
  try {
    const results = await fetchPlacesByTypes(types);
    return results;
  } catch (error) {
    console.warn("Overpass request failed", error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product> {
  const source = productSources.find((item) => item.id === id);
  if (source) {
    return buildProductFromSource(source);
  }

  const fallback = undefined;
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

  const fallback = undefined;
  if (fallback) {
    return fallback;
  }

  throw new Error(`História "${id}" não encontrada.`);
}
