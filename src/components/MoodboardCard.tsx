import { useTheme } from '@/src/styles';
import { Moodboard } from '@/src/types/content';
import { Pressable, Text, View } from 'react-native';

type MoodboardCardVariant = 'carousel' | 'feed';

interface Props {
  moodboard: Moodboard;
  onPress?: (moodboard: Moodboard) => void;
  variant?: MoodboardCardVariant;
}

export const MoodboardCard = ({ moodboard, onPress, variant = 'carousel' }: Props) => {
  const theme = useTheme();
  const isFeedVariant = variant === 'feed';

  return (
    <Pressable
      onPress={() => onPress?.(moodboard)}
      style={({ pressed }) => ({
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.elevatedCard,
        borderRadius: theme.radii.lg,
        marginRight: isFeedVariant ? 0 : theme.spacing.md,
        width: isFeedVariant ? '100%' : 220,
        marginBottom: isFeedVariant ? theme.spacing.md : 0,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.radii.md,
          backgroundColor: moodboard.accentColor,
          marginBottom: theme.spacing.md,
        }}
      />
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: theme.typography.fonts.heading,
          fontSize: theme.typography.sizes.lg,
        }}
      >
        {moodboard.title}
      </Text>
      <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
        {moodboard.count} guardados
      </Text>
      {moodboard.description && (
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.sm }} numberOfLines={2}>
          {moodboard.description}
        </Text>
      )}
      <View
        style={{
          marginTop: theme.spacing.lg,
          paddingVertical: theme.spacing.xs,
          borderBottomColor: theme.colors.accentHighlight,
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ color: theme.colors.accentHighlight, fontFamily: theme.typography.fonts.bodyMedium }}>
          Abrir moodboard
        </Text>
        {moodboard.updatedAt && (
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs, fontSize: theme.typography.sizes.xs }}>
            {moodboard.updatedAt}
          </Text>
        )}
      </View>
    </Pressable>
  );
};
