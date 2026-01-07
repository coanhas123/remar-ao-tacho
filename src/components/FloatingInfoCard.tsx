import { useTheme } from '@/src/styles';
import { Place } from '@/src/types/content';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  place: Place;
}

export const FloatingInfoCard = ({ place }: Props) => {
  const theme = useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: theme.spacing.xl,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.elevatedCard,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontFamily: theme.typography.fonts.heading,
          fontSize: theme.typography.sizes.lg,
        }}
      >
        {place.name}
      </Text>
      <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{place.description}</Text>
      {place.address && (
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>Endereço: {place.address}</Text>
      )}
      {place.tags?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.sm }}>
          {place.tags.slice(0, 4).map((tag) => (
            <View
              key={tag}
              style={{
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: 2,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.elevatedCard,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginRight: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>#{tag.replace(':', '-')}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {place.sourceUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(place.sourceUrl!)} style={{ marginTop: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.statusInfo }} numberOfLines={1}>
            Ver ficha comunitária
          </Text>
        </TouchableOpacity>
      )}
      <Text style={{ color: theme.colors.accentPrimary, marginTop: theme.spacing.sm }}>{place.distance}</Text>
    </View>
  );
};
