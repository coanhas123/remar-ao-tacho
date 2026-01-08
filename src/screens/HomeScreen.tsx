import { products as fallbackProducts, moodboards } from '@/src/data/mockData';
import { useHeroProducts } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { fetchWikipediaSummary } from '@/src/services/wikipediaService';
import { useTheme } from '@/src/styles';
import { Product } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, GestureResponderEvent, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const heroQuery = useHeroProducts();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isModalVisible, setModalVisible] = useState(false);
  // Corrigido: Removido selectedProduct para eliminar o erro de unused-var
  const [wikiImage, setWikiImage] = useState<string | null>(null);

  // --- LÓGICA DE DADOS CORRIGIDA (TS2352) ---
  const { heroHighlight, featuredProducts } = useMemo(() => {
    // Usamos unknown como ponte para evitar o erro de conversão de undefined para Product[]
    const apiData = (heroQuery.data as unknown as Product[]) || [];
    const baseCollection = apiData.length > 0 ? apiData : (fallbackProducts as Product[]);
    
    return {
      heroHighlight: baseCollection[0],
      featuredProducts: baseCollection.slice(0, 3)
    };
  }, [heroQuery.data]);

  const safeMoodboards = Array.isArray(moodboards) ? moodboards : [];
  const isLoadingHero = heroQuery.isLoading && !heroQuery.data;
  const heroImageSource = wikiImage || heroHighlight?.image;

  const stopPropagation = (handler: () => void) => (event: GestureResponderEvent) => {
    event.stopPropagation();
    handler();
  };

  useEffect(() => {
    let isMounted = true;
    const getWikiImage = async () => {
      if (!heroHighlight?.title) return;
      try {
        const summary = await fetchWikipediaSummary(heroHighlight.title, 'pt');
        if (summary?.thumbnail && isMounted) {
          setWikiImage(summary.thumbnail);
        }
      } catch (error) {
        console.warn('Erro Wiki:', error);
      }
    };
    getWikiImage();
    return () => { isMounted = false; };
  }, [heroHighlight?.title]);

  if (isLoadingHero || !heroHighlight) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
      </View>
    );
  }

  const handleLike = (product: Product) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(product.id)) newFavs.delete(product.id);
      else newFavs.add(product.id);
      return newFavs;
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView edges={['top']}>
        <View style={{ padding: theme.spacing.lg }}>
          <Text style={[styles.locationLabel, { color: theme.colors.textMuted }]}>Aveiro, Portugal</Text>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>Sabores em destaque</Text>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <ImageBackground
            source={{ uri: heroImageSource }}
            style={styles.heroImage}
            imageStyle={{ borderRadius: theme.radii.lg }}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.heroTag}><Text style={styles.heroTagText}>Sazonal</Text></View>
              <View>
                <Text style={styles.heroTitle}>{heroHighlight.title}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProductModal', { productId: heroHighlight.id })}
                  style={[styles.heroButton, { backgroundColor: theme.colors.accentPrimary }]}
                >
                  <Text style={styles.heroButtonText}>Descobrir mais</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <Section title="Apresentação">
          <View style={styles.presentationList}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => navigation.navigate('ProductModal', { productId: product.id })}
                activeOpacity={0.8}
                style={[styles.presentationCard, { backgroundColor: theme.colors.card }]}
              >
                <Image source={{ uri: product.image }} style={styles.presentationImage} />
                <View style={styles.presentationContent}>
                  <Text style={[styles.presentationTitle, { color: theme.colors.text }]}>{product.title}</Text>
                  <Text style={[styles.presentationSubtitle, { color: theme.colors.textMuted }]} numberOfLines={2}>
                    {product.subtitle || product.description}
                  </Text>
                </View>
                <View style={styles.presentationActions}>
                  <TouchableOpacity onPress={stopPropagation(() => handleLike(product))}>
                    <Ionicons
                      name={favorites.has(product.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={favorites.has(product.id) ? theme.colors.accentPrimary : theme.colors.text}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={stopPropagation(() => setModalVisible(true))}>
                    <Ionicons name="add-circle-outline" size={22} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="Meus Moodboards">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
            {safeMoodboards.map((board) => (
              <TouchableOpacity 
                key={board.id}
                onPress={() => navigation.navigate('MoodboardDetail', { moodboardId: board.id })}
                style={[styles.moodboardMiniCard, { backgroundColor: (board as any).color || theme.colors.card }]}
              >
                <Text style={styles.moodboardTitle}>{board.title}</Text>
                <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>
      </SafeAreaView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guardar em:</Text>
            {safeMoodboards.map(board => (
              <TouchableOpacity key={board.id} style={styles.modalOption} onPress={() => setModalVisible(false)}>
                <Ionicons name="folder-outline" size={20} color={theme.colors.text} />
                <Text style={styles.modalOptionText}>{board.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: theme.colors.statusAlert }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={{ marginTop: 30, marginBottom: 10 }}>
    <Text style={{ marginLeft: 20, fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  locationLabel: { textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  heroImage: { height: 280, overflow: 'hidden' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'space-between' },
  heroTag: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  heroTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  heroButton: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginTop: 10 },
  heroButtonText: { fontWeight: 'bold', color: 'white' },
  presentationList: { paddingHorizontal: 20 },
  presentationCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, marginBottom: 12, elevation: 3 },
  presentationImage: { width: 72, height: 72, borderRadius: 16, marginRight: 14 },
  presentationContent: { flex: 1 },
  presentationTitle: { fontSize: 18, fontWeight: '700' },
  presentationSubtitle: { fontSize: 14, marginTop: 4 },
  presentationActions: { justifyContent: 'space-between', alignItems: 'flex-end', height: 60 },
  moodboardMiniCard: { width: 160, height: 100, borderRadius: 20, padding: 15, marginRight: 12, justifyContent: 'space-between' },
  moodboardTitle: { fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', borderRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#000' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee', gap: 10 },
  modalOptionText: { fontSize: 16, color: '#000' },
  closeBtn: { marginTop: 20, alignSelf: 'center' }
});