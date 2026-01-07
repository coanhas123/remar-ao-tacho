export type ProductCategory = 'doce' | 'mar' | 'tradicional';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  category: ProductCategory;
  location: string;
  sourceUrl?: string;
  imageAttribution?: string;
  tags?: string[];
}

export type StoryCategory = 'historia' | 'cultura' | 'natureza';

export interface Story {
  id: string;
  title: string;
  date: string;
  category: StoryCategory;
  image: string;
  summary: string;
  sourceUrl?: string;
  mediaAttribution?: string;
}

export type PlaceType = 'loja' | 'restaurante' | 'historico';

export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: PlaceType;
  distance: string;
  address?: string;
  tags?: string[];
  sourceUrl?: string;
}

export interface Moodboard {
  id: string;
  title: string;
  count: number;
  accentColor: string;
  coverImage?: string;
  description?: string;
  productIds?: string[];
  updatedAt?: string;
}
