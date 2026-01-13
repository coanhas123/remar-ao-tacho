import { useTheme } from '@/src/styles';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
     
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 2000,
        useNativeDriver: true,
      }),
      
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish();
    });
  }, [scaleAnim, opacityAnim, onFinish]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background || '#000000',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Animated.Image
        source={require('@/assets/Logo/remaraotachologo.png')}
        style={{
          width: 120,
          height: 120,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
        resizeMode="contain"
      />
    </View>
  );
};
