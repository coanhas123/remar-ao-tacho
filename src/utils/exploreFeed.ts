/*import { Moodboard, Place, Product, Story } from '@/src/types/content';

export type ExploreFeedItemType = 'product' | 'story' | 'place' | 'moodboard';

export type ExploreFeedItem =
  | { type: 'product'; data: Product }
  | { type: 'story'; data: Story }
  | { type: 'place'; data: Place }
  | { type: 'moodboard'; data: Moodboard };

export interface ExploreFeedSource {
  products: Product[];
  stories: Story[];
  places: Place[];
  moodboards: Moodboard[];
}

export interface ExploreFeedOptions {
  seed?: number;
  template?: ExploreFeedItemType[];
  perTypeLimit?: Partial<Record<ExploreFeedItemType, number>>;
}

const DEFAULT_TEMPLATE: ExploreFeedItemType[] = ['product', 'story', 'place', 'place', 'moodboard'];
const DEFAULT_LIMITS: Record<ExploreFeedItemType, number> = {
  product: 4,
  story: 3,
  place: 3,
  moodboard: 1,
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed || 1);
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const FALLBACK_WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const FALLBACK_MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const formatDateLabel = (today: Date): string => {
  if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
    try {
      return new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
    } catch (error) {
      console.warn('Intl formatter failed, falling back to manual date label.', error);
    }
  }

  const weekday = FALLBACK_WEEKDAYS[today.getDay()] ?? '';
  const month = FALLBACK_MONTHS[today.getMonth()] ?? '';
  return `${weekday} · ${today.getDate()} ${month}`.trim();
};

export function getDailySeed() {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < todayKey.length; i += 1) {
    hash = (hash << 5) - hash + todayKey.charCodeAt(i);
    hash |= 0;
  }
  return {
    seed: Math.abs(hash) || 1,
    label: formatDateLabel(today),
  };
}

export function createExploreFeed(source: ExploreFeedSource, options: ExploreFeedOptions = {}): ExploreFeedItem[] {
  const limits = { ...DEFAULT_LIMITS, ...(options.perTypeLimit ?? {}) };
  const template = options.template ?? DEFAULT_TEMPLATE;
  const baseSeed = options.seed ?? getDailySeed().seed;

  const pools = {
    product: shuffleWithSeed(source.products, baseSeed + 11).slice(0, limits.product),
    story: shuffleWithSeed(source.stories, baseSeed + 23).slice(0, limits.story),
    place: shuffleWithSeed(source.places, baseSeed + 37).slice(0, limits.place),
    moodboard: shuffleWithSeed(source.moodboards, baseSeed + 49).slice(0, limits.moodboard),
  } satisfies Record<ExploreFeedItemType, any[]>;

  const feed: ExploreFeedItem[] = [];
  const maxIterations = 50;
  let iterations = 0;

  while (iterations < maxIterations) {
    let appendedInCycle = false;

    for (const slotType of template) {
      const pool = pools[slotType];
      if (pool?.length) {
        const item = pool.shift()!;
        feed.push({ type: slotType, data: item } as ExploreFeedItem);
        appendedInCycle = true;
      }
    }

    if (!appendedInCycle) {
      break;
    }

    iterations += 1;
  }

  return feed;
}*/
