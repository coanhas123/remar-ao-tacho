import { moodboards } from "@/src/data/mockData";
import { RootStackParamList } from "@/src/navigation";
import { fetchWikipediaTiti } from "@/src/services/wikipediaService";
import { useTheme } from "@/src/styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tipo = {
  title: string;
  description: string;
  extract: string;
  url: string;
  thumbnail: string;
};

export const HomeScreen = () => {
  const theme = useTheme();

  const products = [
    "Tripa de Aveiro",
    "Ovos moles de Aveiro",
    "Cavaca",
    "Bacalhau com natas",
    "Pão de ló de Ovar",
  ];

  const [heroInfo, setHeroInfo] = useState<Tipo | null>(null);

  const [foodData, setFoodData] = useState<Tipo[]>([]);
  const [loading, setIsLoading] = useState<boolean>(false);

  const [favorites, setFavorites] = useState<string[]>([]);

  const [isModalVisible, setModalVisible] = useState(false);

  const safeMoodboards = Array.isArray(moodboards) ? moodboards : [];

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const getWikiImageTiti = async (title: string): Promise<Tipo | null> => {
    try {
      const data = await fetchWikipediaTiti(title);
      return data;
    } catch (error) {
      console.warn("Erro Wiki:", error);
      return null;
    }
  };

  const fetchAllFood = async () => {
    setIsLoading(true);
    try {
      const promises = products.map((product) => getWikiImageTiti(product));
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
      const heroInfo = await getWikiImageTiti(products[0]);

      setHeroInfo(heroInfo);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    function fetchAllData() {
      fetchAllFood();
      fetchHero();
    }
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("ProductModal", {
                        product: heroInfo,
                      })
                    }
                    style={[
                      styles.heroButton,
                      { backgroundColor: theme.colors.accentPrimary },
                    ]}
                  >
                    <Text style={styles.heroButtonText}>Descobrir mais</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <Section title="Apresentação">
          <View style={styles.presentationList}>
            {foodData.map((food, index) => {
              if (index === 0) {
                return;
              }
              return (
                <View key={index} style={{ marginBottom: 30 }}>
                  {food.thumbnail && (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        navigation.navigate("ProductModal", {
                          product: food,
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
                          onPress={() => {
                            setFavorites((prev) => {
                              if (prev.includes(food.title)) {
                                return prev.filter(
                                  (title) => title !== food.title
                                );
                              } else {
                                return [...prev, food.title];
                              }
                            });
                          }}
                        >
                          <Ionicons
                            name={
                              favorites.includes(food.title)
                                ? "heart"
                                : "heart-outline"
                            }
                            size={20}
                            color={
                              favorites.includes(food.title)
                                ? theme.colors.accentPrimary
                                : theme.colors.text
                            }
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                          <Ionicons
                            name="add-circle-outline"
                            size={22}
                            color={theme.colors.text}
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
      </SafeAreaView>

      <Section title="Meus Moodboards">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
        >
          {safeMoodboards.map((board) => (
            <TouchableOpacity
              key={board.id}
              onPress={() =>
                navigation.navigate("MoodboardDetail", {
                  moodboardId: board.id,
                })
              }
              style={[
                styles.moodboardMiniCard,
                { backgroundColor: (board as any).color || theme.colors.card },
              ]}
            >
              <Text style={styles.moodboardTitle}>{board.title}</Text>
              <Ionicons
                name="arrow-forward-circle"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Section>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guardar em:</Text>
            {safeMoodboards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={styles.modalOption}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="folder-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={styles.modalOptionText}>{board.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={{ color: theme.colors.statusAlert }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={{ marginTop: 30, marginBottom: 10 }}>
    <Text
      style={{
        marginLeft: 20,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "white",
      }}
    >
      {title}
    </Text>
    {children}
  </View>
);

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
    marginTop: 10,
  },
  heroButtonText: { fontWeight: "bold", color: "white" },
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 25,
    padding: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    gap: 10,
  },
  modalOptionText: { fontSize: 16, color: "#000" },
  closeBtn: { marginTop: 20, alignSelf: "center" },
});
 