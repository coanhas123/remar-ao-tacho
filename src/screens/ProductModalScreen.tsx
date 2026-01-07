import { useProductDetail } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { useTheme } from '@/src/styles';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const ProductModalScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductModal'>>();
  const { productId } = route.params;
  const productQuery = useProductDetail(productId);
  const product = productQuery.data;

  const handleOpenSource = async () => {
    if (product?.sourceUrl) {
      await WebBrowser.openBrowserAsync(product.sourceUrl);
    }
  };

  if (productQuery.isLoading && !product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.statusInfo} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.textMuted }}>Produto indisponível.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.md }}>
          <Text style={{ color: theme.colors.accentPrimary }}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
      <ImageBackground source={{ uri: product.image }} style={{ height: 300 }} imageStyle={{ opacity: 0.85 }}>
        <View style={{ flex: 1, justifyContent: 'space-between', padding: theme.spacing.lg, backgroundColor: 'rgba(5,7,9,0.4)' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', paddingVertical: theme.spacing.xs }}>
            <Text style={{ color: theme.colors.white }}>Fechar</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: theme.colors.white, fontFamily: theme.typography.fonts.display, fontSize: theme.typography.sizes.xl }}>{product.title}</Text>
            <Text style={{ color: theme.colors.white, marginTop: theme.spacing.xs }}>{product.subtitle}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={{ padding: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.accentPrimary,
              marginRight: theme.spacing.sm,
            }}
          >
            <Text style={{ color: theme.colors.black, fontFamily: theme.typography.fonts.bodyMedium }}>{product.category.toUpperCase()}</Text>
          </View>
          {product.tags?.map((tag) => (
            <View
              key={tag}
              style={{
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 2,
                borderRadius: theme.radii.pill,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginRight: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.xs }}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.md, lineHeight: 24 }}>{product.description}</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.md }}>Onde provar: {product.location}</Text>

        {product.sourceUrl && (
          <TouchableOpacity
            onPress={handleOpenSource}
            style={{
              marginTop: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radii.pill,
              backgroundColor: theme.colors.accentPrimary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.black, fontFamily: theme.typography.fonts.bodyMedium }}>Ver artigo na Wikipedia</Text>
          </TouchableOpacity>
        )}

        {product.imageAttribution && (
          <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.sm }}>Créditos: {product.imageAttribution}</Text>
        )}
      </View>
    </ScrollView>
  );
};
