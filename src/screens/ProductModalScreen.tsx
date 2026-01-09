import { RootStackParamList } from "@/src/navigation";
import { useTheme } from "@/src/styles";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PModalTestRouteProp = RouteProp<RootStackParamList, "ProductModal">;

export const ProductModalScreen = () => {
  const route = useRoute<PModalTestRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { product } = route.params;

  const theme = useTheme();

  const [isLiked, setIsLiked] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
    >
      {/* Container da imagem hero com altura fixa */}
      <View style={styles.heroImage}>
        <Image
          source={{
            uri: product.thumbnail,
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
              style={styles.iconCircle}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => console.log("Abrir modal moodboard")}
              >
                <Ionicons name="add" size={26} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => setIsLiked(!isLiked)}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? theme.colors.accentPrimary : "black"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={styles.heroTitle}>{product.title}</Text>
            <Text style={styles.heroSubtitle}>
              {product.description
                ? product.description.charAt(0).toUpperCase() +
                  product.description.slice(1)
                : "Doçaria Portuguesa"}
            </Text>
          </View>
        </View>
      </View>

      {/* Conteúdo adicional abaixo da imagem */}
      <View style={{ padding: 20 }}>
        <Text
          style={{ color: theme.colors.text, fontSize: 16, lineHeight: 24 }}
        >
          {product.extract}
        </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  rightActions: { flexDirection: "row", gap: 10 },
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
  // ... resto dos estilos
});
 