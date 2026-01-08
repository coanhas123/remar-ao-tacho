import { useTheme } from '@/src/styles';
import { PlaceType } from '@/src/types/content';
import { View } from 'react-native';
import { LatLng, MapMarkerProps, Marker } from 'react-native-maps';
// Exemplo usando Lucide, mas podes usar MaterialIcons ou FontAwesome
import { Landmark, ShoppingBag, Utensils } from 'lucide-react-native';

const markerColors: Record<PlaceType, string> = {
  loja: '#F6ED44',      // Amarelo
  restaurante: '#F99D2F', // Laranja
  historico: '#662D91',   // Roxo
};

// Função para escolher o ícone com base na categoria
const getIcon = (type: PlaceType, color: string) => {
  const size = 18;
  switch (type) {
    case 'restaurante': return <Utensils color={color} size={size} />;
    case 'loja': return <ShoppingBag color={color} size={size} />;
    case 'historico': return <Landmark color="#FFFFFF" size={size} />; // Branco no roxo para contraste
    default: return null;
  }
};

interface Props extends Omit<MapMarkerProps, 'coordinate'> {
  coordinate: LatLng;
  type: PlaceType;
  onPress?: () => void; // Para abrir a card ao clicar
}

export const MapMarker = ({ coordinate, type, onPress, ...markerProps }: Props) => {
  const theme = useTheme();
  const backgroundColor = markerColors[type];
  const iconColor = type === 'historico' ? '#FFFFFF' : theme.colors.black;

  return (
    <Marker 
      coordinate={coordinate} 
      onPress={onPress} 
      tracksViewChanges={false} // Melhora a performance do mapa
      {...markerProps}
    >
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* O "Pino" com Ícone */}
        <View
          style={{
            backgroundColor: backgroundColor,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4, // Sombra no Android
            shadowColor: '#000', // Sombra no iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          {getIcon(type, iconColor)}
        </View>
        
        {/* A pontinha do marcador (Triângulo) */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: backgroundColor,
            marginTop: -1, // Faz o triângulo encaixar no círculo
          }}
        />
      </View>
    </Marker>
  );
};