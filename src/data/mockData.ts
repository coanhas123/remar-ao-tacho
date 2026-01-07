import { Moodboard, Place, Product, Story } from '@/src/types/content';

export const heroProduct: Product = {
  id: 'ovos-moles',
  title: 'Ovos Moles de Aveiro',
  subtitle: 'Doçaria conventual',
  description: 'Receita ancestral com gema, açúcar e história servida nas embarcações moliceiras.',
  image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=900&q=60',
  category: 'doce',
  location: 'Oficinas da Praça do Peixe',
};

export const products: Product[] = [
  heroProduct,
  {
    id: 'raia-molho-pardo',
    title: 'Raia de Molho Pardo',
    subtitle: 'Sabores do Atlântico',
    description: 'Peixe preparado com sangue e especiarias, herança das famílias de pescadores.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
    category: 'mar',
    location: 'Salpoente',
  },
  {
    id: 'caldeirada-enguias',
    title: 'Caldeirada de Enguias',
    subtitle: 'Ria e tradição',
    description: 'Enguias da Ria de Aveiro cozinhadas lentamente em caçoilos de barro.',
    image: 'https://images.unsplash.com/photo-1474680091450-41c016972ad9?auto=format&fit=crop&w=800&q=60',
    category: 'tradicional',
    location: 'O Bairro',
  },
  {
    id: 'pao-lo-ovar',
    title: 'Pão de Ló de Ovar',
    subtitle: 'Forno baixo e húmido',
    description: 'Textura cremosa semelhante a um vulcão de gema.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=60',
    category: 'doce',
    location: 'M Bakery Aveiro',
  },
];

export const stories: Story[] = [
  {
    id: 'mulheres-salinas',
    title: 'Mulheres das Salinas',
    date: '09 Jan 2026',
    category: 'cultura',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
    summary: 'O artesanato do sal guiado pelas marnoteiras que mantêm viva a tradição.',
  },
  {
    id: 'segredos-moliceiros',
    title: 'Os segredos dos Moliceiros',
    date: '03 Jan 2026',
    category: 'historia',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60',
    summary: 'Do transporte de algas aos ícones coloridos que hoje percorrem os canais.',
  },
  {
    id: 'rota-acucar',
    title: 'O caminho do açúcar',
    date: '28 Dez 2025',
    category: 'historia',
    image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=1200&q=60',
    summary: 'Como a cana chegou aos conventos e virou símbolo doce de Aveiro.',
  },
];

export const moodboards: Moodboard[] = [
  {
    id: 'tons-de-sal',
    title: 'Tons de Sal e Nevoeiro',
    count: 12,
    accentColor: '#98CB4F',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60',
    description: 'Paleta inspirada nas salinas ao amanhecer: texturas minerais, névoa baixa e reflexos prateados sobre a água.',
    productIds: ['raia-molho-pardo', 'caldeirada-enguias'],
    updatedAt: 'Atualizado há 3 dias',
  },
  {
    id: 'doces-de-riadeaveiro',
    title: 'Doces da Ria',
    count: 8,
    accentColor: '#EE448D',
    coverImage: 'https://images.unsplash.com/photo-1505253216365-4b835bcfb68d?auto=format&fit=crop&w=1200&q=60',
    description: 'Seleção açucarada para partilhar: gemas, algas caramelizadas e motivos gráficos dos moliceiros.',
    productIds: ['ovos-moles', 'pao-lo-ovar'],
    updatedAt: 'Atualizado ontem',
  },
  {
    id: 'caldeiradas',
    title: 'Caldeiradas Fumegantes',
    count: 5,
    accentColor: '#F99D2F',
    coverImage: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=60',
    description: 'Receitas fumegantes que combinam barro vermelho com especiarias cítricas — perfeitas para noites frias.',
    productIds: ['caldeirada-enguias', 'raia-molho-pardo'],
    updatedAt: 'Atualizado há 5 dias',
  },
];

export const places: Place[] = [
  {
    id: 'mercado-peixe',
    name: 'Mercado da Praça do Peixe',
    description: 'Bancas tradicionais com peixe fresco e conversas de madrugada.',
    latitude: 40.6408,
    longitude: -8.6498,
    type: 'loja',
    distance: '0.4 km',
  },
  {
    id: 'salpoente',
    name: 'Restaurante Salpoente',
    description: 'Fusão contemporânea dentro de antigos armazéns de sal.',
    latitude: 40.6415,
    longitude: -8.662,
    type: 'restaurante',
    distance: '1.1 km',
  },
  {
    id: 'museu-arte-nova',
    name: 'Museu de Arte Nova',
    description: 'Programações sobre cultura, arquitetura e doçaria local.',
    latitude: 40.6428,
    longitude: -8.6536,
    type: 'historico',
    distance: '0.8 km',
  },
  {
    id: 'oficina-ovos',
    name: 'Oficina dos Ovos Moles',
    description: 'Workshops de recheio e pintura inspirados nos barcos moliceiros.',
    latitude: 40.6389,
    longitude: -8.6462,
    type: 'loja',
    distance: '0.6 km',
  },
];
