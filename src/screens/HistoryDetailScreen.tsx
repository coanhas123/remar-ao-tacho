import { useStoryDetail } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Paragraph = ({ children }: { children: string }) => {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.md, lineHeight: 24, marginBottom: theme.spacing.md }}>{children}</Text>
  );
};

export const HistoryDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HistoryDetail'>>();
  const { storyId } = route.params;
  const storyQuery = useStoryDetail(storyId);
  const story = storyQuery.data;

  const paragraphs = (story?.summary ?? '').split('\n').filter(Boolean);

  const handleOpenSource = async () => {
    if (story?.sourceUrl) {
      await WebBrowser.openBrowserAsync(story.sourceUrl);
    }
  };

  if (storyQuery.isLoading && !story) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.statusInfo} />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.textMuted }}>História não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ImageBackground source={{ uri: story.image }} style={{ height: 280 }} imageStyle={{ opacity: 0.75 }}>
        <View style={{ flex: 1, justifyContent: 'space-between', padding: theme.spacing.lg, backgroundColor: 'rgba(4,6,9,0.35)' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', paddingVertical: theme.spacing.xs }}>
            <Text style={{ color: theme.colors.white }}>Voltar</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.display, fontSize: theme.typography.sizes.xl }}>{story.title}</Text>
            <Text style={{ color: theme.colors.white, marginTop: theme.spacing.xs }}>{story.date}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={{ padding: theme.spacing.lg }}>
        <Text
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radii.pill,
            backgroundColor: theme.colors.elevatedCard,
            color: theme.colors.text,
            fontFamily: theme.typography.fonts.bodyMedium,
            marginBottom: theme.spacing.md,
          }}
        >
          {story.category.toUpperCase()}
        </Text>

        {paragraphs.length
          ? paragraphs.map((text, index) => <Paragraph key={`${story.id}-${index}`}>{text}</Paragraph>)
          : <Paragraph>{story.summary}</Paragraph>}

        {story.mediaAttribution && (
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.sm }}>Fonte de imagem: {story.mediaAttribution}</Text>
        )}

        {story.sourceUrl && (
          <TouchableOpacity
            onPress={handleOpenSource}
            style={{
              marginTop: theme.spacing.xl,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.accentHighlight,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.bodyMedium }}>Ler artigo completo</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
