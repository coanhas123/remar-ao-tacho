import { products as fallbackProducts, moodboards } from '@/src/data/mockData';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Product } from '@/src/types/content';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Image, ImageBackground, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

export const MoodboardDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MoodboardDetail'>>();
  const board = moodboards.find((item) => item.id === route.params.moodboardId);

  const relatedProducts = useMemo(() => {
    if (!board?.productIds?.length) {
      return [];
    }

    return board.productIds
      .map((productId) => fallbackProducts.find((product) => product.id === productId))
      .filter(Boolean) as Product[];
  }, [board]);

  if (!board) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>Moodboard não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.accentPrimary }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const heroImage = board.coverImage ?? relatedProducts[0]?.image;

  const handleOpenProduct = (productId: string) => {
    navigation.navigate('ProductModal', { productId });
  };

  const handleShareMoodboard = async () => {
    try {
      await Share.share({
        message: `${board.title} — ${board.description ?? 'Moodboard de Aveiro'} (${board.count} itens)`,
      });
    } catch (error) {
      console.warn('Erro ao partilhar moodboard', error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {heroImage && (
        <ImageBackground source={{ uri: heroImage }} style={{ height: 320 }} imageStyle={{ opacity: 0.85 }}>
          <View style={{ flex: 1, justifyContent: 'space-between', padding: theme.spacing.lg, backgroundColor: 'rgba(5,7,9,0.4)' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', paddingVertical: theme.spacing.xs }}>
              <Text style={{ color: theme.colors.white }}>Fechar</Text>
            </TouchableOpacity>
            <View>
              <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.display, fontSize: theme.typography.sizes.xl }}>{board.title}</Text>
              <Text style={{ color: theme.colors.white, marginTop: theme.spacing.xs }}>{board.count} itens guardados</Text>
              {board.updatedAt && (
                <Text style={{ color: theme.colors.white, marginTop: theme.spacing.xs, opacity: 0.9 }}>{board.updatedAt}</Text>
              )}
            </View>
          </View>
        </ImageBackground>
      )}

      <View style={{ padding: theme.spacing.lg }}>
        {board.description && (
          <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.md, lineHeight: 24 }}>{board.description}</Text>
        )}

        <View style={{ flexDirection: 'row', marginTop: theme.spacing.lg, gap: theme.spacing.lg }}>
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>Mood</Text>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading }}>{board.accentColor}</Text>
          </View>
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>Itens</Text>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading }}>{board.count}</Text>
          </View>
        </View>

        <View style={{ marginTop: theme.spacing.xl }}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg }}>Itens guardados</Text>
          {relatedProducts.length === 0 && (
            <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.sm }}>
              Este moodboard ainda está vazio. Guarda produtos para ver esta lista aqui.
            </Text>
          )}
          {relatedProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              activeOpacity={0.92}
              onPress={() => handleOpenProduct(product.id)}
              style={{
                flexDirection: 'row',
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                borderRadius: theme.radii.md,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Image source={{ uri: product.image }} style={{ width: 80, height: 80, borderRadius: theme.radii.md, marginRight: theme.spacing.md }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading }}>{product.title}</Text>
                <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{product.subtitle}</Text>
                <Text style={{ color: theme.colors.accentPrimary, marginTop: theme.spacing.xs }}>{product.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleShareMoodboard}
          style={{
            marginTop: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.accentHighlight,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.bodyMedium }}>Partilhar moodboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
