import { useMoodboards } from '@/src/context';
import { useTheme } from '@/src/styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddToMoodboardModalProps {
  visible: boolean;
  productId: string;
  productTitle: string;
  productImage?: string;
  productLocation?: string;
  productDescription?: string;
  productExtract?: string;
  onClose: () => void;
}

export const AddToMoodboardModal = ({
  visible,
  productId,
  productTitle,
  productImage,
  productLocation,
  productDescription,
  productExtract,
  onClose,
}: AddToMoodboardModalProps) => {
  const theme = useTheme();
  const { moodboards, createMoodboard, addProductToMoodboard } = useMoodboards();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToExisting = async (moodboardId: string) => {
    try {
      setIsLoading(true);
      await addProductToMoodboard(moodboardId, {
        id: productId,
        title: productTitle,
        image: productImage || 'https://via.placeholder.com/300',
        location: productLocation || 'Aveiro, Portugal',
        description: productDescription,
        extract: productExtract,
      });
      Alert.alert('Sucesso', 'Produto adicionado ao moodboard!');
      onClose();
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newBoardTitle.trim()) {
      Alert.alert('Erro', 'Por favor, insere um título para o moodboard');
      return;
    }

    try {
      setIsLoading(true);
      const colors = ['#E8DFF5', '#FCE1E4', '#DCF8C6', '#FFF4DE', '#E3F2FD', '#F3E5F5'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newBoardId = await createMoodboard(newBoardTitle.trim(), randomColor);
      
      // Adicionar produto ao novo moodboard
      await addProductToMoodboard(newBoardId, {
        id: productId,
        title: productTitle,
        image: productImage || 'https://via.placeholder.com/300',
        location: productLocation || 'Aveiro, Portugal',
        description: productDescription,
        extract: productExtract,
      });
      
      Alert.alert('Sucesso', 'Moodboard criado e produto adicionado!');
      setNewBoardTitle('');
      setShowCreateNew(false);
      onClose();
    } catch (error) {
      console.error('Erro ao criar moodboard:', error);
      Alert.alert('Erro', 'Não foi possível criar o moodboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowCreateNew(false);
    setNewBoardTitle('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Adicionar a Moodboard
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                {productTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {!showCreateNew ? (
            <>
              <ScrollView style={styles.listContainer}>
                {moodboards.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="albums-outline" size={48} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                      Ainda não tens moodboards
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                      Cria o teu primeiro moodboard
                    </Text>
                  </View>
                ) : (
                  moodboards.map((board) => (
                    <TouchableOpacity
                      key={board.id}
                      onPress={() => handleAddToExisting(board.id)}
                      disabled={isLoading}
                      style={[
                        styles.moodboardItem,
                        { backgroundColor: theme.colors.elevatedCard },
                      ]}
                    >
                      <View
                        style={[
                          styles.moodboardThumb,
                          { backgroundColor: board.products && board.products.length === 0 ? theme.colors.accentPrimary : (board.color || theme.colors.background) },
                        ]}
                      >
                        {board.coverImage ? (
                          <Image 
                            source={{ uri: board.coverImage }}
                            style={styles.thumbnailImage}
                            contentFit="cover"
                          />
                        ) : board.products && board.products.length > 0 ? (
                          <Image 
                            source={{ uri: board.products[0]?.image }}
                            style={styles.thumbnailImage}
                            contentFit="cover"
                          />
                        ) : (
                          <Ionicons name="images-outline" size={24} color={board.products && board.products.length === 0 ? 'black' : theme.colors.textMuted} />
                        )}
                      </View>
                      <View style={styles.moodboardInfo}>
                        <Text style={[styles.moodboardTitle, { color: theme.colors.text }]}>
                          {board.title}
                        </Text>
                        <Text style={[styles.moodboardCount, { color: theme.colors.textMuted }]}>
                          {board.products.length} {board.products.length === 1 ? 'item' : 'itens'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {/* Create New Button */}
              <TouchableOpacity
                onPress={() => setShowCreateNew(true)}
                style={[styles.createButton, { backgroundColor: theme.colors.accentPrimary }]}
                disabled={isLoading}
              >
                <Ionicons name="add-circle-outline" size={20} color="black" />
                <Text style={{ color: 'black', fontWeight: '600' }}>Criar Novo Moodboard</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Create New Form */}
              <View style={styles.createForm}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  Nome do Moodboard
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.elevatedCard,
                      color: theme.colors.text,
                      borderRadius: theme.radii.md,
                    },
                  ]}
                  placeholder="Ex: Doces de Aveiro"
                  placeholderTextColor={theme.colors.textMuted}
                  value={newBoardTitle}
                  onChangeText={setNewBoardTitle}
                  autoFocus
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.formButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateNew(false);
                    setNewBoardTitle('');
                  }}
                  style={[
                    styles.formButton,
                    { backgroundColor: theme.colors.elevatedCard },
                  ]}
                  disabled={isLoading}
                >
                  <Text style={{ color: theme.colors.text }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateNew}
                  style={[
                    styles.formButton,
                    { backgroundColor: theme.colors.accentPrimary },
                  ]}
                  disabled={isLoading || !newBoardTitle.trim()}
                >
                  <Text style={{ color: 'black', fontWeight: '600' }}>
                    {isLoading ? 'Criando...' : 'Criar e Adicionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  moodboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  moodboardThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  moodboardInfo: {
    flex: 1,
  },
  moodboardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodboardCount: {
    fontSize: 13,
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createForm: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  formButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  formButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});