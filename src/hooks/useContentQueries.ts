import { fetchPlacesCatalog } from '@/src/services/contentGateway';
import { PlaceType } from '@/src/types/content';
import { useQuery } from '@tanstack/react-query';

export const usePlacesCatalog = (types: PlaceType[]) =>
  useQuery({
    queryKey: ['places-catalog', [...types].sort()],
    queryFn: () => fetchPlacesCatalog(types),
    enabled: Boolean(types.length),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
    select: (data) => data.filter((place) => types.includes(place.type)),
  });
