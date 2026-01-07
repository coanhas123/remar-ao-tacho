import { MoodboardCard, ProductCard, StoryCard } from '@/src/components';
import { products as fallbackProducts, stories as fallbackStories, heroProduct as heroFallback, moodboards } from '@/src/data/mockData';
import { useHeroProducts, useStoriesFeed } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Moodboard, Product, Story } from '@/src/types/content';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useCallback } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const heroQuery = useHeroProducts();
  const storiesQuery = useStoriesFeed();

  const heroCollection = heroQuery.data?.length ? heroQuery.data : fallbackProducts;
  const heroHighlight = heroCollection[0] ?? heroFallback;
  const storyCollection = storiesQuery.data?.length ? storiesQuery.data : fallbackStories;
  const showHeroLoader = heroQuery.isFetching && !heroQuery.data?.length;
  const showStoriesLoader = storiesQuery.isFetching && !storiesQuery.data?.length;

  const handleOpenProduct = useCallback(
    (product: Product) => {
      navigation.navigate('ProductModal', { productId: product.id });
    },
    [navigation],
  );

  const handleOpenStory = useCallback(
    (story: Story) => {
      navigation.navigate('HistoryDetail', { storyId: story.id });
    },
    [navigation],
  );

  const handleOpenMoodboard = useCallback(
    (board: Moodboard) => {
      navigation.navigate('MoodboardDetail', { moodboardId: board.id });
    },
    [navigation],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: theme.spacing.lg }}>
        <Text
          style={{
            color: theme.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontFamily: theme.typography.fonts.bodyMedium,
          }}
        >
          Aveiro, Portugal
        </Text>
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: theme.typography.fonts.display,
            fontSize: theme.typography.sizes.xxl,
            marginTop: theme.spacing.xs,
          }}
        >
          Sabores em destaque
        </Text>
      </View>

      <View style={{ paddingHorizontal: theme.spacing.lg }}>
        <ImageBackground
          source={{ uri: heroHighlight.image }}
          style={{ height: 260, borderRadius: theme.radii.lg, overflow: 'hidden' }}
          imageStyle={{ borderRadius: theme.radii.lg, opacity: 0.95 }}
        >
          <View style={{ flex: 1, justifyContent: 'space-between', padding: theme.spacing.lg, backgroundColor: 'rgba(3, 5, 10, 0.45)' }}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.white,
              }}
            >
              <Text style={{ fontFamily: theme.typography.fonts.bodyMedium, color: theme.colors.black }}>Em destaque</Text>
            </View>
            <View>
              <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.display, fontSize: theme.typography.sizes.xl }}>
                {heroHighlight.title}
              </Text>
              <Text style={{ color: theme.colors.white, marginTop: theme.spacing.xs }}>{heroHighlight.subtitle}</Text>
              <TouchableOpacity
                onPress={() => handleOpenProduct(heroHighlight)}
                style={{
                  marginTop: theme.spacing.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.radii.pill,
                  backgroundColor: theme.colors.accentPrimary,
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ color: theme.colors.black, fontFamily: theme.typography.fonts.bodyMedium }}>Ver produto</Text>
              </TouchableOpacity>
            </View>
          </View>
          {showHeroLoader && (
            <View style={{ position: 'absolute', top: 16, right: 16 }}>
              <ActivityIndicator color={theme.colors.statusInfo} />
            </View>
          )}
        </ImageBackground>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Section title="Produtos Gastronómicos" isLoading={heroQuery.isFetching} errorMessage={heroQuery.error ? 'Não foi possível atualizar agora.' : undefined}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
            {heroCollection.map((product) => (
              <ProductCard product={product} key={product.id} onPress={handleOpenProduct} />
            ))}
          </ScrollView>
        </Section>

        <Section title="Destaques da Região" isLoading={showStoriesLoader} errorMessage={storiesQuery.error ? 'Histórias indisponíveis de momento.' : undefined}>
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {storyCollection.map((story) => (
              <StoryCard story={story} key={story.id} onPress={handleOpenStory} />
            ))}
          </View>
        </Section>

        <Section title="Moodboards recentes">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
            {moodboards.map((board) => (
              <MoodboardCard moodboard={board} key={board.id} onPress={handleOpenMoodboard} />
            ))}
          </ScrollView>
        </Section>
      </View>
    </ScrollView>
  );
};

interface SectionProps {
  title: string;
  children: ReactNode;
  isLoading?: boolean;
  errorMessage?: string;
}

const Section = ({ title, children, isLoading, errorMessage }: SectionProps) => {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg }}>{title}</Text>
        {isLoading ? (
          <Text style={{ color: theme.colors.statusInfo }}>Atualizando…</Text>
        ) : (
          <Text style={{ color: theme.colors.textMuted }}>Ver tudo</Text>
        )}
      </View>
      {errorMessage && (
        <Text style={{ color: theme.colors.statusAlert, paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.sm }}>{errorMessage}</Text>
      )}
      {children}
    </View>
  );
};
