import { useProductDetail } from '@/src/hooks/useContentQueries';
import { RootStackParamList } from '@/src/navigation';
import { DEFAULT_IMAGE } from '@/src/services/contentGateway';
import { useTheme } from '@/src/styles';
import { Ionicons } from '@expo/vector-icons'; // Importar ícones
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react'; // Adicionado useState
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const resolveImageSource = (value?: string | null): string => {
  if (!value || typeof value !== 'string') return DEFAULT_IMAGE;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('<')) {
    return DEFAULT_IMAGE;
  }
  return trimmed;
};

export const ProductModalScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductModal'>>();
  const { productId } = route.params;
  const productQuery = useProductDetail(productId);
  const product = productQuery.data;

  // Estado local para o Like (em prod isto viria de um Context ou DB)
  const [isLiked, setIsLiked] = useState(false);

  const handleOpenSource = async () => {
    if (product?.sourceUrl) {
      await WebBrowser.openBrowserAsync(product.sourceUrl);
    }
  };

  if (productQuery.isLoading && !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.statusInfo} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textMuted }}>Produto indisponível.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.md }}>
          <Text style={{ color: theme.colors.accentPrimary }}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
      
      {/* HEADER COM IMAGEM E ÍCONES DE AÇÃO */}
      <ImageBackground source={{ uri: resolveImageSource(product.image) }} style={styles.heroImage}>
        <View style={styles.heroOverlay}>
          {/* BARRA DE TOPO DO MODAL */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            
            <View style={styles.rightActions}>
              {/* ÍCONE DE MOODBOARD */}
              <TouchableOpacity style={styles.iconCircle} onPress={() => console.log("Abrir modal moodboard")}>
                <Ionicons name="add" size={26} color="black" />
              </TouchableOpacity>
              
              {/* ÍCONE DE LIKE */}
              <TouchableOpacity style={styles.iconCircle} onPress={() => setIsLiked(!isLiked)}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#FF5252" : "black"} />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={styles.heroTitle}>{product.title}</Text>
            <Text style={styles.heroSubtitle}>{product.subtitle}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={{ padding: theme.spacing.lg }}>
        {/* TAGS */}
        <View style={styles.tagRow}>
          <View style={[styles.categoryTag, { backgroundColor: theme.colors.accentPrimary }]}>
            <Text style={styles.categoryText}>{product.category.toUpperCase()}</Text>
          </View>
          {product.tags?.map((tag) => (
            <View key={tag} style={[styles.tag, { borderColor: theme.colors.border }]}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* DESCRIÇÃO */}
        <Text style={[styles.description, { color: theme.colors.text }]}>{product.description}</Text>
        
        <View style={styles.locationBox}>
          <Ionicons name="location-outline" size={18} color={theme.colors.textMuted} />
          <Text style={{ color: theme.colors.textMuted, marginLeft: 5 }}>Onde provar: {product.location}</Text>
        </View>

        {/* BOTÃO WIKIPEDIA (MAIS DISCRETO) */}
        {product.sourceUrl && (
          <TouchableOpacity onPress={handleOpenSource} style={[styles.wikiBtn, { backgroundColor: '#eee' }]}>
            <Ionicons name="globe-outline" size={20} color="black" />
            <Text style={styles.wikiBtnText}>Ler mais na Wikipedia</Text>
          </TouchableOpacity>
        )}

        {product.imageAttribution && (
          <Text style={styles.attribution}>Créditos: {product.imageAttribution}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { height: 350 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', padding: 20, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  rightActions: { flexDirection: 'row', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  heroSubtitle: { color: 'white', fontSize: 16, marginTop: 5, opacity: 0.9 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  categoryTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { fontSize: 10, fontWeight: 'bold' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  description: { fontSize: 16, lineHeight: 26 },
  locationBox: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  wikiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 30, padding: 15, borderRadius: 15 },
  wikiBtnText: { fontWeight: '600' },
  attribution: { color: '#aaa', fontSize: 10, marginTop: 20, textAlign: 'center' }
});