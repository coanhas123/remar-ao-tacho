import { useTheme } from '@/src/styles';
import { Product } from '@/src/types/content';
import { ImageBackground, Pressable, Text, TouchableOpacity, View } from 'react-native';

type ProductCardVariant = 'carousel' | 'feed';

interface Props {
  product: Product;
  onPress?: (product: Product) => void;
  variant?: ProductCardVariant;
}

const categoryAccent = {
  doce: '#F6ED44',
  mar: '#27AAE1',
  tradicional: '#F99D2F',
} as const;

export const ProductCard = ({ product, onPress, variant = 'carousel' }: Props) => {
  const theme = useTheme();
  const isFeedVariant = variant === 'feed';

  return (
    <Pressable
      onPress={() => onPress?.(product)}
      style={({ pressed }) => ({
        width: isFeedVariant ? '100%' : 240,
        marginRight: isFeedVariant ? 0 : theme.spacing.md,
        marginBottom: isFeedVariant ? theme.spacing.md : 0,
        borderRadius: theme.radii.lg,
        overflow: 'hidden',
        backgroundColor: theme.colors.card,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <ImageBackground source={{ uri: product.image }} style={{ height: isFeedVariant ? 200 : 160 }} imageStyle={{ opacity: 0.9 }}>
        <View style={{ flex: 1, justifyContent: 'space-between', padding: theme.spacing.md }}>
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.radii.pill,
              backgroundColor: categoryAccent[product.category],
            }}
          >
            <Text style={{ fontFamily: theme.typography.fonts.bodyMedium, color: theme.colors.black }}>
              {product.category.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontFamily: theme.typography.fonts.display,
                fontSize: theme.typography.sizes.lg,
                color: theme.colors.black,
              }}
            >
              {product.title}
            </Text>
            <Text style={{ color: theme.colors.black, fontFamily: theme.typography.fonts.body }}>{product.subtitle}</Text>
          </View>
        </View>
      </ImageBackground>
      <View style={{ padding: theme.spacing.md }}>
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.sm }}>{product.description}</Text>
        {product.tags?.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
            {product.tags.map((tag) => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  borderRadius: theme.radii.pill,
                  backgroundColor: theme.colors.elevatedCard,
                  marginRight: theme.spacing.xs,
                  marginBottom: theme.spacing.xs,
                }}
              >
                <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.bodyMedium }}>{product.location}</Text>
          <TouchableOpacity
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.accentHighlight,
            }}
          >
            <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.bodyMedium }}>Guardar</Text>
          </TouchableOpacity>
        </View>
        {product.sourceUrl && (
          <Text style={{ color: theme.colors.statusInfo, marginTop: theme.spacing.xs }}>Fonte: Wikipedia</Text>
        )}
      </View>
    </Pressable>
  );
};
