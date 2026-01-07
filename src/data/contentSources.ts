import { PlaceType, ProductCategory, StoryCategory } from '@/src/types/content';

type CommonsSearch = string | string[];

export interface ProductSource {
  id: string;
  wikiTitle: string;
  commonsSearch: CommonsSearch;
  category: ProductCategory;
  location: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackDescription: string;
  fallbackImage: string;
  tags?: string[];
}

export interface StorySource {
  id: string;
  wikiTitle?: string;
  commonsSearch?: CommonsSearch;
  category: StoryCategory;
  fallbackTitle: string;
  fallbackSummary: string;
  fallbackImage: string;
  dateLabel: string;
}

export const productSources: ProductSource[] = [
  {
    id: 'ovos-moles',
    wikiTitle: 'Ovos_moles',
    commonsSearch: ['Ovos moles Aveiro', 'Aveiro convent sweets'],
    category: 'doce',
    location: 'Oficinas da Praça do Peixe',
    fallbackTitle: 'Ovos Moles de Aveiro',
    fallbackSubtitle: 'Doçaria conventual',
    fallbackDescription: 'Gemas e açúcar envoltos em hóstias inspiradas nas velas moliceiras.',
    fallbackImage: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=900&q=60',
    tags: ['Património Imaterial', 'Convento de Jesus'],
  },
  {
    id: 'raia-molho-pardo',
    wikiTitle: 'Raia',
    commonsSearch: ['Raia preparada Aveiro', 'Raia molho pardo'],
    category: 'mar',
    location: 'Salpoente',
    fallbackTitle: 'Raia de Molho Pardo',
    fallbackSubtitle: 'Sabores do Atlântico',
    fallbackDescription: 'Receita de marinheiros com sangue do próprio peixe e vinagre aromático.',
    fallbackImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
    tags: ['Ria de Aveiro', 'Moliceiros'],
  },
  {
    id: 'caldeirada-enguias',
    wikiTitle: 'Caldeirada',
    commonsSearch: ['Caldeirada enguias Aveiro', 'Eel stew Portugal'],
    category: 'tradicional',
    location: 'Mercado do Peixe',
    fallbackTitle: 'Caldeirada de Enguias',
    fallbackSubtitle: 'Ria e tradição',
    fallbackDescription: 'Caçoilos lentos com enguias gordas, batata e especiarias.',
    fallbackImage: 'https://images.unsplash.com/photo-1474680091450-41c016972ad9?auto=format&fit=crop&w=800&q=60',
    tags: ['Caçoilos de barro', 'Bairros piscatórios'],
  },
  {
    id: 'pao-lo-ovar',
    wikiTitle: 'Pão-de-ló',
    commonsSearch: ['Pão de Ló de Ovar', 'Ovar sponge cake'],
    category: 'doce',
    location: 'Ovar',
    fallbackTitle: 'Pão de Ló de Ovar',
    fallbackSubtitle: 'Forno baixo e húmido',
    fallbackDescription: 'Interior ainda líquido, casca tostada e viagem curta até Aveiro.',
    fallbackImage: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=60',
    tags: ['Forno de lenha', 'Páscoa'],
  },
];

export const storySources: StorySource[] = [
  {
    id: 'mulheres-salinas',
    wikiTitle: 'Marinha_Santiago_da_Fontinha',
    commonsSearch: ['Aveiro salt workers', 'Marnoteiras Aveiro'],
    category: 'cultura',
    fallbackTitle: 'Mulheres das Salinas',
    fallbackSummary: 'As marnoteiras que guardam o brilho branco e a memória do sal.',
    fallbackImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
    dateLabel: '09 Jan 2026',
  },
  {
    id: 'segredos-moliceiros',
    wikiTitle: 'Moliceiro',
    commonsSearch: ['Moliceiro boat Aveiro', 'Pinturas moliceiro'],
    category: 'historia',
    fallbackTitle: 'Os segredos dos Moliceiros',
    fallbackSummary: 'Embarcações que passaram do transporte de moliço às narrativas satíricas.',
    fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60',
    dateLabel: '03 Jan 2026',
  },
  {
    id: 'rota-acucar',
    wikiTitle: 'Ovos_moles',
    commonsSearch: ['Doces conventuais Aveiro', 'Convent sweets Aveiro'],
    category: 'historia',
    fallbackTitle: 'O caminho do açúcar',
    fallbackSummary: 'Da cana atlântica aos claustros que moldaram os doces de gema.',
    fallbackImage: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=1200&q=60',
    dateLabel: '28 Dez 2025',
  },
];

export const aveiroBoundingBox = {
  south: 40.60,
  west: -8.71,
  north: 40.67,
  east: -8.61,
};

export const placeTypeFilters: Record<PlaceType, string[]> = {
  loja: ['shop=pastry', 'shop=convenience', 'craft=confectionery'],
  restaurante: ['amenity=restaurant', 'amenity=cafe'],
  historico: ['tourism=museum', 'historic=*'],
};
