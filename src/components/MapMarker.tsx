import { useTheme } from '@/src/styles';
import { PlaceType } from '@/src/types/content';
import { Text, View } from 'react-native';
import { LatLng, MapMarkerProps, Marker } from 'react-native-maps';

const markerColors: Record<PlaceType, string> = {
  loja: '#F6ED44',
  restaurante: '#F99D2F',
  historico: '#662D91',
};

interface Props extends Omit<MapMarkerProps, 'coordinate'> {
  coordinate: LatLng;
  label: string;
  type: PlaceType;
}

export const MapMarker = ({ coordinate, label, type, ...markerProps }: Props) => {
  const theme = useTheme();
  const color = markerColors[type];

  return (
    <Marker coordinate={coordinate} {...markerProps}>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: color,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.radii.pill,
          }}
        >
          <Text style={{ color: theme.colors.black, fontFamily: theme.typography.fonts.bodyMedium }}>{label}</Text>
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: color,
          }}
        />
      </View>
    </Marker>
  );
};
