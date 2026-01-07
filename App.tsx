import { queryClient } from '@/src/config/queryClient';
import { AppNavigator } from '@/src/navigation';
import { ThemeProvider, createNavigationTheme, useTheme } from '@/src/styles';
import { Sora_400Regular, Sora_500Medium } from '@expo-google-fonts/sora';
import {
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => null);

const RootNavigation = () => {
  const theme = useTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    Sora_400Regular,
    Sora_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
