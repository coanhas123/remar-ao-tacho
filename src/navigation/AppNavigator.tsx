import { BottomTabBar } from "@/src/components";
import {
  ExploreScreen,
  HistoryDetailScreen,
  HomeScreen,
  MapScreen,
  MoodboardDetailScreen,
  ProductModalScreen,
  ProfileScreen,
} from "@/src/screens";
import { useTheme } from "@/src/styles";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type RootTabParamList = {
  Home: undefined;
  Test: undefined;
  Explorar: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export type RootStackParamList = {
  Tabs: undefined;
  HistoryDetail: { storyId: string };
  ProductModal: {
    product: {
      title: string;
      description: string;
      extract: string;
      url: string;
      thumbnail: string;
    };
  };
  MoodboardDetail: { moodboardId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.typography.fonts.heading },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
          title: "Roteiro Aveiro",
        }}
      />

      <Tab.Screen
        name="Explorar"
        component={ExploreScreen}
        options={{
          tabBarLabel: "Explorar",
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" color={color} size={size} />
          ),
          title: "Explorar",
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
        options={{
          tabBarLabel: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" color={color} size={size} />
          ),
          title: "Mapa Interativo",
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
          title: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductModal"
        component={ProductModalScreen}
        options={{ presentation: "containedModal", headerShown: false }}
      />
      <Stack.Screen
        name="MoodboardDetail"
        component={MoodboardDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
 