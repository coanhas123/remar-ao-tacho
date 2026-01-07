import { SecondaryTab } from '@/src/hooks/useSecondaryTabs';
import { useTheme } from '@/src/styles';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  tabs: readonly SecondaryTab[];
  activeTab: SecondaryTab;
  onChange: (tab: SecondaryTab) => void;
}

export const SecondaryTabBar = ({ tabs, activeTab, onChange }: Props) => {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            style={{ marginRight: theme.spacing.lg }}
          >
            <View>
              <Text
                style={{
                  color: isActive ? theme.colors.accentPrimary : theme.colors.textMuted,
                  fontFamily: theme.typography.fonts.heading,
                  fontSize: theme.typography.sizes.md,
                }}
              >
                {tab}
              </Text>
              <View
                style={{
                  height: 2,
                  backgroundColor: isActive ? theme.colors.accentPrimary : 'transparent',
                  marginTop: theme.spacing.xs,
                }}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
