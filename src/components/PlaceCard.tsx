import { useTheme } from '@/src/styles';
import { Place } from '@/src/types/content';
import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  place: Place;
  onPress?: (place: Place) => void;
}

const placeTypeLabels: Record<Place['type'], string> = {
  restaurante: 'Restaurante',
  historico: 'Património',
};

export const PlaceCard = ({ place, onPress }: Props) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(place)}
      style={{
        padding: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.elevatedCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.accentSecondary,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing.md,
        }}
      >
        <Feather name="map-pin" size={22} color={theme.colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>{placeTypeLabels[place.type]}</Text>
        <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.md }}>
          {place.name}
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }} numberOfLines={2}>
          {place.description}
        </Text>
        {place.distance && (
          <Text style={{ color: theme.colors.accentPrimary, marginTop: theme.spacing.xs }}>{place.distance}</Text>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};
