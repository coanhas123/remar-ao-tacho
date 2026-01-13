import { BottomTabBar } from "@/src/components";
import {
  // ExploreScreen,
  HomeScreen,
  MapScreen,
  MoodboardDetailScreen,
  ProductModalScreen,
  ProfileScreen,
  SplashScreen,
} from "@/src/screens";
import { useTheme } from "@/src/styles";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { Image, View } from "react-native";

export type RootTabParamList = {
  Home: undefined;
  Test: undefined;
  Explorar: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export type RootStackParamList = {
  Splash: undefined;
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
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          options={{ animationEnabled: false }}
        >
          {() => <SplashScreen onFinish={() => setShowSplash(false)} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: theme.colors.background },
        headerTitle: () => (
          <View style={{ paddingVertical: 16 }}>
            <Image
              source={require('../../assets/Logo/remaraotachologo.png')}
              style={{ width: 130, height: 80, paddingVertical: 14, paddingHorizontal: 15 }}
              resizeMode="contain"
            />
          </View>
        ),
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
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
 