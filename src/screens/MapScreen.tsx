import { usePlacesCatalog } from '@/src/hooks/useContentQueries';
import { Place, PlaceType } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#000000" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#cccccc" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bdc5c9" }] }
];

const filters = [
  { label: 'Restaurantes', type: 'restaurante' as PlaceType, color: '#F99D2F' },
  { label: 'Locais Históricos', type: 'historico' as PlaceType, color: '#662D91' },
];

const STORAGE_KEY = '@visited_places';
const COMMENTS_KEY = '@place_comments';

export const MapScreen = () => {
  const [selectedFilters, setSelectedFilters] = useState<PlaceType[]>(filters.map(f => f.type));
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [showCommentInput, setShowCommentInput] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { data, isFetching } = usePlacesCatalog(selectedFilters);

  useEffect(() => {
    if (isFetching) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isFetching, rotateAnim]);
  
  const loadVisitedPlaces = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setVisitedPlaces(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Erro ao carregar visitados:', error);
    }
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(COMMENTS_KEY);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  }, []);
  

  useEffect(() => {
    loadVisitedPlaces();
    loadComments();
  }, [loadVisitedPlaces, loadComments]);

  
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visitedPlaces)));
      } catch (error) {
        console.error('Erro ao salvar visitados:', error);
      }
    };
    saveData();
  }, [visitedPlaces]);

  const saveComments = async (newComments: Record<string, string[]>) => {
    try {
      await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(newComments));
    } catch (error) {
      console.error('Erro ao salvar comentários:', error);
    }
  };

  const addComment = () => {
    if (!activePlace || !comment.trim()) return;
    
    const newComments = {
      ...comments,
      [activePlace.id]: [...(comments[activePlace.id] || []), comment.trim()]
    };
    
    setComments(newComments);
    saveComments(newComments);
    setComment('');
    setShowCommentInput(false);
  };
  
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };
  
  
  const limitedPlaces = (data || []).reduce((acc, place) => {
    const MIN_DISTANCE = 500;
    const tooClose = acc.some(p => 
      getDistance(place.latitude, place.longitude, p.latitude, p.longitude) < MIN_DISTANCE
    );
    
    if (!tooClose) {
      acc.push(place);
    }
    
    return acc;
  }, [] as Place[]);
  
  const places = limitedPlaces.filter(p => 
    p.name && 
    p.name.toLowerCase() !== 'local sem nome' && 
    p.name.trim()
  );

  const toggleFilter = (type: PlaceType) => {
    setSelectedFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setActivePlace(null);
  };

  const openMaps = (lat: number, lng: number, name: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${name}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${name})`
    });
    if (url) Linking.openURL(url);
  };

  const toggleVisited = (id: string) => {
    const updated = new Set(visitedPlaces);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setVisitedPlaces(updated);
  };

  return (
    <View style={s.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={s.map}
        customMapStyle={mapStyle}
        initialRegion={{ latitude: 40.6405, longitude: -8.6538, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        onPress={() => setActivePlace(null)}
        mapPadding={{ top: 120, right: 0, bottom: activePlace ? 350 : 0, left: 0 }}
      >
        {places.map((place, i) => {
          const filter = filters.find(f => f.type === place.type) || filters[0];
          const isActive = activePlace?.id === place.id;
          const isVisited = visitedPlaces.has(place.id);
          const color = isVisited ? '#50a453ff' : filter.color;
          const size = 32;

          return (
            <Marker
              key={`${place.id}-${i}`}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              onPress={() => setActivePlace(place)}
            >
              <View style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                borderWidth: 1,
                borderColor: 'white',
                opacity: isActive ? 0.7 : 1,
                elevation: 8,
                shadowColor: '#ffffffff',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }} />
            </Marker>
          );
        })}
      </MapView>

      
      <View style={s.filters}>
        {filters.map(f => {
          const active = selectedFilters.includes(f.type);
          return (
            <TouchableOpacity
              key={f.type}
              onPress={() => toggleFilter(f.type)}
              style={[s.filterBtn, { 
                backgroundColor: active ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.3)',
                opacity: 1,
                paddingHorizontal: 16,
                paddingVertical: 9,
              }]}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: f.color, marginRight: 6 }} />
              <Text style={{ fontWeight: '600', color: active ? f.color : 'white', fontSize: 13 }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      
      <TouchableOpacity 
        style={s.moreBtn}
        onPress={() => setShowAll(!showAll)}
      >
        <Ionicons name={showAll ? "remove" : "add"} size={24} color="white" />
      </TouchableOpacity>

      
      {activePlace && (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{activePlace.name}</Text>
            <TouchableOpacity onPress={() => setActivePlace(null)}>
              <Ionicons name="close-circle" size={26} color="#888" />
            </TouchableOpacity>
          </View>
          
          <Text style={s.cardDesc} numberOfLines={2}>{activePlace.description}</Text>

         
          {comments[activePlace.id] && comments[activePlace.id].length > 0 && (
            <ScrollView style={s.commentsContainer} scrollEnabled={false}>
              {comments[activePlace.id].map((c, i) => (
                <View key={i} style={s.commentItem}>
                  <Ionicons name="chatbubble-outline" size={14} color="#999" />
                  <Text style={s.commentText}>{c}</Text>
                </View>
              ))}
            </ScrollView>
          )}

      
          {showCommentInput && (
            <View style={s.commentInputContainer}>
              <TextInput
                style={s.commentInput}
                placeholder="Escreve o teu comentário..."
                placeholderTextColor="#666"
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <TouchableOpacity style={s.commentSendBtn} onPress={addComment}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <View style={s.cardBtns}>
            <TouchableOpacity 
              style={[s.btn, { backgroundColor: 'white' }]}
              onPress={() => openMaps(activePlace.latitude, activePlace.longitude, activePlace.name)}
            >
              <Ionicons name="navigate" size={20} color="#1a1a1a" />
              <Text style={[s.btnText, { color: '#1a1a1a' }]}>Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.btn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => setShowCommentInput(!showCommentInput)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text style={[s.btnText, { color: 'white' }]}>Comentar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.btn, { 
                backgroundColor: visitedPlaces.has(activePlace.id) ? '#4CAF50' : '#2a2a2a',
                borderWidth: visitedPlaces.has(activePlace.id) ? 0 : 1.5,
                borderColor: '#3a3a3a',
              }]}
              onPress={() => toggleVisited(activePlace.id)}
            >
              <Ionicons 
                name={visitedPlaces.has(activePlace.id) ? "checkmark-done" : "checkmark-circle-outline"} 
                size={20} 
                color={visitedPlaces.has(activePlace.id) ? "white" : "#ccc"} 
              />
              <Text style={[s.btnText, { color: visitedPlaces.has(activePlace.id) ? "white" : "#ccc" }]}>
                {visitedPlaces.has(activePlace.id) ? 'Visto' : 'Marcar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {places.length === 0 && !isFetching && (
        <View style={s.empty}>
          <Ionicons name="map-outline" size={48} color="#ffffffff" />
          <Text style={s.emptyText}>Nenhum local encontrado</Text>
        </View>
      )}

      {isFetching && (
        <View style={s.loader}>
          <Animated.Image
            source={require("@/assets/Logo/remaraotachologo.png")}
            style={{
              width: 60,
              height: 60,
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  
  filters: { 
    position: 'absolute', 
    top: 20, 
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 30, 
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  
  moreBtn: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  card: { 
    position: 'absolute', 
    bottom: 30, 
    left: 16, 
    right: 16, 
    backgroundColor: '#1a1a1a', 
    borderRadius: 24, 
    padding: 20,
    elevation: 12,
    maxHeight: '60%',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: 'white', flex: 1, marginRight: 12 },
  cardDesc: { color: '#b0b0b0', marginBottom: 12, fontSize: 14, lineHeight: 20 },
  
  commentsContainer: {
    maxHeight: 180,
    marginBottom: 12,
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  commentText: {
    color: '#ccc',
    fontSize: 13,
    flex: 1,
  },
  
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: 'white',
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    maxHeight: 80,
  },
  commentSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardBtns: { flexDirection: 'row', gap: 8 },
  btn: { 
    flex: 1, 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6,
  },
  btnText: { fontWeight: '600', fontSize: 13 },
  
  empty: { position: 'absolute', top: '40%', alignSelf: 'center', alignItems: 'center', backgroundColor: 'black', padding: 24, borderRadius: 16, elevation: 4 },
  emptyText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#ffffffff' },
  
  loader: { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: 'rgba(238, 238, 238, 0.95)', padding: 12, borderRadius: 20, elevation: 5 }
});