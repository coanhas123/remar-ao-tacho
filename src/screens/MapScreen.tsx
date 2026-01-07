import { FloatingInfoCard, MapMarker } from '@/src/components';
import { places as fallbackPlaces } from '@/src/data/mockData';
import { usePlacesCatalog } from '@/src/hooks/useContentQueries';
import { useTheme } from '@/src/styles';
import { Place, PlaceType } from '@/src/types/content';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapStyleElement } from 'react-native-maps';

const filterConfig: { label: string; type: PlaceType; color: string }[] = [
  { label: 'Lojas Típicas', type: 'loja', color: '#F6ED44' },
  { label: 'Restaurantes', type: 'restaurante', color: '#F99D2F' },
  { label: 'Locais Históricos', type: 'historico', color: '#662D91' },
];

export const MapScreen = () => {
  const theme = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<PlaceType[]>(filterConfig.map((f) => f.type));
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const placesQuery = usePlacesCatalog(selectedFilters);
  const mapPlaces = placesQuery.data?.length ? placesQuery.data : fallbackPlaces.filter((place) => selectedFilters.includes(place.type));

  useEffect(() => {
    if (!activePlace && mapPlaces.length) {
      setActivePlace(mapPlaces[0]);
    }
  }, [activePlace, mapPlaces]);

  const toggleFilter = (type: PlaceType) => {
    setSelectedFilters((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
    setActivePlace(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ position: 'absolute', top: theme.spacing.xl, left: 0, right: 0, zIndex: 2 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
          {filterConfig.map((filter) => {
            const isActive = selectedFilters.includes(filter.type);
            return (
              <TouchableOpacity
                key={filter.type}
                onPress={() => toggleFilter(filter.type)}
                style={{
                  marginRight: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radii.pill,
                  borderWidth: 1,
                  borderColor: filter.color,
                  backgroundColor: isActive ? filter.color : theme.colors.elevatedCard,
                }}
              >
                <Text style={{ color: isActive ? theme.colors.black : filter.color, fontFamily: theme.typography.fonts.bodyMedium }}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm, paddingHorizontal: theme.spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: theme.colors.textMuted }}>Resultados: {mapPlaces.length}</Text>
          <TouchableOpacity onPress={() => placesQuery.refetch()}>
            <Text style={{ color: theme.colors.statusInfo }}>Atualizar dados</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        style={{ flex: 1 }}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: 40.6405,
          longitude: -8.6538,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {mapPlaces.map((place) => (
          <MapMarker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            label={place.name}
            type={place.type}
            onPress={() => setActivePlace(place)}
          />
        ))}
      </MapView>
      <View style={{ position: 'absolute', bottom: theme.spacing.xxl + 140, left: 0, right: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
          {mapPlaces.map((place) => {
            const isActive = activePlace?.id === place.id;
            const baseColor = isActive ? theme.colors.black : theme.colors.text;
            const detailColor = isActive ? theme.colors.black : theme.colors.textMuted;
            const distanceColor = isActive ? theme.colors.black : theme.colors.accentPrimary;
            return (
              <TouchableOpacity
                key={place.id}
                onPress={() => setActivePlace(place)}
                style={{
                  width: 200,
                  marginRight: theme.spacing.sm,
                  padding: theme.spacing.md,
                  borderRadius: theme.radii.lg,
                  backgroundColor: isActive ? theme.colors.accentPrimary : theme.colors.elevatedCard,
                  borderWidth: 1,
                  borderColor: isActive ? theme.colors.accentPrimary : theme.colors.border,
                }}
              >
                <Text style={{ color: baseColor, fontFamily: theme.typography.fonts.heading }}>
                  {place.name}
                </Text>
                <Text style={{ color: detailColor, marginTop: theme.spacing.xs }} numberOfLines={2}>
                  {place.description}
                </Text>
                <Text style={{ color: distanceColor, marginTop: theme.spacing.sm }}>{place.distance}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ position: 'absolute', bottom: theme.spacing.xxl, right: theme.spacing.lg }}>
        {placesQuery.isFetching && <ActivityIndicator color={theme.colors.statusInfo} />}
        {placesQuery.error && (
          <Text style={{ color: theme.colors.statusAlert, marginTop: theme.spacing.xs }}>Mapa offline. A mostrar dados guardados.</Text>
        )}
      </View>

      {activePlace && <FloatingInfoCard place={activePlace} />}
    </View>
  );
};

const darkMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#0F1216' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B0E12' }] },
];
