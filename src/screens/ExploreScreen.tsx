import { MoodboardCard, PlaceCard, ProductCard, StoryCard } from '@/src/components';
import { places as fallbackPlaces, products as fallbackProducts, stories as fallbackStories, moodboards } from '@/src/data/mockData';
import { useHeroProducts, usePlacesCatalog, useStoriesFeed } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Moodboard, Place, Product, Story } from '@/src/types/content';
import { createExploreFeed, getDailySeed } from '@/src/utils/exploreFeed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export const ExploreScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const productQuery = useHeroProducts();
  const storiesQuery = useStoriesFeed();
  const placesQuery = usePlacesCatalog(['loja', 'restaurante', 'historico']);
  const productCollection = productQuery.data?.length ? productQuery.data : fallbackProducts;
  const storyCollection = storiesQuery.data?.length ? storiesQuery.data : fallbackStories;
  const placeCollection = placesQuery.data?.length ? placesQuery.data : fallbackPlaces;
  const dailySeed = useMemo(() => getDailySeed(), []);
  const exploreFeed = useMemo(
    () =>
      createExploreFeed(
        {
          products: productCollection,
          stories: storyCollection,
          places: placeCollection,
          moodboards,
        },
        {
          seed: dailySeed.seed,
        },
      ),
    [productCollection, storyCollection, placeCollection, dailySeed.seed],
  );

  const handleOpenProduct = (product: Product) => navigation.navigate('ProductModal', { productId: product.id });
  const handleOpenStory = (story: Story) => navigation.navigate('HistoryDetail', { storyId: story.id });
  const handleOpenMoodboard = (board: Moodboard) => navigation.navigate('MoodboardDetail', { moodboardId: board.id });
  const handleOpenPlace = (_place: Place) => navigation.navigate('Mapa');

  const isAnyQueryLoading = productQuery.isFetching || storiesQuery.isFetching || placesQuery.isFetching;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xxl }}>
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 2 }}>Explorar Aveiro</Text>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.display, fontSize: theme.typography.sizes.xl, marginTop: theme.spacing.xs }}>
            Curadoria de hoje · {dailySeed.label}
          </Text>
          {isAnyQueryLoading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
              <ActivityIndicator color={theme.colors.statusInfo} size="small" />
              <Text style={{ color: theme.colors.textMuted, marginLeft: theme.spacing.xs }}>A atualizar recomendações…</Text>
            </View>
          )}
        </View>

        {exploreFeed.map((entry, index) => {
          const key = `${entry.type}-${index}`;
          return (
            <View key={key} style={{ marginBottom: theme.spacing.lg }}>
              {entry.type === 'product' && (
                <ProductCard product={entry.data} onPress={handleOpenProduct} variant="feed" />
              )}
              {entry.type === 'story' && <StoryCard story={entry.data} onPress={handleOpenStory} />}
              {entry.type === 'place' && <PlaceCard place={entry.data} onPress={handleOpenPlace} />}
              {entry.type === 'moodboard' && <MoodboardCard moodboard={entry.data} onPress={handleOpenMoodboard} variant="feed" />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
