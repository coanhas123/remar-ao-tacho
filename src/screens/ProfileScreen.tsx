import { useMoodboards } from '@/src/context';
import { useLikedProducts } from '@/src/hooks';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PROFILE_PHOTO_KEY = 'profile_photo';

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; boardId: string; boardTitle: string }>({ visible: false, boardId: '', boardTitle: '' });
  const { moodboards, deleteMoodboard, refreshMoodboards, createMoodboard } = useMoodboards();
  const { likedProducts, removeLike } = useLikedProducts();

  // Load profile photo from AsyncStorage on mount
  useEffect(() => {
    const loadProfilePhoto = async () => {
      try {
        const savedPhoto = await AsyncStorage.getItem(PROFILE_PHOTO_KEY);
        if (savedPhoto) {
          setPhoto(savedPhoto);
        }
      } catch (error) {
        console.log('Erro ao carregar foto de perfil:', error);
      }
    };
    loadProfilePhoto();
  }, []);

  const saveProfilePhoto = async (photoUri: string) => {
    try {
      await AsyncStorage.setItem(PROFILE_PHOTO_KEY, photoUri);
      setPhoto(photoUri);
    } catch (error) {
      console.log('Erro ao guardar foto de perfil:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshMoodboards();
    }, [refreshMoodboards])
  );

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => setPermissionStatus(status));
  }, []);

  const handlePickImage = async () => {
    if (permissionStatus && permissionStatus !== ImagePicker.PermissionStatus.GRANTED) {
      const request = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (request.status !== ImagePicker.PermissionStatus.GRANTED) {
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0]?.uri ?? null;
      if (selectedUri) {
        await saveProfilePhoto(selectedUri);
      }
    }
  };

  const handleOpenMoodboard = (moodboardId: string) => {
    navigation.navigate('MoodboardDetail', { moodboardId });
  };

  const handleCreateMoodboard = async () => {
    if (!newBoardTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insere um título para o moodboard');
      return;
    }

    const colors = ['#E8DFF5', '#FCE1E4', '#DCF8C6', '#FFF4DE', '#E3F2FD', '#F3E5F5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    await createMoodboard(newBoardTitle.trim(), randomColor);
    setNewBoardTitle('');
    setShowCreateModal(false);
  };

  const handleDeleteMoodboard = (boardId: string, boardTitle: string) => {
    setDeleteConfirm({ visible: true, boardId, boardTitle });
  };

  const totalItems = moodboards.reduce((sum, board) => sum + board.products.length, 0);

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: theme.spacing.lg }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85} style={{ borderRadius: theme.radii.lg, overflow: 'hidden' }}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.profileImage} />
            ) : (
              <Image source={require('@/assets/Alicecoa.jpeg')} style={styles.profileImage} />
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: theme.spacing.md }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg }}>
              Alice Coan
            </Text>
            <Text style={{ color: theme.colors.textMuted }}>Curadora de sabores • Aveiro</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Produtos guardados" value={totalItems.toString()} color={theme.colors.accentPrimary} />
          <Stat label="Moodboards" value={moodboards.length.toString()} color={theme.colors.accentHighlight} />
          <Stat label="Likes" value={likedProducts.length.toString()} color={theme.colors.accentPrimary} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Moodboards</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={theme.colors.accentPrimary} />
          </TouchableOpacity>
        </View>

        {moodboards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
              Ainda não tens moodboards.{'\n'}Cria o teu primeiro!
            </Text>
          </View>
        ) : (
          <View style={styles.moodboardGrid}>
            {moodboards.map((board) => {
              const hasImage = board.coverImage || (board.products && board.products.length > 0);
              return (
              <TouchableOpacity
                key={board.id}
                activeOpacity={0.9}
                onPress={() => handleOpenMoodboard(board.id)}
                onLongPress={() => handleDeleteMoodboard(board.id, board.title)}
                style={styles.moodboardCard}
              >
                {hasImage ? (
                  <>
                    <ExpoImage 
                      source={{ uri: board.coverImage || board.products[0]?.image }} 
                      style={styles.moodboardImage}
                      contentFit="cover"
                    />
                    <View style={[styles.moodboardInfo, { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }]}>
                      <Text style={[styles.moodboardTitle, { color: 'white' }]} numberOfLines={1}>
                        {board.title}
                      </Text>
                      <Text style={[styles.moodboardCount, { color: 'rgba(255,255,255,0.8)' }]}>
                        {board.products.length} {board.products.length === 1 ? 'Pin' : 'Pins'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[styles.moodboardPlaceholder, { backgroundColor: board.products && board.products.length === 0 ? theme.colors.accentPrimary : (board.color || theme.colors.elevatedCard) }]}>
                      <Ionicons name="images-outline" size={32} color={board.products && board.products.length === 0 ? 'black' : theme.colors.textMuted} />
                    </View>
                    <View style={styles.moodboardInfo}>
                      <Text style={[styles.moodboardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {board.title}
                      </Text>
                      <Text style={[styles.moodboardCount, { color: theme.colors.textMuted }]}>
                        {board.products.length} {board.products.length === 1 ? 'Pin' : 'Pins'}
                      </Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
              );
            })}
          </View>
        )}

        {likedProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: theme.spacing.xl }]}>
                Meus Likes
              </Text>
            </View>
            <View style={styles.likedProductsGrid}>
              {likedProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => {
                    navigation.navigate('ProductModal', {
                      product: {
                        title: product.title,
                        description: product.description,
                        extract: product.extract,
                        thumbnail: product.image || product.thumbnail,
                        image: product.image || product.thumbnail,
                      } as any
                    });
                  }}
                  activeOpacity={0.8}
                  style={styles.likedCard}
                >
                  <ExpoImage 
                    source={{ uri: product.image || product.thumbnail }} 
                    style={styles.likedImage}
                    contentFit="cover"
                  />
                  <View style={styles.likedInfo}>
                    <Text style={[styles.likedTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {product.title}
                    </Text>
                    {product.extract && (
                      <Text style={[styles.likedDescription, { color: theme.colors.textMuted }]} numberOfLines={2}>
                        {product.extract}
                      </Text>
                    )}
                  </View>
                  <Ionicons 
                    name="heart" 
                    size={16} 
                    color={theme.colors.accentPrimary} 
                    style={{ position: 'absolute', top: 8, right: 8 }} 
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      removeLike(product.id);
                    }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24 }}
                  >
                    <Ionicons 
                      name="heart" 
                      size={20} 
                      color={theme.colors.accentPrimary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

  
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Novo Moodboard</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.elevatedCard,
                color: theme.colors.text,
                borderRadius: theme.radii.md,
              }]}
              placeholder="Nome do moodboard"
              placeholderTextColor={theme.colors.textMuted}
              value={newBoardTitle}
              onChangeText={setNewBoardTitle}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.elevatedCard }]}
                onPress={() => {
                  setNewBoardTitle('');
                  setShowCreateModal(false);
                }}
              >
                <Text style={{ color: theme.colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.accentPrimary }]}
                onPress={handleCreateMoodboard}
              >
                <Text style={{ color: '#000000', fontFamily: theme.typography.fonts.bodyMedium }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteConfirm.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirm({ visible: false, boardId: '', boardTitle: '' })}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#000000', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
              Eliminar Moodboard
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
              Tens a certeza que queres eliminar &quot;{deleteConfirm.boardTitle}&quot;?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF' }}
                onPress={() => setDeleteConfirm({ visible: false, boardId: '', boardTitle: '' })}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.accentHighlight }}
                onPress={() => {
                  deleteMoodboard(deleteConfirm.boardId);
                  setDeleteConfirm({ visible: false, boardId: '', boardTitle: '' });
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const theme = useTheme();

  return (
    <View style={{ marginRight: theme.spacing.lg }}>
      <Text style={{ color, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.xl }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 88,
    height: 88,
  },
  profilePlaceholder: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  moodboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodboardCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  moodboardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  moodboardPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodboardOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodboardInfo: {
    marginTop: 8,
  },
  moodboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodboardCount: {
    fontSize: 14,
    marginTop: 2,
  },
  likedProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  likedCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  likedImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  likedInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  likedTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  likedDescription: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
  },
  favoriteImage: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
});