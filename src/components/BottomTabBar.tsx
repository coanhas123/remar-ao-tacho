import { useTheme } from '@/src/styles';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';

export const BottomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconColor = isFocused ? theme.colors.black : theme.colors.textMuted;
        const icon =
          typeof options.tabBarIcon === 'function'
            ? options.tabBarIcon({ focused: isFocused, color: iconColor, size: 22 })
            : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ flex: 1 }}
          >
            <View
              style={{
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radii.lg,
                backgroundColor: isFocused ? theme.colors.elevatedCard : 'transparent',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isFocused ? theme.colors.accentPrimary : theme.colors.elevatedCard,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {icon}
              </View>
              <Text
                style={{
                  fontFamily: theme.typography.fonts.heading,
                  fontSize: theme.typography.sizes.sm,
                  color: isFocused ? theme.colors.text : theme.colors.textMuted,
                  letterSpacing: 1,
                }}
              >
                {label as string}
              </Text>
              <View
                style={{
                  marginTop: theme.spacing.xs,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isFocused ? theme.colors.accentPrimary : 'transparent',
                }}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
