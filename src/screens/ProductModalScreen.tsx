import { RootStackParamList } from "@/src/navigation";
import { useTheme } from "@/src/styles";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PModalTestRouteProp = RouteProp<RootStackParamList, "ProductModal">;

const fetchWikipediaData = async (productTitle: string) => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(productTitle)}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      extract: data.extract || '',
      image: data.thumbnail?.source || '',
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title || productTitle)}`,
      wikiTitle: data.title || '',
      description: data.description || '',
    };
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
    return null;
  }
};

export const ProductModalScreen = () => {
  const route = useRoute<PModalTestRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { product } = route.params;
  

  const theme = useTheme();

  const [wikiData, setWikiData] = useState<any>(null);

  useEffect(() => {
    const loadWikipediaData = async () => {
      // Se o produto já vem com dados do Wikipedia, usar esses
      if (product.description) {
        setWikiData({
          extract: product.description,
          description: product.description,
          image: product.image,
          sourceUrl: product.sourceUrl,
          wikiTitle: product.title,
        });
      } else {
        // Caso contrário, fazer fetch
        const data = await fetchWikipediaData(product.title);
        if (data) {
          setWikiData(data);
        }
      }
    };

    loadWikipediaData();
  }, [product, product.title]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
    >
     
      <View style={styles.heroImage}>
        <Image
          source={{
            uri: product.image,
            headers: {
              "User-Agent": "RemarAoTacho/1.0 (contact: info@remaraotacho.com)",
            },
          }}
          style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.lg }]}
          contentFit="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.iconCircle, { backgroundColor: theme.colors.accentPrimary }]}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={styles.heroTitle}>{product.title}</Text>
            <Text style={styles.heroSubtitle}>
              {wikiData?.description || product.description || "Doçaria Portuguesa"}
            </Text>
          </View>
        </View>
      </View>

    
      <View style={{ padding: 20 }}>
        {(wikiData?.extract || product.description) && (
          <Text style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24, marginTop: 12 }}>
            {wikiData?.extract || product.description}
          </Text>
        )}

   
        {wikiData?.sourceUrl && (
          <TouchableOpacity 
            onPress={() => Linking.openURL(wikiData.sourceUrl)}
            style={[styles.sourceButton, { backgroundColor: theme.colors.accentPrimary, marginTop: 20 }]}
          >
            <Ionicons name="open-outline" size={16} color="black" style={{ marginRight: 8 }} />
            <Text style={{ color: 'black', fontWeight: '600' }}>
              Ver no Wikipedia
            </Text>
          </TouchableOpacity>
        )}

     
        {(product as any).location && (
          <View style={styles.locationSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Localização
            </Text>
            <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
               {(product as any).location}
            </Text>
          </View>
        )}

        {/* Tags/Categorias */}
        {(product as any).tags && (product as any).tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Categorias
            </Text>
            <View style={styles.tagsList}>
              {(product as any).tags.map((tag: string, index: number) => (
                <View 
                  key={index}
                  style={[styles.tag, { backgroundColor: theme.colors.accentPrimary }]}
                >
                  <Text style={{ color: 'black', fontSize: 12 }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroImage: {
    height: 350,
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 20,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: { color: "white", fontSize: 28, fontWeight: "bold" },
  heroSubtitle: { color: "white", fontSize: 16, marginTop: 5, opacity: 0.9 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wikiSection: {
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  wikiText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sourceButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsSection: {
    marginTop: 20,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  locationSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 8,
  },
});
 