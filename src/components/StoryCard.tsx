import { useTheme } from '@/src/styles';
import { Story } from '@/src/types/content';
import { ImageBackground, Pressable, Text, View } from 'react-native';

const storyAccent = {
  historia: '#662D91',
  cultura: '#F6ED44',
  natureza: '#98CB4F',
} as const;

interface Props {
  story: Story;
  onPress?: (story: Story) => void;
}

export const StoryCard = ({ story, onPress }: Props) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(story)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        backgroundColor: theme.colors.elevatedCard,
        borderRadius: theme.radii.md,
        overflow: 'hidden',
        marginBottom: theme.spacing.md,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <ImageBackground source={{ uri: story.image }} style={{ width: 120, height: 140 }} imageStyle={{ opacity: 0.85 }} />
      <View style={{ flex: 1, padding: theme.spacing.md }}>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radii.pill,
            backgroundColor: storyAccent[story.category],
          }}
        >
          <Text style={{ fontFamily: theme.typography.fonts.bodyMedium, color: theme.colors.black }}>{story.category}</Text>
        </View>
        <Text
          style={{
            color: theme.colors.text,
            fontFamily: theme.typography.fonts.heading,
            fontSize: theme.typography.sizes.lg,
            marginTop: theme.spacing.sm,
          }}
        >
          {story.title}
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{story.date}</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.sm }}>{story.summary}</Text>
      </View>
    </Pressable>
  );
};
