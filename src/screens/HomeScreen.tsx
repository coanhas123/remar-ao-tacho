import { AddToMoodboardModal } from "@/src/components";
import { useMoodboards } from "@/src/context";
import { useLikedProducts } from "@/src/hooks";
import { RootStackParamList } from "@/src/navigation";
import { fetchWikipediaTiti } from "@/src/services/wikipediaService";
import { useTheme } from "@/src/styles";
import { Product } from "@/src/types/content";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tipo = {
  title: string;
  description: string;
  extract: string;
  url: string;
  thumbnail: string;
};

const tipoToProduct = (tipo: Tipo): Product => ({
  id: `wiki-${tipo.title.replace(/\s+/g, '-').toLowerCase()}`,
  title: tipo.title,
  subtitle: tipo.description,
  description: tipo.extract,
  image: tipo.thumbnail,
  category: 'tradicional',
  location: 'Aveiro',
  sourceUrl: tipo.url,
});

export const HomeScreen = () => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const avoiroFactsTerms = [
    "Aveiro",
    "Ílhavo",
    "Costa Nova",
    "Ovar",
    "Moliceiro",
    "Estarreja",
    "Vagos",
  ];

  const displayedProducts = useMemo(() => [
    "Tripa de Aveiro",
    "Ovos moles de Aveiro",
    "Cavaca",
    "Bacalhau com natas",
    "Pão de ló de Ovar",
  ], []);
  const [foodData, setFoodData] = useState<Tipo[]>([]);

  const [avoiroFacts, setAviroFacts] = useState<Tipo[]>([]);
  const [isLoadingMoreFacts, setIsLoadingMoreFacts] = useState(false);

  const getWikiImageTiti = async (title: string): Promise<Tipo | null> => {
    try {
      const data = await fetchWikipediaTiti(title);
      return data;
    } catch (error) {
      console.warn("Erro Wiki:", error);
      return null;
    }
  };

  const isFact = (description: string, extract: string): boolean => {
    if (!description && !extract) return false;
    
    const nonFactKeywords = [
      "receita", "prato", "comida", "doçe", "sobremesa", "pão", "bolo",
      "alimento", "cozinha", "culinário"
    ];
    
    const text = (description + " " + extract).toLowerCase();
    const hasFoodKeyword = nonFactKeywords.some(keyword => text.includes(keyword));
    
    return !hasFoodKeyword && text.length > 50;
  };



  const handleLoadMoreFacts = async () => {
    console.log("handleLoadMoreFacts iniciado");
    setIsLoadingMoreFacts(true);
    try {
      const validatedFacts: Tipo[] = [];
      const loadedTitles = avoiroFacts.map(f => f.title); 
      
      console.log("Títulos carregados:", loadedTitles);
      
     
      for (let i = 0; i < 3 && validatedFacts.length < 3; i++) {
        const randomTerm = avoiroFactsTerms[Math.floor(Math.random() * avoiroFactsTerms.length)];
        console.log(`Tentativa ${i + 1}: ${randomTerm}`);
        
        try {
          const results = await fetchWikipediaTiti(randomTerm);
          console.log(`Resultado de ${randomTerm}:`, results?.title);
          
          if (results && results.thumbnail && results.extract && 
              !loadedTitles.includes(results.title) &&
              !validatedFacts.some(f => f.title === results.title)) {
            console.log(`${results.title} é válido, adicionando...`);
            validatedFacts.push(results);
          } else {
            console.log(` ${results?.title} falhou - thumbnail: ${results?.thumbnail}, extract: ${!!results?.extract}, já carregado: ${loadedTitles.includes(results?.title || '')}`);
          }
        } catch (err) {
          console.log(` Erro ao buscar ${randomTerm}:`, err);
          continue;
        }
      }
      
      console.log("Factos validados:", validatedFacts.map(f => f.title));
      
      if (validatedFacts.length > 0) {
        console.log("Atualizando estado com", validatedFacts.length, "factos");
        setAviroFacts(prev => [...prev, ...validatedFacts]);
        
        setTimeout(() => {
          console.log("Fazendo scroll...");
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      } else {
        console.log("Nenhum facto válido foi encontrado");
      }
    } catch (error) {
      console.log(" Erro ao carregar mais factos:", error);
    } finally {
      setIsLoadingMoreFacts(false);
    }
  };
  const [heroInfo, setHeroInfo] = useState<Tipo | null>(null);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [selectedProductForMoodboard, setSelectedProductForMoodboard] = useState<Tipo | null>(null);
  const [isMoodboardModalVisible, setIsMoodboardModalVisible] = useState(false);

  const { moodboards = [], refreshMoodboards } = useMoodboards();
  const { toggleLike, isLiked, refreshLikes } = useLikedProducts();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  
  useEffect(() => {
    if (loading) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading, rotateAnim]);

  useEffect(() => {
    const loadInitialFacts = async () => {
      const initialFactsData: Tipo[] = [];
      for (const factTitle of ["Festas de São Gonçalinho", "Sport Clube Beira-Mar"]) {
        const wikiData = await getWikiImageTiti(factTitle);
        if (wikiData && wikiData.thumbnail && wikiData.extract && 
            isFact(wikiData.description || "", wikiData.extract)) {
          initialFactsData.push(wikiData);
        }
      }
      if (initialFactsData.length > 0) {
        setAviroFacts(initialFactsData);
      }
    };
    loadInitialFacts();
  }, []);

  useEffect(() => {
    const fetchAllFood = async () => {
      setIsLoading(true);
      try {
        const promises = displayedProducts.map((product) => getWikiImageTiti(product));
        const results = await Promise.all(promises);

        const validResults = results.filter(
          (item): item is Tipo => item !== null
        );
        setFoodData(validResults);
      } catch (error) {
        console.warn("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchHero = async () => {
      try {
        const heroInfo = await getWikiImageTiti(displayedProducts[0]);
        setHeroInfo(heroInfo);
      } catch (error) {
        console.log(error);
      }
    };

    function fetchAllData() {
      fetchAllFood();
      fetchHero();
    }
    fetchAllData();
  }, [displayedProducts]);

  useFocusEffect(
    useCallback(() => {
      refreshMoodboards();
      refreshLikes();
    }, [refreshMoodboards, refreshLikes])
  );

  if (loading) {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <Animated.Image
          source={require("@/assets/Logo/remaraotachologo.png")}
          style={{
            width: 100,
            height: 100,
            marginBottom: 20,
            transform: [{ rotate }],
          }}
        />
        <Text style={{ color: theme.colors.text }}>A carregar...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView ref={scrollViewRef} style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SafeAreaView edges={["top"]}>
          <View style={{ padding: theme.spacing.lg }}>
            <Text
              style={[styles.locationLabel, { color: theme.colors.textMuted }]}
            >
              Aveiro, Portugal
            </Text>
            <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
              Sabores em destaque
            </Text>
          </View>

          {heroInfo && (
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <View style={styles.heroImage}>
                <Image
                  source={{
                    uri: heroInfo.thumbnail,
                  }}
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: theme.radii.lg },
                  ]}
                  contentFit="cover"
                />
                <View style={styles.heroOverlay}>
                  <View style={styles.heroTag}>
                    <Text style={styles.heroTagText}>Delicioso</Text>
                  </View>
                  <View>
                    <Text style={styles.heroTitle}>{heroInfo.title}</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("ProductModal", {
                            product: tipoToProduct(heroInfo),
                          })
                        }
                        style={[
                          styles.heroButton,
                          { backgroundColor: theme.colors.accentPrimary },
                        ]}
                      >
                        <Text style={styles.heroButtonText}>Descobrir mais</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          toggleLike({
                            id: `product-${heroInfo.title}-${heroInfo.thumbnail}`,
                            title: heroInfo.title,
                            image: heroInfo.thumbnail,
                            description: heroInfo.description,
                            extract: heroInfo.extract,
                            thumbnail: heroInfo.thumbnail,
                          });
                        }}
                        style={[
                          styles.heroButton,
                          { backgroundColor: theme.colors.accentPrimary, paddingHorizontal: 12 },
                        ]}
                      >
                        <Ionicons 
                          name={
                            isLiked(`product-${heroInfo.title}-${heroInfo.thumbnail}`)
                              ? "heart"
                              : "heart-outline"
                          }
                          size={20} 
                          color="black" 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedProductForMoodboard(heroInfo);
                          setIsMoodboardModalVisible(true);
                        }}
                        style={[
                          styles.heroButton,
                          { backgroundColor: theme.colors.accentPrimary, paddingHorizontal: 12 },
                        ]}
                      >
                        <Ionicons name="add" size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          <Section title="Descobre os teus sabores favoritos">
            <View style={styles.presentationList}>
              {foodData.map((food, index) => {
                if (index === 0) {
                  return null;
                }
                return (
                  <View key={food.title + index} style={{ marginBottom: 10 }}>
                    {food.thumbnail && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("ProductModal", {
                            product: tipoToProduct(food),
                          })
                        }
                        activeOpacity={0.8}
                        style={[
                          styles.presentationCard,
                          { backgroundColor: theme.colors.card },
                        ]}
                      >
                        <Image
                          source={{
                            uri: food.thumbnail,
                          }}
                          style={styles.presentationImage}
                          contentFit="cover"
                          transition={200}
                        />
                        <View style={styles.presentationContent}>
                          <Text
                            style={[
                              styles.presentationTitle,
                              { color: theme.colors.text },
                            ]}
                          >
                            {food.title}
                          </Text>
                          <Text
                            style={[
                              styles.presentationSubtitle,
                              { color: theme.colors.textMuted },
                            ]}
                            numberOfLines={2}
                          >
                            {food.description
                              ? food.description.charAt(0).toUpperCase() +
                                food.description.slice(1)
                              : "Doçaria Portuguesa"}
                          </Text>
                        </View>
                        <View style={styles.presentationActions}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleLike({
                                id: `product-${food.title}-${food.thumbnail}`,
                                title: food.title,
                                image: food.thumbnail,
                                description: food.description,
                                extract: food.extract,
                                thumbnail: food.thumbnail,
                              });
                            }}
                          >
                            <Ionicons
                              name={
                                isLiked(`product-${food.title}-${food.thumbnail}`)
                                  ? "heart"
                                  : "heart-outline"
                              }
                              size={20}
                              color={theme.colors.accentPrimary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              setSelectedProductForMoodboard(food);
                              setIsMoodboardModalVisible(true);
                            }}
                          >
                            <Ionicons
                              name="add-circle-outline"
                              size={22}
                              color={theme.colors.accentPrimary}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>

          </Section>

          <Section title="Descobre mais sobre Aveiro">
            <View style={styles.presentationList}>
              {avoiroFacts
                .filter(fact => fact.thumbnail)
                .map((fact, index) => (
                <View key={fact.title + index} style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductModal", {
                        product: tipoToProduct(fact),
                      })
                    }
                    activeOpacity={0.8}
                    style={[
                      styles.presentationCard,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    {fact.thumbnail && (
                      <Image
                        source={{
                          uri: fact.thumbnail,
                        }}
                        style={styles.presentationImage}
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                    <View style={styles.presentationContent}>
                      <Text
                        style={[
                          styles.presentationTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        {fact.title}
                      </Text>
                      <Text
                        style={[
                          styles.presentationSubtitle,
                          { color: theme.colors.textMuted },
                        ]}
                        numberOfLines={2}
                      >
                        {fact.description || fact.extract}
                      </Text>
                    </View>
                    <View style={styles.presentationActions}>
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedProductForMoodboard(fact);
                          setIsMoodboardModalVisible(true);
                        }}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={22}
                          color={theme.colors.accentPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleLoadMoreFacts}
              disabled={isLoadingMoreFacts}
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                padding: 12,
                backgroundColor: theme.colors.accentPrimary,
                borderRadius: 20,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16 }}>
                {isLoadingMoreFacts ? 'A carregar...' : '+ Gerar mais factos'}
              </Text>
            </TouchableOpacity>
          </Section>

          {moodboards.length > 0 && (
            <Section title="Meus Moodboards">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
              >
                {moodboards.map((board) => {
                  const hasImage = board.coverImage || (board.products && board.products.length > 0);
                  return (
                  <TouchableOpacity
                    key={board.id}
                    onPress={() =>
                      navigation.navigate("MoodboardDetail", {
                        moodboardId: board.id,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    {hasImage ? (
                      <View style={[styles.moodboardMiniCard, { overflow: 'hidden', position: 'relative' }]}>
                        <Image
                          source={{ uri: board.coverImage || board.products[0]?.image }}
                          style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.lg }]}
                          contentFit="cover"
                        />
                        <View style={{ flex: 1, justifyContent: 'space-between', padding: 15, position: 'relative' }}>
                          <View style={{ position: 'absolute', top: theme.spacing.md, right: theme.spacing.md, backgroundColor: theme.colors.accentPrimary, borderRadius: 50, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="chevron-forward" size={16} color="black" />
                          </View>
                          <Text style={[styles.moodboardTitle, { color: 'white', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }]} numberOfLines={2}>
                            {board.title}
                          </Text>
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                              {board.products.length} {board.products.length === 1 ? 'item' : 'itens'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.moodboardMiniCard,
                          { backgroundColor: board.products && board.products.length === 0 ? theme.colors.accentPrimary : (board.color || theme.colors.card) },
                          { justifyContent: 'space-between', padding: 15, position: 'relative' }
                        ]}
                      >
                        <View style={{ position: 'absolute', top: theme.spacing.md, right: theme.spacing.md, backgroundColor: 'black', borderRadius: 50, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="chevron-forward" size={16} color="white" />
                        </View>
                        <Text style={[styles.moodboardTitle, { color: board.products && board.products.length === 0 ? 'black' : theme.colors.text }]} numberOfLines={2}>
                          {board.title}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                            {board.products ? board.products.length : 0} {(board.products ? board.products.length : 0) === 1 ? 'item' : 'itens'}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Section>
          )}
        </SafeAreaView>
      </ScrollView>

      <AddToMoodboardModal
        visible={isMoodboardModalVisible}
        productId={selectedProductForMoodboard?.title || ''}
        productTitle={selectedProductForMoodboard?.title || ''}
        productImage={selectedProductForMoodboard?.thumbnail}
        productLocation="Aveiro, Portugal"
        productDescription={selectedProductForMoodboard?.description}
        productExtract={selectedProductForMoodboard?.extract}
        onClose={async () => {
          setIsMoodboardModalVisible(false);
          setSelectedProductForMoodboard(null);
          await refreshMoodboards();
        }}
      />
    </>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  
  return (
    <View style={{ marginTop: 30, marginBottom: 10 }}>
      <Text
        style={{
          marginLeft: 20,
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 15,
          color: theme.colors.text,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  locationLabel: { textTransform: "uppercase", letterSpacing: 2, fontSize: 10 },
  mainTitle: { fontSize: 32, fontWeight: "bold", marginTop: 4 },
  heroImage: { height: 280, overflow: "hidden" },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "space-between",
  },
  heroTag: {
    backgroundColor: "white",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroTagText: { fontSize: 10, fontWeight: "bold", color: "#000" },
  heroTitle: { color: "white", fontSize: 28, fontWeight: "bold" },
  heroButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  heroButtonText: { fontWeight: "bold", color: "black" },
  presentationList: { paddingHorizontal: 20 },
  presentationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
  },
  presentationImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginRight: 14,
  },
  presentationContent: { flex: 1 },
  presentationTitle: { fontSize: 18, fontWeight: "700" },
  presentationSubtitle: { fontSize: 14, marginTop: 4 },
  presentationActions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    gap: 8,
  },
  moodboardMiniCard: {
    width: 160,
    height: 100,
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    justifyContent: "space-between",
  },
  moodboardTitle: { fontWeight: "bold", fontSize: 16 },
});