import { places as fallbackPlaces, products as fallbackProducts, stories as fallbackStories } from '@/src/data/mockData';
import {
    fetchHeroProducts,
    fetchPlacesCatalog,
    fetchProductById,
    fetchStoriesFeed,
    fetchStoryById,
} from '@/src/services/contentGateway';
import { PlaceType, Product, Story } from '@/src/types/content';
import { useQuery } from '@tanstack/react-query';

const LONG_STALE_TIME = 1000 * 60 * 60; // 1 hour

export const useHeroProducts = () =>
  useQuery<Product[]>({
    queryKey: ['hero-products'],
    queryFn: fetchHeroProducts,
    staleTime: LONG_STALE_TIME,
    placeholderData: fallbackProducts,
  });

export const useStoriesFeed = () =>
  useQuery<Story[]>({
    queryKey: ['stories-feed'],
    queryFn: fetchStoriesFeed,
    staleTime: LONG_STALE_TIME,
    placeholderData: fallbackStories,
  });

export const usePlacesCatalog = (types: PlaceType[]) =>
  useQuery({
    queryKey: ['places-catalog', [...types].sort()],
    queryFn: () => fetchPlacesCatalog(types),
    enabled: Boolean(types.length),
    placeholderData: () => fallbackPlaces.filter((place) => types.includes(place.type)),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
    select: (data) => data.filter((place) => types.includes(place.type)),
  });

export const useProductDetail = (productId?: string) =>
  useQuery<Product | undefined>({
    queryKey: ['product-detail', productId],
    queryFn: () => fetchProductById(productId!),
    enabled: Boolean(productId),
    staleTime: LONG_STALE_TIME,
    placeholderData: () => fallbackProducts.find((product) => product.id === productId),
  });

export const useStoryDetail = (storyId?: string) =>
  useQuery<Story | undefined>({
    queryKey: ['story-detail', storyId],
    queryFn: () => fetchStoryById(storyId!),
    enabled: Boolean(storyId),
    staleTime: LONG_STALE_TIME,
    placeholderData: () => fallbackStories.find((story) => story.id === storyId),
  });
