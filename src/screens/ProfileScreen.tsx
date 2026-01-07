import { products as fallbackProducts, moodboards } from '@/src/data/mockData';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
  const likedProducts = useMemo(() => fallbackProducts.slice(0, 3), []);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync().then(({ status }) => setPermissionStatus(status));
  }, []);

  const handlePickImage = async () => {
    if (permissionStatus && permissionStatus !== ImagePicker.PermissionStatus.GRANTED) {
      const request = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (request.status !== ImagePicker.PermissionStatus.GRANTED) {
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]?.uri ?? null);
    }
  };

  const handleOpenMoodboard = (moodboardId: string) => {
    navigation.navigate('MoodboardDetail', { moodboardId });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85} style={{ borderRadius: theme.radii.lg, overflow: 'hidden' }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 88, height: 88 }} />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.elevatedCard,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.lg }}>AC</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs, marginTop: theme.spacing.xs }}>Atualizar foto</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{ marginLeft: theme.spacing.md }}>
          <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg }}>
            Alice Coan
          </Text>
          <Text style={{ color: theme.colors.textMuted }}>Curadora de sabores • Aveiro</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: theme.spacing.xl }}>
        <Stat label="Produtos guardados" value="32" color={theme.colors.accentPrimary} />
        <Stat label="Moodboards" value={`${moodboards.length}`} color={theme.colors.accentHighlight} />
      </View>
      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg, marginTop: theme.spacing.xl }}>Moodboards</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: theme.spacing.md }}>
        {moodboards.map((board) => (
          <TouchableOpacity
            key={board.id}
            activeOpacity={0.9}
            onPress={() => handleOpenMoodboard(board.id)}
            style={{
              width: '48%',
              marginBottom: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.radii.lg,
              backgroundColor: theme.colors.elevatedCard,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radii.md,
                backgroundColor: board.accentColor,
                marginBottom: theme.spacing.sm,
              }}
            />
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading }}>{board.title}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{board.count} itens</Text>
            {board.updatedAt && <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs, fontSize: theme.typography.sizes.xs }}>{board.updatedAt}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={{
          marginTop: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radii.pill,
          backgroundColor: theme.colors.accentHighlight,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.bodyMedium }}>Criar novo moodboard</Text>
      </TouchableOpacity>

      <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.lg, marginTop: theme.spacing.xl }}>Favoritos recentes</Text>
      {likedProducts.map((product) => (
        <View
          key={product.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.card,
          }}
        >
          <Image source={{ uri: product.image }} style={{ width: 64, height: 64, borderRadius: theme.radii.md, marginRight: theme.spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontFamily: theme.typography.fonts.heading }}>{product.title}</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xs }}>{product.subtitle}</Text>
          </View>
          <Feather name="heart" size={18} color={theme.colors.accentPrimary} />
        </View>
      ))}
    </ScrollView>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const theme = useTheme();

  return (
    <View style={{ marginRight: theme.spacing.lg }}>
      <Text style={{ color, fontFamily: theme.typography.fonts.heading, fontSize: theme.typography.sizes.xl }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
    </View>
  );
};
