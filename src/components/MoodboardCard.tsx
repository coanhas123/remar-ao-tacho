import { useTheme } from '@/src/styles';
import { Moodboard } from '@/src/types/content';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

  // Grid layout for product thumbnails
  const renderImageGrid = () => {
    const images = (moodboard.products ?? []).slice(0, 4); // Show up to 4 images when available
    if (images.length === 0) {
      return (
        <View style={{ width: 64, height: 64, borderRadius: theme.radii.md, backgroundColor: moodboard.color ?? theme.colors.accentPrimary, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="image-outline" size={32} color="white" />
        </View>
      );
    }
    return (
      <View style={{ width: 64, height: 64, borderRadius: theme.radii.md, overflow: 'hidden', flexDirection: 'row', flexWrap: 'wrap' }}>
        {images.map((product, index) => (
          <Image
            key={index}
            source={{ uri: product.image }}
            style={{ width: '50%', height: '50%' }}
            contentFit="cover"
          />
        ))}
      </View>
    );
  };

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {renderImageGrid()}
        <Ionicons name="arrow-forward" size={24} color={theme.colors.textMuted} />
      </View>
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: theme.typography.fonts.heading,
          fontSize: theme.typography.sizes.lg,
          marginTop: theme.spacing.md,
        }}
      >
        {moodboard.title}
      </Text>
      <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>
        {moodboard.products.length} guardados
      </Text>
    </Pressable>
  );
};
