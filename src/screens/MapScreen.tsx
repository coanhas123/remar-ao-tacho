import { places as fallbackPlaces } from '@/src/data/mockData';
import { usePlacesCatalog } from '@/src/hooks/useContentQueries';
import { useTheme } from '@/src/styles';
import { Place, PlaceType } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// IMPORTANTE: Importar o Marker separadamente
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Estilo do Mapa (Versão Branca/Clean)
const mapStyleLight = [
  { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }
];

const filterConfig: { label: string; type: PlaceType; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Lojas Típicas', type: 'loja', color: '#F6ED44', icon: 'basket' },
  { label: 'Restaurantes', type: 'restaurante', color: '#F99D2F', icon: 'restaurant' },
  { label: 'Locais Históricos', type: 'historico', color: '#662D91', icon: 'flag' },
];

export const MapScreen = () => {
  const theme = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<PlaceType[]>(filterConfig.map((f) => f.type));
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());

  const placesQuery = usePlacesCatalog(selectedFilters);
  const mapPlaces = placesQuery.data?.length ? placesQuery.data : fallbackPlaces.filter((place) => selectedFilters.includes(place.type));

  const toggleFilter = (type: PlaceType) => {
    setSelectedFilters((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
    setActivePlace(null);
  };

  const openInMaps = (lat: number, lng: number, label: string) => {
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
        ios: `maps:0,0?q=${label}@${latLng}`,
        android: `geo:0,0?q=${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  const getCategoryConfig = (type: PlaceType) => {
    return filterConfig.find((f) => f.type === type) || filterConfig[0];
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyleLight}
        initialRegion={{
          latitude: 40.6405,
          longitude: -8.6538,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={() => setActivePlace(null)} // Fecha a card ao clicar no mapa vazio
        mapPadding={{ top: 100, right: 0, bottom: activePlace ? 250 : 0, left: 0 }}
      >
        {mapPlaces.map((place) => {
          const config = getCategoryConfig(place.type);
          const isActive = activePlace?.id === place.id;
          const isVisited = visitedPlaces.has(place.id);

          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => setActivePlace(place)}
              tracksViewChanges={false} // Melhora performance
            >
              <View style={[
                styles.markerCircle, 
                { backgroundColor: config.color },
                isActive && styles.markerActive,
                isVisited && !isActive && { opacity: 0.5 }
              ]}>
                <Ionicons 
                  name={config.icon as any} 
                  size={isActive ? 20 : 16} 
                  color={isActive ? config.color : "white"} 
                />
              </View>
              {/* Pontinha do marcador */}
              <View style={[styles.markerArrow, { borderTopColor: isActive ? 'white' : config.color }]} />
            </Marker>
          );
        })}
      </MapView>

      {/* Filtros no Topo */}
      <SafeAreaView style={styles.topUI}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {filterConfig.map((filter) => {
            const isActive = selectedFilters.includes(filter.type);
            return (
              <TouchableOpacity
                key={filter.type}
                onPress={() => toggleFilter(filter.type)}
                style={[styles.filterTab, { backgroundColor: isActive ? filter.color : 'white' }]}
              >
                <Text style={{ fontWeight: '600', color: isActive ? 'black' : filter.color }}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Card de Informação (Só aparece se houver local selecionado) */}
      {activePlace && (
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{activePlace.name}</Text>
            <TouchableOpacity onPress={() => setActivePlace(null)}>
              <Ionicons name="close-circle" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.cardDesc} numberOfLines={2}>{activePlace.description}</Text>

          <View style={styles.cardButtons}>
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: theme.colors.accentPrimary }]}
              onPress={() => openInMaps(activePlace.latitude, activePlace.longitude, activePlace.name)}
            >
              <Ionicons name="navigate" size={18} color="white" />
              <Text style={styles.btnText}>Ver no Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: visitedPlaces.has(activePlace.id) ? '#4CAF50' : '#eee' }]}
              onPress={() => {
                const newVisited = new Set(visitedPlaces);
               if (newVisited.has(activePlace.id)) {
                  newVisited.delete(activePlace.id);
                } else {
                  newVisited.add(activePlace.id);
                }
                setVisitedPlaces(newVisited); 
              }}
            >
              <Ionicons name="checkmark-done" size={18} color={visitedPlaces.has(activePlace.id) ? "white" : "black"} />
              <Text style={[styles.btnText, { color: visitedPlaces.has(activePlace.id) ? "white" : "black" }]}>
                {visitedPlaces.has(activePlace.id) ? 'Visitado' : 'Marcar Visita'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {placesQuery.isFetching && (
        <View style={styles.loader}><ActivityIndicator size="small" color="black" /></View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topUI: { position: 'absolute', top: 50, zIndex: 10 },
  filterTab: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  markerCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    borderColor: 'white',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -2
  },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardDesc: { color: '#666', marginVertical: 10 },
  cardButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: 'white', fontWeight: '600' },
  loader: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 5 }
});