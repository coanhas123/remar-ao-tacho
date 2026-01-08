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
  const dailySeed = useMemo(() => getDailySeed(), []);
  const exploreFeed = useMemo(() => {
    const products = productQuery.data?.length ? productQuery.data : fallbackProducts || [];
    const stories = storiesQuery.data?.length ? storiesQuery.data : fallbackStories || [];
    const places = placesQuery.data?.length ? placesQuery.data : fallbackPlaces || [];

    return createExploreFeed(
      {
        products,
        stories,
        places,
        moodboards,
      },
      {
        seed: dailySeed.seed,
      },
    ) || [];
  }, [productQuery.data, storiesQuery.data, placesQuery.data, dailySeed.seed]);
  const safeExploreFeed = Array.isArray(exploreFeed) ? exploreFeed : [];

  const handleOpenProduct = (product: Product) => navigation.navigate('ProductModal', { productId: product.id });
  const handleOpenStory = (story: Story) => navigation.navigate('HistoryDetail', { storyId: story.id });
  const handleOpenMoodboard = (board: Moodboard) => navigation.navigate('MoodboardDetail', { moodboardId: board.id });
  const handleOpenPlace = (_place: Place) => navigation.navigate('Tabs');

  const isAnyQueryLoading = productQuery.isFetching || storiesQuery.isFetching || placesQuery.isFetching;
  const isLoadingState = isAnyQueryLoading && !safeExploreFeed.length;

  if (isLoadingState) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.statusInfo} size="large" />
      </View>
    );
  }

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

        {(safeExploreFeed ?? []).map((entry, index) => {
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
