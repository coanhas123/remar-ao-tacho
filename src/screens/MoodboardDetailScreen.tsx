import { useMoodboards } from '@/src/context';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Product } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import { useMemo } from 'react';
import { Alert, ImageBackground, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MoodboardDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MoodboardDetail'>>();
  const { getMoodboard, removeProductFromMoodboard, updateMoodboardCoverImage } = useMoodboards();
  
  const board = useMemo(() => {
    return getMoodboard(route.params.moodboardId);
  }, [route.params.moodboardId, getMoodboard]);

  const products = useMemo(() => {
    return board?.products || [];
  }, [board]);

  const handleSelectCoverImage = (productImage: string) => {
    Alert.alert(
      'Definir como capa',
      'Queres usar esta imagem como capa do moodboard?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim', 
          style: 'default',
          onPress: () => {
            updateMoodboardCoverImage(route.params.moodboardId, productImage);
            Alert.alert('Sucesso', 'Imagem de capa atualizada!');
          }
        }
      ]
    );
  };

  const handleRemove = (productId: string) => {
    Alert.alert(
      'Remover produto',
      'Tens a certeza que queres remover este item do moodboard?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removeProductFromMoodboard(route.params.moodboardId, productId)
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Vê o meu moodboard de Aveiro: ${board?.title}\n${products.length} ${products.length === 1 ? 'item' : 'itens'} guardados`,
      });
    } catch (error) {
      console.error('Erro ao partilhar:', error);
    }
  };

  if (!board) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="albums-outline" size={48} color={theme.colors.textMuted} />
        <Text style={[styles.emptyText, { color: theme.colors.text, marginTop: 16 }]}>
          Moodboard não encontrado
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.button, { backgroundColor: theme.colors.accentPrimary, marginTop: 20 }]}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

 
  const heroStyle = board.coverImage 
    ? { uri: board.coverImage }
    : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {heroStyle ? (
        <ImageBackground source={heroStyle} style={styles.hero}>
          <View style={styles.overlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.heroTitle}>{board.title}</Text>
              <Text style={styles.heroSubtitle}>
                {products.length} {products.length === 1 ? 'item guardado' : 'itens guardados'}
              </Text>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.hero, { backgroundColor: board.color || theme.colors.elevatedCard }]}>
          <View style={styles.overlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>{board.title}</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.textMuted, opacity: 1 }]}>
                {products.length} {products.length === 1 ? 'item guardado' : 'itens guardados'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Itens Guardados</Text>
          {products.length > 0 && (
            <TouchableOpacity onPress={handleShare} style={styles.shareIconBtn}>
              <Ionicons name="share-outline" size={22} color={theme.colors.accentPrimary} />
            </TouchableOpacity>
          )}
        </View>
        
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.text, marginTop: 16 }]}>
              O moodboard está vazio
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textMuted, marginTop: 8 }]}>
              Adiciona produtos aos teus favoritos e guarda-os aqui
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              {products.map((product: Product) => (
                <View key={product.id} style={styles.gridItem}>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ProductModal', { product })}
                    onLongPress={() => handleSelectCoverImage(product.image)}
                    delayLongPress={500}
                    style={{ flex: 1 }}
                  >
                    <ExpoImage 
                      source={{ uri: product.image }} 
                      style={styles.productImage}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleRemove(product.id)} 
                    style={[styles.removeBtn, { backgroundColor: theme.colors.accentPrimary }]}
                  >
                    <Ionicons name="trash-outline" size={16} color="black" />
                  </TouchableOpacity>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {product.title}
                    </Text>
                    {product.location && (
                      <Text style={[styles.productLocation, { color: theme.colors.textMuted }]} numberOfLines={1}>
                        📍 {product.location}
                      </Text>
                    )}
                    {product.description && (
                      <Text style={[styles.productDescription, { color: theme.colors.textMuted }]} numberOfLines={2}>
                        {product.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hero: {
    height: 280,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    marginTop: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  shareIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  productLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  productDescription: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  shareBtn: {
    marginTop: 20,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shareText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});