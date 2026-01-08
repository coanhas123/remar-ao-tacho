import { products as fallbackProducts, moodboards } from '@/src/data/mockData';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Product } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export const MoodboardDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MoodboardDetail'>>();
  const board = moodboards.find((item) => item.id === route.params.moodboardId);

  const initialProducts = useMemo(() => {
    if (!board?.productIds?.length) return [];
    return board.productIds
      .map((id) => fallbackProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [board]);

  const [currentProducts, setCurrentProducts] = useState<Product[]>(initialProducts);

  if (!board) return null;

  const handleRemove = (id: string) => {
    setCurrentProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ImageBackground source={{ uri: board.coverImage || currentProducts[0]?.image }} style={styles.hero}>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{board.title}</Text>
            <Text style={styles.subtitle}>{currentProducts.length} itens guardados</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Itens Guardados</Text>
        
        {currentProducts.length === 0 ? (
          <View style={styles.empty}><Text>O moodboard está vazio.</Text></View>
        ) : (
          currentProducts.map(product => (
            <View key={product.id} style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity 
                style={styles.cardInfo} 
                onPress={() => navigation.navigate('ProductModal', { productId: product.id })}
              >
                <Image source={{ uri: product.image }} style={styles.thumb} />
                <View>
                  <Text style={styles.cardTitle}>{product.title}</Text>
                  <Text style={{ color: '#888' }}>{product.location}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemove(product.id)} style={styles.removeIcon}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity 
          style={[styles.shareBtn, { backgroundColor: theme.colors.accentPrimary }]}
          onPress={() => Share.share({ message: `Vê o meu moodboard de Aveiro: ${board.title}` })}
        >
          <Text style={styles.shareText}>Partilhar Moodboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  hero: { height: 320 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, justifyContent: 'space-between' },
  backBtn: { marginTop: 40 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: 'white', fontSize: 16, opacity: 0.8 },
  container: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 10, borderRadius: 15, justifyContent: 'space-between' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  thumb: { width: 50, height: 50, borderRadius: 10, marginRight: 15 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  removeIcon: { padding: 10 },
  shareBtn: { marginTop: 20, padding: 15, borderRadius: 30, alignItems: 'center' },
  shareText: { fontWeight: 'bold', color: 'white' },
  empty: { alignItems: 'center', marginTop: 40 }
});